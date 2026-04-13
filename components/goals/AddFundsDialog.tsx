'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { PlusCircle } from 'lucide-react'
import { formatINR } from '@/lib/utils'

interface AddFundsDialogProps {
  goalId: string
  goalName: string
  currentAmount: number
  targetAmount: number
  onFundsAdded: () => void
}

export default function AddFundsDialog({ 
  goalId, 
  goalName, 
  currentAmount, 
  targetAmount, 
  onFundsAdded 
}: AddFundsDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const suggestedAmounts = [
    Math.min(5000, remainingAmount),
    Math.min(10000, remainingAmount),
    Math.min(25000, remainingAmount),
    remainingAmount
  ].filter((amt, index, arr) => amt > 0 && arr.indexOf(amt) === index)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const fundAmount = parseFloat(amount)
    if (!fundAmount || fundAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/goals/add-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          goalId,
          amount: fundAmount,
          description: description || `Added funds to ${goalName}`,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add funds')
      }

      const result = await response.json()

      toast({
        title: 'Success',
        description: `${formatINR(fundAmount)} added to ${goalName}!`,
      })

      if (result.newProgress >= 100) {
        toast({
          title: '🎉 Goal Achieved!',
          description: `Congratulations! You've reached your ${goalName} goal!`,
        })
      }

      setAmount('')
      setDescription('')
      setOpen(false)
      onFundsAdded()

    } catch (error: any) {
      console.error('Add funds error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to add funds',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Add Funds to {goalName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Amount:</span>
              <span className="font-medium">{formatINR(currentAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Target Amount:</span>
              <span className="font-medium">{formatINR(targetAmount)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-primary">
              <span>Remaining:</span>
              <span>{formatINR(remainingAmount)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to Add (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                min="1"
                max={remainingAmount}
              />
            </div>

            {suggestedAmounts.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground">Quick amounts:</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {suggestedAmounts.map((suggestedAmount) => (
                    <Button
                      key={suggestedAmount}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(suggestedAmount.toString())}
                      className="text-xs"
                    >
                      {formatINR(suggestedAmount)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="e.g., Monthly savings, bonus, etc."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Funds'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
