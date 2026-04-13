'use client';

import { Check, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter Plan',
      price: '$0',
      period: '/ month',
      nextPrice: '$19 for next month',
      description: 'Perfect for freelancers, small businesses, and early-stage startups who need a simple way to accept payments.',
      features: [
        'Process up to $10,000/month in transactions',
        'Accept Credit/Debit Card & Bank Transfers',
        'Basic fraud protection for secure payments',
        'Standard API access for simple integrations'
      ],
      buttonText: 'Start Now',
      buttonVariant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Growth Plan',
      price: '$99',
      period: '/ month',
      discount: 'Discount 30% off',
      description: 'Best for growing businesses, SaaS platforms, and e-commerce stores looking for seamless transactions and fraud prevention.',
      features: [
        'Process up to $250,000/month in transactions',
        'Accept payments via Cards, Bank & Digital Wallets',
        'Advanced fraud protection & chargeback',
        'Full API access + Webhooks for integrations',
        '24/7 chat & email support for faster issue resolution',
        'Faster settlement speed (T+1) for better cash flow'
      ],
      buttonText: 'Choose Plan',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Scale Plan',
      price: 'Custom',
      period: 'Pricing',
      nextPrice: 'Contact Us Now',
      description: 'Ideal for enterprises, marketplaces, and businesses processing high transaction volumes that need instant settlements and premium support.',
      features: [
        'Process up to $1,000,000/month in transactions',
        'Accept payments via unlimited methods and local',
        'AI-powered fraud detection & real-time monitoring',
        'Dedicated API support with enterprise-grade',
        'Priority customer support via phone, chat & email',
        'Instant settlements for seamless cash flow',
        'Multi-currency support to expand globally'
      ],
      buttonText: 'Discuss Now',
      buttonVariant: 'outline' as const,
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium mb-6">
            PRICING PLAN
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Find the Right Plan for Your Business
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transparent pricing with powerful features. Whether you're just starting out or processing high-volume 
            transactions, we have a plan for you.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'bg-gray-900 text-white border-2 border-gray-800 scale-105' 
                  : 'bg-white hover:shadow-lg border border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  MOST POPULAR
                </div>
              )}

              <CardContent className="p-8">
                {/* Plan Header */}
                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-lg ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  {plan.discount && (
                    <div className="text-blue-400 text-sm font-medium mb-2">
                      {plan.discount}
                    </div>
                  )}
                  {plan.nextPrice && (
                    <div className={`text-sm ${plan.popular ? 'text-gray-400' : 'text-gray-500'}`}>
                      {plan.nextPrice}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className={`text-sm mb-8 leading-relaxed ${plan.popular ? 'text-gray-300' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <div className={`text-sm font-semibold mb-4 ${plan.popular ? 'text-gray-300' : 'text-gray-500'}`}>
                    FEATURES
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                          plan.popular ? 'text-green-400' : 'text-green-600'
                        }`} />
                        <span className={`text-sm leading-relaxed ${
                          plan.popular ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full py-3 font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : plan.buttonVariant === 'outline'
                      ? 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                  variant={plan.popular ? 'default' : plan.buttonVariant}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Questions about pricing?
          </h2>
          <p className="text-gray-600 mb-8">
            Our team is here to help you choose the right plan for your business needs.
          </p>
          <div className="flex justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
              Contact Sales
            </Button>
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-gray-400 px-8 py-3">
              View FAQ
            </Button>
          </div>
        </div>

        {/* Enterprise Notice */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need something more custom?
          </h3>
          <p className="text-gray-600 mb-6">
            We offer enterprise solutions with custom pricing, dedicated support, and tailored integrations 
            for businesses with unique requirements.
          </p>
          <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3">
            Talk to Enterprise Sales
          </Button>
        </div>
      </div>
    </div>
  );
}
