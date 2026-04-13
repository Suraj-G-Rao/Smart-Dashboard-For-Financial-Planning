'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard,
  Activity,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function FinanceDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Sample data - Indian context
  const activityData = [
    { date: '06 Jan', income: 85000, expense: 45000 },
    { date: '07 Jan', income: 92000, expense: 52000 },
    { date: '08 Jan', income: 78000, expense: 48000 },
    { date: '09 Jan', income: 88000, expense: 55000 },
    { date: '10 Jan', income: 95000, expense: 49000 },
    { date: '11 Jan', income: 105000, expense: 58000 },
  ];

  const weeklySpending = [
    { day: 'Mon', amount: 3400 },
    { day: 'Tue', amount: 2800 },
    { day: 'Wed', amount: 5200 },
    { day: 'Thu', amount: 8900 },
    { day: 'Fri', amount: 4600 },
    { day: 'Sat', amount: 6100 },
    { day: 'Sun', amount: 2800 },
  ];

  const recentDeposits = [
    { id: 1, name: 'UPI Payment', email: 'Google Pay', amount: 15000, logo: '📱' },
    { id: 2, name: 'Salary Credit', email: 'HDFC Bank', amount: 85000, logo: '🏦' },
    { id: 3, name: 'PhonePe Transfer', email: 'From Rajesh Kumar', amount: 5500, logo: '💜' },
    { id: 4, name: 'Paytm Wallet', email: 'Cashback added', amount: 850, logo: '💙' },
    { id: 5, name: 'NEFT Transfer', email: 'ICICI Bank', amount: 25000, logo: '🏦' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Rahul!</span>
            </h1>
            <p className="text-gray-600">Here's your financial overview for today</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-white rounded-full transition-colors">
              <Calendar className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-white rounded-full transition-colors">
              <Activity className="h-5 w-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold">
              R
            </div>
          </div>
        </div>

        {/* Account Summary Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Primary Account */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Primary account</p>
                  <p className="text-xs text-gray-500">Current balance</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      stroke="url(#gradient1)" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray="176"
                      strokeDashoffset="44"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">₹8,42,350</h2>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>3.4%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Account */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Secondary account</p>
                  <p className="text-xs text-gray-500">Current balance</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      stroke="url(#gradient2)" 
                      strokeWidth="8" 
                      fill="none"
                      strokeDasharray="176"
                      strokeDashoffset="132"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#2563eb" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">₹1,85,420</h2>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>2.0%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cards and Deposits Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Your Cards */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Your cards</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Blue Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]"></div>
                    <div className="relative p-6 text-white">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-sm opacity-90 mb-1">HDFC Bank</p>
                          <p className="text-xs opacity-75">RAHUL SHARMA</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs">📶</div>
                          <span className="text-2xl">📶</span>
                        </div>
                      </div>
                      <div className="mb-6">
                        <p className="text-lg tracking-wider font-medium">4532 8745 6321 9087</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs opacity-75">12/27</span>
                        <div className="flex gap-1">
                          <div className="w-6 h-6 rounded-full bg-red-500 opacity-80"></div>
                          <div className="w-6 h-6 rounded-full bg-yellow-500 opacity-80 -ml-2"></div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs opacity-75 mb-1">Spending this month</p>
                        <p className="text-xl font-semibold">₹84,250</p>
                        <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                          <div className="bg-white rounded-full h-1" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Black Card */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02]"></div>
                    <div className="relative p-6 text-white">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-sm opacity-90 mb-1">SBI Card</p>
                          <p className="text-xs opacity-75">RAHUL SHARMA</p>
                        </div>
                        <span className="text-2xl">📶</span>
                      </div>
                      <div className="mb-6">
                        <p className="text-lg tracking-wider font-medium">5421 6789 3214 8765</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs opacity-75">09/26</span>
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">✓</div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs opacity-75 mb-1">Spending this month</p>
                        <p className="text-xl font-semibold">₹45,680</p>
                        <div className="w-full bg-white/20 rounded-full h-1 mt-2">
                          <div className="bg-white rounded-full h-1" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deposits */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent deposits</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {recentDeposits.map((deposit) => (
                  <div key={deposit.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                        {deposit.logo}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deposit.name}</p>
                        <p className="text-xs text-gray-500">{deposit.email}</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-green-600">+₹{deposit.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Total</p>
                  <p className="text-2xl font-bold text-gray-900">₹1,31,350</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity and Weekly Spending */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Jan 6, 2024 - Jan 11, 2024</span>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expense" 
                        stroke="#f97316" 
                        strokeWidth={3}
                        dot={{ fill: '#f97316', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <p className="text-xs text-gray-600">Average Income</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$1,512,951</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>3.4%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <p className="text-xs text-gray-600">Average Expenses</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">$1,512,951</p>
                    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <ArrowDownRight className="h-4 w-4" />
                      <span>3.4%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xs text-gray-600">Profit</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">+22 %</p>
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>3.4%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Spending */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Spending</h3>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklySpending}>
                    <XAxis dataKey="day" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
                      }}
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="url(#barGradient)" 
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Total this week</p>
                  <p className="text-xl font-bold text-gray-900">₹33,800</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}
