'use client';

import { useState } from 'react';
import { Plus, TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function IncomePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [period, setPeriod] = useState('monthly');

  const monthlyIncomeData = [
    { month: 'Jan', amount: 4500 },
    { month: 'Feb', amount: 5200 },
    { month: 'Mar', amount: 4800 },
    { month: 'Apr', amount: 6100 },
    { month: 'May', amount: 5700 },
    { month: 'Jun', amount: 6800 },
    { month: 'Jul', amount: 7200 },
    { month: 'Aug', amount: 6900 },
    { month: 'Sep', amount: 7500 },
    { month: 'Oct', amount: 8100 },
    { month: 'Nov', amount: 7800 },
    { month: 'Dec', amount: 8500 },
  ];

  const incomeRecords = [
    { id: 1, date: 'Nov 15, 2024', category: 'Salary', amount: 5500, mode: 'Bank Transfer', status: 'Completed' },
    { id: 2, date: 'Nov 12, 2024', category: 'Freelance', amount: 1200, mode: 'PayPal', status: 'Completed' },
    { id: 3, date: 'Nov 8, 2024', category: 'Investment', amount: 850, mode: 'Stock Dividend', status: 'Completed' },
    { id: 4, date: 'Nov 5, 2024', category: 'Rental', amount: 2000, mode: 'Bank Transfer', status: 'Completed' },
    { id: 5, date: 'Nov 1, 2024', category: 'Side Project', amount: 680, mode: 'Crypto', status: 'Pending' },
    { id: 6, date: 'Oct 28, 2024', category: 'Consulting', amount: 3200, mode: 'Wire Transfer', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-green-50/30 to-teal-50/20">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Income</h1>
            <p className="text-gray-600">Track and manage your income streams</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Income
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-lg text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">This Month</span>
              </div>
              <p className="text-sm opacity-90 mb-1">Total Income</p>
              <h2 className="text-4xl font-bold mb-2">₹13,430</h2>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>+18.2% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">YTD</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Year-to-Date Income</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">₹84,250</h2>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+24.5% vs last year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Download className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">Average</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Monthly Average</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">₹7,021</h2>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>Based on 12 months</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Chart */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Income Trend</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPeriod('monthly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === 'monthly' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPeriod('yearly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    period === 'yearly' 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyIncomeData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '12px', 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                    formatter={(value) => [`₹${value}`, 'Income']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#incomeGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Income Records Table */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Income Records</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Mode</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-900">{record.date}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-100 text-emerald-700">
                          {record.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-emerald-600">
                        +₹{record.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{record.mode}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'Completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Income Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Income</h3>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option>Salary</option>
                      <option>Freelance</option>
                      <option>Investment</option>
                      <option>Rental</option>
                      <option>Side Project</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option>Bank Transfer</option>
                      <option>PayPal</option>
                      <option>Crypto</option>
                      <option>Wire Transfer</option>
                      <option>Cash</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea 
                      rows={3}
                      placeholder="Add any additional notes..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="flex-1 rounded-lg"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg"
                    >
                      Add Income
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
