"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, CreditCard, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Dark Theme with Cards */}
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 lg:p-8 flex flex-col justify-between relative overflow-hidden min-h-[50vh] lg:min-h-screen">
        {/* Step indicator */}
        <div className="text-gray-400 text-sm font-medium">01/03</div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="text-[20rem] font-bold text-gray-700 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none">
              WW
            </div>
          </div>
          
          {/* Credit Cards */}
          <div className="relative z-10 mb-12">
            {/* Main card */}
            <Card className="w-64 h-40 lg:w-80 lg:h-48 bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 transform rotate-3 shadow-2xl">
              <CardContent className="p-6 text-white relative">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-md flex items-center justify-center">
                    <div className="w-8 h-5 bg-white rounded-sm opacity-80"></div>
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-300" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-300">Account number</div>
                  <div className="text-lg font-mono tracking-wider">•••• •••• •••• 9568</div>
                </div>
                <div className="absolute bottom-6 right-6">
                  <div className="text-xl font-bold">WW</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Secondary card */}
            <Card className="w-64 h-40 lg:w-80 lg:h-48 bg-gradient-to-br from-teal-400 to-teal-500 border-teal-300 absolute -top-4 -left-8 transform -rotate-6 shadow-xl">
              <CardContent className="p-6 text-white relative">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-md flex items-center justify-center">
                    <div className="w-8 h-5 bg-white rounded-sm opacity-80"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-teal-100">Available Balance</div>
                  <div className="text-lg font-mono">•••• •••• •••• 8590</div>
                </div>
                <div className="absolute bottom-6 left-6">
                  <div className="text-2xl font-bold opacity-20">WW</div>
                </div>
                <div className="absolute bottom-6 right-6 flex items-center space-x-2">
                  <span className="text-lg font-semibold">Rp. 48.238.120</span>
                  <Eye className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Bottom content */}
        <div className="text-white">
          <h1 className="text-2xl lg:text-4xl font-bold mb-4 flex items-center">
            Create <ArrowUpRight className="w-6 h-6 lg:w-8 lg:h-8 ml-2 text-gray-400" />
          </h1>
          <h2 className="text-2xl lg:text-4xl font-bold mb-4">Custom Cards</h2>
          <p className="text-gray-400 text-lg max-w-md">
            Design personalized cards that reflect your style and identity with our easy-to-use customization tools.
          </p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 bg-gray-50 p-4 lg:p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                W
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">Wealth Wave</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hi! Welcome to
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Wealth Wave dude 👋
            </h2>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="johndoe@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Sign up
            </Button>
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign In
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">Or with email</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Sign Up Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 py-3"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 py-3"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Sign up with Apple
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
