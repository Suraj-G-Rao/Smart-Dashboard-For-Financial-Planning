'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { formatINR } from '@/lib/format';
import { Building2, Plus, Edit, Trash2, TrendingUp, TrendingDown, RefreshCw, Eye } from 'lucide-react';
import { z } from 'zod';

const assetSchema = z.object({
  type: z.string().min(1, 'Asset type is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  purchase_price: z.string().min(1, 'Purchase price is required'),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unit: z.string().optional(),
});

interface Asset {
  id: string;
  type: string;
  name: string;
  description?: string;
  location?: string;
  purchase_price: number;
  purchase_date: string;
  quantity: number;
  unit?: string;
  current_value: number;
  value_last_updated: string;
  documents?: string[];
}

const assetTypes = [
  { value: 'land', label: 'Land' },
  { value: 'flat', label: 'Flat/Apartment' },
  { value: 'house', label: 'House' },
  { value: 'building', label: 'Commercial Building' },
  { value: 'gold', label: 'Gold' },
  { value: 'silver', label: 'Silver' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'stock', label: 'Stocks/Mutual Funds' },
  { value: 'other', label: 'Other' },
];

const units = [
  { value: 'g', label: 'Grams (g)' },
  { value: 'sqft', label: 'Square Feet (sqft)' },
  { value: 'acre', label: 'Acres' },
  { value: 'nos', label: 'Numbers' },
  { value: 'units', label: 'Units' },
];

export default function AssetsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    description: '',
    location: '',
    purchase_price: '',
    purchase_date: '',
    quantity: '1',
    unit: 'nos',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const validated = assetSchema.parse(formData);

      const payload = {
        ...validated,
        ...(editingAsset && { id: editingAsset.id }),
        purchase_price: parseFloat(validated.purchase_price),
        quantity: parseFloat(validated.quantity),
      };

      const response = await fetch('/api/assets/upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save asset');
      }

      toast({
        title: 'Success',
        description: editingAsset ? 'Asset updated successfully' : 'Asset added successfully',
      });

      setIsModalOpen(false);
      resetForm();
      fetchAssets();
    } catch (error: any) {
      console.error('Error saving asset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save asset',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const response = await fetch('/api/assets/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete asset');
      }

      toast({
        title: 'Success',
        description: 'Asset deleted successfully',
      });

      fetchAssets();
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete asset',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateValue = async (id: string) => {
    try {
      toast({
        title: 'Updating...',
        description: 'Calculating asset value with AI',
      });

      const response = await fetch('/api/assets/value-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update value');
      }

      toast({
        title: 'Success',
        description: `Value updated to ${formatINR(result.data.current_value)}`,
      });

      fetchAssets();
    } catch (error: any) {
      console.error('Error updating value:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update value',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      type: asset.type,
      name: asset.name,
      description: asset.description || '',
      location: asset.location || '',
      purchase_price: asset.purchase_price.toString(),
      purchase_date: asset.purchase_date,
      quantity: asset.quantity.toString(),
      unit: asset.unit || 'nos',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingAsset(null);
    setFormData({
      type: '',
      name: '',
      description: '',
      location: '',
      purchase_price: '',
      purchase_date: '',
      quantity: '1',
      unit: 'nos',
    });
  };

  const calculateAppreciation = (asset: Asset) => {
    const growth = ((asset.current_value - asset.purchase_price) / asset.purchase_price) * 100;
    return growth;
  };

  const totalValue = assets.reduce((sum, asset) => sum + (asset.current_value || asset.purchase_price), 0);
  const totalInvestment = assets.reduce((sum, asset) => sum + asset.purchase_price, 0);
  const totalGrowth = totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Building2 className="h-10 w-10 text-blue-600" />
            Assets
          </h1>
          <p className="text-muted-foreground mt-2">Track your real estate, gold, vehicles, and other assets</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Asset Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., My Apartment"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional details"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, area, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Purchase Price (₹) *</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date *</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingAsset ? 'Update Asset' : 'Add Asset'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Asset Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatINR(totalValue)}</div>
            <p className="text-xs text-muted-foreground mt-2">{assets.length} assets tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatINR(totalInvestment)}</div>
            <p className="text-xs text-muted-foreground mt-2">Purchase cost</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold flex items-center gap-2 ${totalGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGrowth >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              {totalGrowth >= 0 ? '+' : ''}{totalGrowth.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatINR(totalValue - totalInvestment)} {totalGrowth >= 0 ? 'gain' : 'loss'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No assets added yet</p>
              <p className="text-sm text-muted-foreground mb-6">Add your first asset to start tracking your net worth</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Asset
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Asset</th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-muted-foreground">Type</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Purchase Price</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Current Value</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Growth</th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const growth = calculateAppreciation(asset);
                    return (
                      <tr key={asset.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium">{asset.name}</p>
                            {asset.location && (
                              <p className="text-xs text-muted-foreground">{asset.location}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {assetTypes.find(t => t.value === asset.type)?.label || asset.type}
                          </span>
                        </td>
                        <td className="text-right py-4 px-4 font-medium">{formatINR(asset.purchase_price)}</td>
                        <td className="text-right py-4 px-4 font-medium">{formatINR(asset.current_value || asset.purchase_price)}</td>
                        <td className="text-right py-4 px-4">
                          <span className={`font-medium flex items-center justify-end gap-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {growth >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {growth >= 0 ? '+' : ''}{growth.toFixed(2)}%
                          </span>
                        </td>
                        <td className="text-right py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateValue(asset.id)}
                              title="Update value with AI"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(asset)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(asset.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
