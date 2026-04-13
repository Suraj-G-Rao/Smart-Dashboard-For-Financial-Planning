'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatINR, formatDate } from '@/lib/utils'
import { FileText, Upload, Filter, Download, Search } from 'lucide-react'

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Mock transactions
  const transactions = [
    {
      id: '1',
      date: '2024-01-10',
      merchant: 'Swiggy',
      amount: 850,
      direction: 'debit',
      category: 'Food & Dining',
      source: 'manual',
    },
    {
      id: '2',
      date: '2024-01-09',
      merchant: 'Salary',
      amount: 150000,
      direction: 'credit',
      category: 'Salary',
      source: 'api',
    },
    {
      id: '3',
      date: '2024-01-08',
      merchant: 'Amazon',
      amount: 2499,
      direction: 'debit',
      category: 'Shopping',
      source: 'csv',
    },
    {
      id: '4',
      date: '2024-01-07',
      merchant: 'Uber',
      amount: 350,
      direction: 'debit',
      category: 'Transportation',
      source: 'ocr',
    },
    {
      id: '5',
      date: '2024-01-05',
      merchant: 'Netflix',
      amount: 649,
      direction: 'debit',
      category: 'Entertainment',
      source: 'manual',
    },
  ]

  const handleReceiptUpload = () => {
    // In production, this would call /api/receipts/upload
    alert('Receipt upload feature - would get signed URL and upload to Supabase storage')
  }

  const handleExport = (format: 'csv' | 'xlsx') => {
    // In production, generate and download file
    alert(`Exporting transactions as ${format.toUpperCase()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <FileText className="h-10 w-10 text-blue-600" />
            Transactions
          </h1>
          <p className="text-gray-600">View and manage all your financial transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReceiptUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Receipt
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Merchant</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-600">{formatDate(txn.date)}</td>
                    <td className="py-3 font-medium">{txn.merchant}</td>
                    <td className="py-3 text-sm">
                      <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {txn.category}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600 capitalize">{txn.source}</td>
                    <td className="py-3 text-right font-medium">
                      <span
                        className={
                          txn.direction === 'credit' ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {txn.direction === 'credit' ? '+' : '-'}
                        {formatINR(txn.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Upload Info */}
      <Card className="mt-6 border-2 border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Upload className="h-6 w-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">Smart Receipt OCR</h3>
              <p className="text-sm text-gray-700">
                Upload receipt images or PDFs. Our AI automatically extracts amount, date, merchant,
                and suggests categories. All data is stored securely in Supabase with PII redaction
                before AI processing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
