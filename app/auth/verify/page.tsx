'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-600 mb-4">
            A sign-in link has been sent to your email address.
          </p>
          <p className="text-sm text-gray-500">
            Click the link in the email to sign in to your account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
