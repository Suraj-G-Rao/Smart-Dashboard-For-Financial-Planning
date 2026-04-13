'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Upload, Trash2 } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { BudgetInputs } from '@/lib/budget/engine';

interface BudgetPreset {
  id: string;
  name: string;
  inputs: BudgetInputs;
  created_at: string;
}

interface PresetPickerProps {
  currentInputs: BudgetInputs;
  onLoadPreset: (inputs: BudgetInputs) => void;
}

export default function PresetPicker({ currentInputs, onLoadPreset }: PresetPickerProps) {
  const [presets, setPresets] = useState<BudgetPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [newPresetName, setNewPresetName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const { data, error } = await supabase
        .from('budget_presets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const savePreset = async () => {
    if (!newPresetName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('budget_presets')
        .insert({
          name: newPresetName.trim(),
          inputs: currentInputs,
        });

      if (error) throw error;

      setNewPresetName('');
      setShowSaveForm(false);
      await loadPresets();
      alert('Preset saved successfully!');
    } catch (error) {
      console.error('Error saving preset:', error);
      alert('Failed to save preset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = () => {
    const preset = presets.find(p => p.id === selectedPresetId);
    if (preset) {
      onLoadPreset(preset.inputs);
      alert(`Loaded preset: ${preset.name}`);
    }
  };

  const deletePreset = async (presetId: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;

    try {
      const { error } = await supabase
        .from('budget_presets')
        .delete()
        .eq('id', presetId);

      if (error) throw error;

      await loadPresets();
      if (selectedPresetId === presetId) {
        setSelectedPresetId('');
      }
      alert('Preset deleted successfully!');
    } catch (error) {
      console.error('Error deleting preset:', error);
      alert('Failed to delete preset. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Budget Presets
        </CardTitle>
        <CardDescription>
          Save and load your budget configurations for quick access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Load Preset */}
        <div className="space-y-2">
          <Label>Load Existing Preset</Label>
          <div className="flex gap-2">
            <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a preset..." />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{preset.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(preset.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={loadPreset}
              disabled={!selectedPresetId}
            >
              <Upload className="h-4 w-4 mr-2" />
              Load
            </Button>
            {selectedPresetId && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => deletePreset(selectedPresetId)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Save New Preset */}
        <div className="space-y-2">
          {!showSaveForm ? (
            <Button
              variant="outline"
              onClick={() => setShowSaveForm(true)}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Current Configuration
            </Button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="presetName">Preset Name</Label>
              <div className="flex gap-2">
                <Input
                  id="presetName"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Enter preset name..."
                  onKeyPress={(e) => e.key === 'Enter' && savePreset()}
                />
                <Button
                  onClick={savePreset}
                  disabled={!newPresetName.trim() || loading}
                >
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSaveForm(false);
                    setNewPresetName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Preset Count */}
        {presets.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            {presets.length} saved preset{presets.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
