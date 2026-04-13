'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/format'
import { FileText, Download, Calendar, Loader2, Plus, AlertCircle, CheckCircle } from 'lucide-react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { CustomReportDialog } from '@/components/reports/custom-report-dialog'

interface Report {
  id: string
  user_id: string
  type: string
  period: string
  period_start: string
  period_end: string
  file_path: string
  created_at: string
}

export default function ReportsPage() {
  const supabase = createSupabaseClient()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [toast, setToast] = useState<{ title: string; description: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadReports()
    
    // Listen for toast events
    const handleToast = (event: CustomEvent) => {
      setToast(event.detail)
      setTimeout(() => setToast(null), 5000)
    }
    
    window.addEventListener('show-toast', handleToast as EventListener)
    return () => window.removeEventListener('show-toast', handleToast as EventListener)
  }, [])

  const loadReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (report: Report) => {
    try {
      const { data, error } = await supabase.storage
        .from('financial-reports')
        .download(report.file_path)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${report.type}-${report.period}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading report:', error)
      alert('Failed to download report')
    }
  }

  const handleGenerate = async (type: string) => {
    setGenerating(true)
    setSelectedType(type)
    try {
      // Get auth token
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
        body: JSON.stringify({ type }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      const result = await response.json()
      
      // Show success toast
      const event = new CustomEvent('show-toast', {
        detail: {
          title: 'Report Generated',
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} report for ${result.period} has been generated successfully.`,
          type: 'success'
        }
      })
      window.dispatchEvent(event)
      
      await loadReports()
    } catch (error: any) {
      console.error('Error generating report:', error)
      
      // Show error toast
      const event = new CustomEvent('show-toast', {
        detail: {
          title: 'Generation Failed',
          description: error.message || 'Failed to generate report. Please try again.',
          type: 'error'
        }
      })
      window.dispatchEvent(event)
    } finally {
      setGenerating(false)
      setSelectedType(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          toast.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-medium text-sm ${
                toast.type === 'success' ? 'text-green-900' : 'text-red-900'
              }`}>
                {toast.title}
              </h4>
              <p className={`text-sm mt-1 ${
                toast.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {toast.description}
              </p>
            </div>
            <button
              onClick={() => setToast(null)}
              className={`text-sm font-medium ${
                toast.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
              }`}
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <FileText className="h-10 w-10 text-blue-600" />
            Reports & Exports
          </h1>
          <p className="text-gray-600">Download your financial reports and summaries</p>
        </div>
        <Button onClick={() => handleGenerate('monthly')} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Generate New Report
        </Button>
      </div>

      {/* Report Types */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <FileText className="h-10 w-10 text-blue-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Monthly Summary</h3>
            <p className="text-sm text-gray-600 mb-4">
              Comprehensive monthly report with income, expenses, savings, and insights
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleGenerate('monthly')}
              disabled={generating && selectedType === 'monthly'}
            >
              {generating && selectedType === 'monthly' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                'Generate'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FileText className="h-10 w-10 text-green-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Tax Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              Annual tax summary with deductions, investments, and capital gains
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => handleGenerate('tax')}
              disabled={generating && selectedType === 'tax'}
            >
              {generating && selectedType === 'tax' ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                'Generate'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FileText className="h-10 w-10 text-purple-600 mb-3" />
            <h3 className="font-semibold text-lg mb-2">Custom Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create custom reports with specific date ranges and categories
            </p>
            <CustomReportDialog onReportGenerated={loadReports}>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={generating}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </CustomReportDialog>
          </CardContent>
        </Card>
      </div>

      {/* Generated Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No reports generated yet</p>
              <p className="text-sm">Click the generate buttons above to create your first report</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium">{report.period}</div>
                      <div className="text-sm text-gray-600 capitalize">{report.type} Report</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        Generated on {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(report)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Email Info */}
      <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Calendar className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Automated Monthly Emails</h3>
              <p className="text-sm text-gray-700">
                Monthly reports are automatically generated via Supabase Edge Functions and emailed
                to your registered address. You'll receive a comprehensive summary with spending
                breakdown, savings rate, and personalized insights on the 1st of every month.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
