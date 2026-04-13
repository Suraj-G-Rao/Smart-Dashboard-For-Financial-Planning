'use client';

import { Shield, Lock, Brain, FileCheck, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'Every transaction is encrypted, safeguarding sensitive financial data from unauthorized access.',
      highlight: true,
    },
    {
      icon: CreditCard,
      title: 'PCI DSS Level 1 Compliance',
      description: 'Ensuring the highest level of payment security for processing transactions.',
      highlight: false,
    },
    {
      icon: Brain,
      title: 'AI-Powered Fraud Detection',
      description: 'Advanced machine learning models analyze transaction patterns to detect and prevent fraudulent activities in real-time.',
      highlight: false,
    },
    {
      icon: FileCheck,
      title: 'Regulatory Compliance (KYC, AML, PSD2)',
      description: 'Built-in compliance solutions to meet global financial regulations and ensure a seamless user verification process.',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6">
            SECURITY & COMPLIANCE
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Enterprise-Grade Protection for Your Business
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our platform is designed to meet the highest industry standards, ensuring your transactions, customer data, and financial 
            operations remain secure and fully compliant with global regulations.
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Features */}
          <div className="space-y-8">
            {securityFeatures.map((feature, index) => (
              <Card 
                key={index} 
                className={`p-6 transition-all duration-300 hover:shadow-lg ${
                  feature.highlight ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : 'hover:border-gray-300'
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      feature.highlight ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Right Column - Credit Card Mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Credit Card */}
              <div className="w-80 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="p-6 text-white relative h-full flex flex-col justify-between">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-md flex items-center justify-center">
                      <div className="w-8 h-5 bg-yellow-300 rounded-sm opacity-80"></div>
                    </div>
                    <Shield className="h-6 w-6 text-gray-300" />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <div className="text-2xl font-mono tracking-widest">
                        •••• •••• •••• ••••
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex justify-between items-end">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="text-lg">•</div>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
                      <div className="w-8 h-8 bg-yellow-400 rounded-full opacity-80 -ml-2"></div>
                      <span className="text-xs font-semibold ml-1">mastercard</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg border">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Badges */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8">
            Trusted by Industry Standards
          </h2>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">PCI DSS</div>
              <div className="text-sm text-gray-500">Level 1</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">ISO</div>
              <div className="text-sm text-gray-500">27001</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">SOC</div>
              <div className="text-sm text-gray-500">Type 2</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">GDPR</div>
              <div className="text-sm text-gray-500">Compliant</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg border max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Secure Your Business?
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Join thousands of businesses that trust our enterprise-grade security infrastructure.
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Get Started Today
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors">
                Contact Security Team
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
