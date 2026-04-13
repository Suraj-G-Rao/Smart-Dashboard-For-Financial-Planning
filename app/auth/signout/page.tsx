'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/auth/signin' });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/90 border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Signing out...</h1>
          <p className="text-gray-600">Please wait while we sign you out.</p>
        </CardContent>
      </Card>
    </div>
  );
}
