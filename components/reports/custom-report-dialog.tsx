'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, Loader2 } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'

interface CustomReportDialogProps {
  onReportGenerated: () => void
  children: React.ReactNode
}

export function CustomReportDialog({ onReportGenerated, children }: CustomReportDialogProps) {
  const supabase = createSupabaseClient()
  const [open, setOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')

  // Set default dates (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const defaultStartDate = thirtyDaysAgo.toISOString().split('T')[0]
  const defaultEndDate = today.toISOString().split('T')[0]

  const handleGenerate = async () => {
    setError('')
    
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date')
      return
    }

    setGenerating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          type: 'custom',
          startDate,
          endDate
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      const result = await response.json()
      setOpen(false)
      onReportGenerated()
      
      // Show success message
      const event = new CustomEvent('show-toast', {
        detail: {
          title: 'Report Generated',
          description: `Custom report for ${startDate} to ${endDate} has been generated successfully.`,
          type: 'success'
        }
      })
      window.dispatchEvent(event)
    } catch (error: any) {
      console.error('Error generating custom report:', error)
      setError(error.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Generate Custom Report
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate || defaultStartDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={defaultEndDate}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate || defaultEndDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || defaultStartDate}
              max={defaultEndDate}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
