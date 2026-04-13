'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Target } from 'lucide-react'
import { formatINR } from '@/lib/utils'

interface CreateGoalDialogProps {
  onGoalCreated: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  suggestionData?: any
}

export default function CreateGoalDialog({ onGoalCreated, open: externalOpen, onOpenChange: externalOnOpenChange, suggestionData }: CreateGoalDialogProps) {
  const { toast } = useToast()
  const [internalOpen, setInternalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    saved_amount: '',
    priority: '2',
    monthly_sip_required: '',
    description: '',
    category: 'General',
  })

  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = externalOnOpenChange || setInternalOpen

  // Pre-fill form when suggestion data is provided
  useEffect(() => {
    if (suggestionData) {
      const targetDate = new Date()
      targetDate.setMonth(targetDate.getMonth() + (suggestionData.duration || 12))

      setFormData({
        name: suggestionData.name || '',
        target_amount: suggestionData.targetAmount?.toString() || '',
        target_date: targetDate.toISOString().split('T')[0],
        saved_amount: '0',
        priority: suggestionData.priority === 'high' ? '1' : suggestionData.priority === 'low' ? '3' : '2',
        monthly_sip_required: suggestionData.monthlyContribution?.toString() || '',
        description: suggestionData.reason || '',
        category: suggestionData.category?.charAt(0).toUpperCase() + suggestionData.category?.slice(1) || 'General',
      })
    }
  }, [suggestionData])

  const categories = [
    'General',
    'Emergency',
    'Retirement',
    'Real Estate',
    'Education',
    'Travel',
    'Vehicle',
    'Investment',
    'Health',
    'Wedding',
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const calculateMonthlySIP = () => {
    const targetAmount = parseFloat(formData.target_amount) || 0
    const savedAmount = parseFloat(formData.saved_amount) || 0
    const targetDate = new Date(formData.target_date)
    const now = new Date()

    if (targetAmount <= 0 || targetDate <= now) return 0

    const monthsLeft = (targetDate.getFullYear() - now.getFullYear()) * 12 +
      (targetDate.getMonth() - now.getMonth())

    if (monthsLeft <= 0) return targetAmount - savedAmount

    return Math.ceil((targetAmount - savedAmount) / monthsLeft)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date,
        saved_amount: parseFloat(formData.saved_amount) || 0,
        priority: parseInt(formData.priority),
        monthly_sip_required: parseFloat(formData.monthly_sip_required) || calculateMonthlySIP(),
        description: formData.description,
        category: formData.category,
      }

      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create goal')
      }

      toast({
        title: 'Success',
        description: 'Goal created successfully!',
      })

      setFormData({
        name: '',
        target_amount: '',
        target_date: '',
        saved_amount: '',
        priority: '2',
        monthly_sip_required: '',
        description: '',
        category: 'General',
      })

      setOpen(false)
      onGoalCreated()

    } catch (error: any) {
      console.error('Create goal error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to create goal',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const suggestedMonthlySIP = calculateMonthlySIP()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Create New Goal
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Emergency Fund"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High Priority</SelectItem>
                  <SelectItem value="2">Medium Priority</SelectItem>
                  <SelectItem value="3">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target_amount">Target Amount (₹) *</Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', e.target.value)}
                placeholder="1000000"
                required
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="saved_amount">Already Saved (₹)</Label>
              <Input
                id="saved_amount"
                type="number"
                value={formData.saved_amount}
                onChange={(e) => handleInputChange('saved_amount', e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="target_date">Target Date *</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => handleInputChange('target_date', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="monthly_sip_required">Monthly SIP (₹)</Label>
              <Input
                id="monthly_sip_required"
                type="number"
                value={formData.monthly_sip_required}
                onChange={(e) => handleInputChange('monthly_sip_required', e.target.value)}
                placeholder={suggestedMonthlySIP.toString()}
                min="0"
              />
              {suggestedMonthlySIP > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Suggested: {formatINR(suggestedMonthlySIP)}/month
                </p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                placeholder="Optional description for your goal..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
