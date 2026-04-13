'use client';

import { useState } from 'react';
import { Plus, TrendingDown, Calendar, Download, Filter, PieChart as PieChartIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function ExpensesPage() {
  const [period, setPeriod] = useState('monthly');
  const [showAddModal, setShowAddModal] = useState(false);

  const expenseDistribution = [
    { name: 'Food & Dining', value: 1200, color: '#f59e0b' },
    { name: 'Transportation', value: 800, color: '#3b82f6' },
    { name: 'Housing', value: 2500, color: '#8b5cf6' },
    { name: 'Entertainment', value: 450, color: '#ec4899' },
    { name: 'Healthcare', value: 600, color: '#10b981' },
    { name: 'Shopping', value: 950, color: '#ef4444' },
    { name: 'Utilities', value: 380, color: '#14b8a6' },
    { name: 'EMI', value: 1500, color: '#6366f1' },
  ];

  const expenseRecords = [
    { id: 1, date: 'Nov 15, 2024', category: 'Food & Dining', description: 'Grocery Shopping', amount: 245, mode: 'Credit Card' },
    { id: 2, date: 'Nov 14, 2024', category: 'Transportation', description: 'Uber Ride', amount: 35, mode: 'Debit Card' },
    { id: 3, date: 'Nov 13, 2024', category: 'Entertainment', description: 'Netflix Subscription', amount: 199, mode: 'UPI' },
    { id: 4, date: 'Nov 12, 2024', category: 'Shopping', description: 'Amazon Purchase', amount: 899, mode: 'Credit Card' },
    { id: 5, date: 'Nov 10, 2024', category: 'Healthcare', description: 'Medical Checkup', amount: 1200, mode: 'Cash' },
    { id: 6, date: 'Nov 8, 2024', category: 'Utilities', description: 'Electricity Bill', amount: 450, mode: 'Bank Transfer' },
    { id: 7, date: 'Nov 5, 2024', category: 'EMI', description: 'Home Loan EMI', amount: 1500, mode: 'Auto Debit' },
    { id: 8, date: 'Nov 3, 2024', category: 'Food & Dining', description: 'Restaurant', amount: 780, mode: 'Credit Card' },
  ];

  const totalExpense = expenseDistribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/50 via-red-50/30 to-orange-50/20">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Expenses</h1>
            <p className="text-gray-600">Track and manage your spending</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-gradient-to-br from-rose-500 to-pink-600 border-0 shadow-lg text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">This Month</span>
              </div>
              <p className="text-sm opacity-90 mb-1">Total Expenses</p>
              <h2 className="text-4xl font-bold mb-2">₹{totalExpense.toLocaleString()}</h2>
              <div className="flex items-center gap-1 text-sm">
                <TrendingDown className="h-4 w-4" />
                <span>+12.4% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">YTD</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Year-to-Date Expenses</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">₹91,240</h2>
              <div className="flex items-center gap-1 text-sm text-red-600">
                <TrendingDown className="h-4 w-4" />
                <span>+15.8% vs last year</span>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <PieChartIcon className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">Daily Avg</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Daily Average</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">₹280</h2>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>Based on last 30 days</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart and Distribution */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Expense Distribution Pie Chart */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Expense Distribution</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPeriod('daily')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        period === 'daily' 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Daily
                    </button>
                    <button
                      onClick={() => setPeriod('weekly')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        period === 'weekly' 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Weekly
                    </button>
                    <button
                      onClick={() => setPeriod('monthly')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        period === 'monthly' 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="h-96 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                        }}
                        formatter={(value) => [`₹${value}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Breakdown */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Breakdown</h3>
              
              <div className="space-y-4">
                {expenseDistribution.map((category, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-gray-900 font-medium">{category.name}</span>
                      </div>
                      <span className="text-gray-600 font-semibold">₹{category.value}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(category.value / totalExpense) * 100}%`,
                          backgroundColor: category.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Total</span>
                  <span className="text-xl font-bold text-gray-900">₹{totalExpense.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Records Table */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Payment Mode</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-gray-900">{record.date}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm`}
                          style={{
                            backgroundColor: `${expenseDistribution.find(e => e.name === record.category)?.color}20`,
                            color: expenseDistribution.find(e => e.name === record.category)?.color
                          }}
                        >
                          {record.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{record.description}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-red-600">
                        -₹{record.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{record.mode}</td>
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

        {/* Add Expense Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Expense</h3>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                      {expenseDistribution.map((cat, idx) => (
                        <option key={idx}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Grocery shopping"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500">
                      <option>Credit Card</option>
                      <option>Debit Card</option>
                      <option>UPI</option>
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                    </select>
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
                      className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-lg"
                    >
                      Add Expense
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
