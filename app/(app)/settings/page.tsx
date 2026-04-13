 'use client';

 import { useEffect, useState } from 'react';
 import { Card, CardContent } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { User, Upload } from 'lucide-react';
 import { createSupabaseClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const supabase = createSupabaseClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error loading user in settings page:', error);
        return;
      }
      if (!user) return;

      setCurrentEmail(user.email || '');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile in settings page:', profileError);
        return;
      }

      if (profile?.full_name) {
        const parts = String(profile.full_name).trim().split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
    };

    loadProfile();
  }, [supabase]);

  const handleSaveName = async () => {
    try {
      setSavingName(true);
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        alert('Could not load user. Please sign in again.');
        return;
      }

      const fullName = `${firstName} ${lastName}`.trim();
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: fullName }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Error updating name:', upsertError);
        alert('Failed to update name. Please try again.');
        return;
      }

      alert('Name updated successfully');
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveEmail = async () => {
    try {
      if (!newEmail) {
        alert('Please enter a new email.');
        return;
      }

      setSavingEmail(true);
      const { data, error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        console.error('Error updating email:', error);
        alert(error.message || 'Failed to update email.');
        return;
      }

      setCurrentEmail(data.user?.email || newEmail);
      setNewEmail('');
      alert('Email update requested. Please check your inbox to confirm.');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSavePassword = async () => {
    try {
      if (!newPassword) {
        alert('Please enter a new password.');
        return;
      }
      if (newPassword !== confirmPassword) {
        alert('New password and confirmation do not match.');
        return;
      }

      setSavingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        console.error('Error updating password:', error);
        alert(error.message || 'Failed to update password.');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully. You may be asked to sign in again.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your personal account information</p>
      </div>

      <div className="flex gap-8 px-8 max-w-6xl mx-auto pb-12">
        {/* Left Sidebar with single General item */}
        <aside className="w-64 shrink-0">
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-3">
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                Personal
              </div>
              <button
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium"
                aria-current="page"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-800">
                  <User className="h-4 w-4" />
                </span>
                General
              </button>
            </CardContent>
          </Card>
        </aside>

        {/* Main general settings content */}
        <main className="flex-1 space-y-6">
          {/* Profile picture */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xl font-semibold">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Profile picture</h2>
                  <p className="text-xs text-gray-600 mt-1">Upload a photo to personalize your account.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Upload className="h-4 w-4 mr-2" />
                  Change picture
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change name */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Change name</h2>
                <p className="text-xs text-gray-600 mt-1">Update the name shown on your account.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs text-gray-700">First name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    className="h-9 text-sm"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs text-gray-700">Last name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    className="h-9 text-sm"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Button
                  size="sm"
                  className="text-sm"
                  onClick={handleSaveName}
                  disabled={savingName}
                >
                  {savingName ? 'Saving…' : 'Save name'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change email */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Change email</h2>
                <p className="text-xs text-gray-600 mt-1">Use an email address you check regularly.</p>
              </div>
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="currentEmail" className="text-xs text-gray-700">Current email</Label>
                  <Input
                    id="currentEmail"
                    type="email"
                    placeholder="current@example.com"
                    className="h-9 text-sm"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newEmail" className="text-xs text-gray-700">New email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="new@example.com"
                    className="h-9 text-sm"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Button
                  size="sm"
                  className="text-sm"
                  onClick={handleSaveEmail}
                  disabled={savingEmail}
                >
                  {savingEmail ? 'Saving…' : 'Save email'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card className="border border-gray-200 shadow-sm bg-white">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Change password</h2>
                <p className="text-xs text-gray-600 mt-1">Choose a strong password to keep your account secure.</p>
              </div>
              <div className="grid gap-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-xs text-gray-700">Current password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className="h-9 text-sm"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs text-gray-700">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="h-9 text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs text-gray-700">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    className="h-9 text-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Button
                  size="sm"
                  className="text-sm"
                  onClick={handleSavePassword}
                  disabled={savingPassword}
                >
                  {savingPassword ? 'Updating…' : 'Update password'}
                </Button>
                <p className="text-[11px] text-gray-500 max-w-xs">
                  For your security, you may be asked to sign in again after changing your password.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
