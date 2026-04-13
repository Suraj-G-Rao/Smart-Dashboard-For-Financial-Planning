'use client';

import { useState } from 'react';
import { Plus, TrendingUp, Calendar, Download, Edit, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoansPage() {
  const [expandedLoan, setExpandedLoan] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLoan, setNewLoan] = useState({
    name: '',
    amount: '',
    interestRate: '',
    tenure: '',
    startDate: '',
  });

  const loanSummary = [
    { label: 'Total Outstanding', value: '₹4,93,283.40', color: 'from-purple-500 to-indigo-600' },
    { label: 'Total Amount Paid', value: '₹10,258.27', color: 'from-green-500 to-emerald-600' },
    { label: 'Monthly EMI', value: '₹10,692.22', color: 'from-orange-500 to-red-600' },
    { label: 'Active Loans', value: '1', color: 'from-blue-500 to-cyan-600' },
  ];

  const loans = [
    {
      id: 1,
      name: 'Home Loan',
      outstanding: 493283.40,
      originalAmount: 500000,
      emi: 10692.22,
      interestRate: 8.5,
      timeLeft: '4y 3m',
      totalAmount: 509456.54,
      extraPaid: 0,
      nextPayment: 'Dec 3, 2025',
      status: 'Active',
      emiSchedule: [
        { emiNo: 1, dueDate: 'Jul 1, 2025', principal: 6716.60, interest: 3541.67, total: 10258.27, extraPaid: 0, status: 'Paid', paidOn: 'Jul 1, 2025' },
        { emiNo: 2, dueDate: 'Aug 1, 2025', principal: 6764.18, interest: 3494.09, total: 10258.27, extraPaid: 0, status: 'Paid', paidOn: 'Aug 1, 2025' },
        { emiNo: 3, dueDate: 'Sep 1, 2025', principal: 6812.09, interest: 3446.18, total: 10258.27, extraPaid: 0, status: 'Paid', paidOn: 'Sep 1, 2025' },
        { emiNo: 4, dueDate: 'Oct 1, 2025', principal: 6860.34, interest: 3397.93, total: 10258.27, extraPaid: 0, status: 'Paid', paidOn: 'Oct 1, 2025' },
        { emiNo: 5, dueDate: 'Nov 1, 2025', principal: 6908.94, interest: 3349.33, total: 10258.27, extraPaid: 0, status: 'Paid', paidOn: 'Nov 1, 2025' },
        { emiNo: 6, dueDate: 'Nov 4, 2025', principal: 6957.88, interest: 3300.39, total: 10258.27, extraPaid: 0, status: 'Paid', paidOn: 'Nov 4, 2025' },
        { emiNo: 7, dueDate: 'Dec 1, 2025', principal: 7007.18, interest: 3251.09, total: 10258.27, extraPaid: 0, status: 'Upcoming', paidOn: null },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-blue-50/20">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Loans</h1>
            <p className="text-gray-600">Manage and track all your loans in one place</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Loan
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {loanSummary.map((item, index) => (
            <Card key={index} className="backdrop-blur-sm bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className={`inline-flex p-3 bg-gradient-to-br ${item.color} rounded-xl mb-4`}>
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                <h2 className="text-3xl font-bold text-gray-900">{item.value}</h2>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loans Table */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Your Loans</h3>
              <p className="text-sm text-gray-600">Manage and track all your loans in one place</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Outstanding</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">EMI</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Interest Rate</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Time Left</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Total Amount</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Extra Paid</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Next Payment</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan) => (
                    <>
                      <tr key={loan.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              {expandedLoan === loan.id ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{loan.name}</p>
                              <p className="text-xs text-gray-500">1.2% paid • 51 months left</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-gray-900">₹{loan.outstanding.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">of ₹{loan.originalAmount.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm font-semibold text-indigo-600">₹{loan.emi.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">/ month</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">{loan.interestRate}%</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">{loan.timeLeft}</span>
                          <p className="text-xs text-gray-500">51 months</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">₹{loan.totalAmount.toLocaleString()}</span>
                          <p className="text-xs text-gray-500">₹{loan.originalAmount.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">-</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">{loan.nextPayment}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {loan.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit className="h-4 w-4 text-blue-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* EMI Schedule Expansion */}
                      {expandedLoan === loan.id && (
                        <tr>
                          <td colSpan={10} className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-6">
                            <div className="mb-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-1">EMI Payment Schedule</h4>
                              <p className="text-sm text-gray-600">EMIs are automatically processed on due dates</p>
                            </div>

                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">EMI #</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Due Date</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Principal</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Interest</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Total</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Extra Paid</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Status</th>
                                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-600">Paid On</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {loan.emiSchedule.map((emi) => (
                                    <tr key={emi.emiNo} className="border-b border-gray-100">
                                      <td className="py-3 px-3 text-sm font-medium text-gray-900">#{emi.emiNo}</td>
                                      <td className="py-3 px-3 text-sm text-gray-600">{emi.dueDate}</td>
                                      <td className="py-3 px-3 text-sm text-gray-900">₹{emi.principal.toLocaleString()}</td>
                                      <td className="py-3 px-3 text-sm text-gray-600">₹{emi.interest.toLocaleString()}</td>
                                      <td className="py-3 px-3 text-sm font-semibold text-gray-900">₹{emi.total.toLocaleString()}</td>
                                      <td className="py-3 px-3 text-sm text-gray-600">-</td>
                                      <td className="py-3 px-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          emi.status === 'Paid' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                          {emi.status === 'Paid' && '✓ '}
                                          {emi.status}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3 text-sm text-gray-600">{emi.paidOn || '-'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="mt-6 grid grid-cols-3 gap-4">
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs text-gray-600 mb-1">Total Principal Paid</p>
                                <p className="text-lg font-bold text-gray-900">₹47,031.03</p>
                              </div>
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs text-gray-600 mb-1">Total Interest Paid</p>
                                <p className="text-lg font-bold text-gray-900">₹20,189.35</p>
                              </div>
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs text-gray-600 mb-1">Remaining Balance</p>
                                <p className="text-lg font-bold text-indigo-600">₹{loan.outstanding.toLocaleString()}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Loan Insights */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="backdrop-blur-sm bg-gradient-to-br from-green-500 to-emerald-600 border-0 shadow-lg text-white">
            <CardContent className="p-6">
              <div className="p-3 bg-white/20 rounded-xl w-fit mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-sm opacity-90 mb-2">On-Time Payments</p>
              <h2 className="text-4xl font-bold mb-1">100%</h2>
              <p className="text-sm opacity-90">6 of 6 EMIs paid on time</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="p-3 bg-orange-100 rounded-xl w-fit mb-4">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Next EMI Due</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-1">12</h2>
              <p className="text-sm text-gray-600">days remaining</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="p-3 bg-indigo-100 rounded-xl w-fit mb-4">
                <Download className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">Total Interest Saved</p>
              <h2 className="text-4xl font-bold text-gray-900 mb-1">₹0</h2>
              <p className="text-sm text-gray-600">by prepayments</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Loan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Loan</h2>
                  <p className="text-sm text-gray-600 mt-1">Enter your loan details below</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Loan Name</Label>
                    <Input
                      placeholder="e.g., Home Loan, Car Loan"
                      value={newLoan.name}
                      onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Loan Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 5,00,000"
                      value={newLoan.amount}
                      onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="e.g., 8.5"
                      value={newLoan.interestRate}
                      onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Tenure (Years)</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 20"
                      value={newLoan.tenure}
                      onChange={(e) => setNewLoan({ ...newLoan, tenure: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                  <Input
                    type="date"
                    value={newLoan.startDate}
                    onChange={(e) => setNewLoan({ ...newLoan, startDate: e.target.value })}
                    className="h-11"
                  />
                </div>

                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                  <p className="text-sm font-medium text-indigo-900 mb-2">Loan Types in India:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-indigo-700">
                    <div>• Home Loan (SBI, HDFC, ICICI)</div>
                    <div>• Personal Loan</div>
                    <div>• Car Loan</div>
                    <div>• Education Loan</div>
                    <div>• Business Loan</div>
                    <div>• Gold Loan</div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-900 mb-2">EMI will be calculated as:</p>
                  <p className="text-xs text-gray-600">
                    EMI = [P × r × (1+r)^n] / [(1+r)^n-1]
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Where P = Principal, r = Monthly interest rate, n = Tenure in months
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // TODO: Add loan logic here
                  console.log('New Loan:', newLoan);
                  setShowAddModal(false);
                  setNewLoan({ name: '', amount: '', interestRate: '', tenure: '', startDate: '' });
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6"
              >
                Add Loan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
