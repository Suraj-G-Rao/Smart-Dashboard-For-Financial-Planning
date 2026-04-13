'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, FileText, Key, StickyNote, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LockedOverlay } from '@/components/finance/LockedOverlay';
import { supabase } from '@/lib/supabase/client';
import { encryptData, decryptData } from '@/lib/vault-crypto';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface VaultItem {
  id: string;
  title: string;
  type: string;
  path?: string;
  secret?: { iv: string; cipher: string; tag: string };
  created_at: string;
}

const APP_SECRET = process.env.NEXT_PUBLIC_VAULT_MASTER_SECRET || 'default-secret-key';

export default function VaultPage() {
  const [isLocked, setIsLocked] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [items, setItems] = useState<VaultItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState({ title: '', content: '', type: 'password' });

  useEffect(() => {
    initUser();
  }, []);

  useEffect(() => {
    if (!isLocked && userId) {
      fetchVaultItems();
    }
  }, [isLocked, userId]);

  const initUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const handleUnlock = async () => {
    setUnlocking(true);
    // In production, verify password here
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLocked(false);
    setUnlocking(false);
  };

  const handleLock = () => {
    setIsLocked(true);
    setItems([]);
  };

  const fetchVaultItems = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
  };

  const handleAddSecret = async () => {
    if (!userId || !newSecret.title || !newSecret.content) return;

    try {
      // Encrypt the secret
      const encrypted = await encryptData(newSecret.content, userId, APP_SECRET);

      // Save to database
      const response = await fetch('/api/vault/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSecret.title,
          type: newSecret.type,
          secret: encrypted,
        }),
      });

      if (response.ok) {
        setNewSecret({ title: '', content: '', type: 'password' });
        fetchVaultItems();
      }
    } catch (error) {
      console.error('Failed to add secret:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    formData.append('type', 'document');

    try {
      const response = await fetch('/api/vault/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchVaultItems();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const viewSecret = async (item: VaultItem) => {
    if (!item.secret || !userId) return;

    try {
      const decrypted = await decryptData(item.secret, userId, APP_SECRET);
      alert(`Secret: ${decrypted}`);
    } catch (error) {
      console.error('Failed to decrypt:', error);
      alert('Failed to decrypt secret');
    }
  };

  const documents = items.filter((i) => i.type === 'document');
  const passwords = items.filter((i) => i.type === 'password');
  const notes = items.filter((i) => i.type === 'note');

  return (
    <div className="container relative mx-auto space-y-8 p-6">
      {/* Locked Overlay */}
      {isLocked && <LockedOverlay onUnlock={handleUnlock} isUnlocking={unlocking} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Vault</h1>
          <p className="text-sm text-muted-foreground">
            End-to-end encrypted storage for sensitive data
          </p>
        </div>
        {!isLocked && (
          <Button onClick={handleLock} variant="outline">
            <Lock className="mr-2 h-4 w-4" />
            Lock Vault
          </Button>
        )}
      </div>

      {!isLocked && (
        <Tabs defaultValue="documents" className="w-full">
          <TabsList>
            <TabsTrigger value="documents">
              <FileText className="mr-2 h-4 w-4" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger value="passwords">
              <Key className="mr-2 h-4 w-4" />
              Passwords ({passwords.length})
            </TabsTrigger>
            <TabsTrigger value="notes">
              <StickyNote className="mr-2 h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Documents</h2>
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {documents.length === 0 ? (
              <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No documents yet</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-3">
                      <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Passwords Tab */}
          <TabsContent value="passwords" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Passwords</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Password</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        placeholder="e.g., Gmail"
                        value={newSecret.title}
                        onChange={(e) =>
                          setNewSecret({ ...newSecret, title: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={newSecret.content}
                        onChange={(e) =>
                          setNewSecret({ ...newSecret, content: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      onClick={handleAddSecret}
                      disabled={!newSecret.title || !newSecret.content}
                      className="w-full"
                    >
                      Save Password
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {passwords.length === 0 ? (
              <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
                <Key className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No passwords saved</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {passwords.map((pwd) => (
                  <div
                    key={pwd.id}
                    className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <div className="rounded-lg bg-purple-100 dark:bg-purple-900 p-3">
                      <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{pwd.title}</h3>
                      <p className="text-xs text-muted-foreground">••••••••</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => viewSecret(pwd)}>
                      <Unlock className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Secure Notes</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>

            {notes.length === 0 ? (
              <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
                <StickyNote className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No notes yet</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border bg-card p-4 shadow-sm"
                  >
                    <h3 className="font-semibold">{note.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {new Date(note.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
