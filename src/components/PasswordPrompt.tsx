'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface PasswordPromptProps {
  onCorrectPassword: () => void
}

export function PasswordPrompt({ onCorrectPassword }: PasswordPromptProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'chippychips') {
      localStorage.setItem('isAuthenticated', 'true')
      onCorrectPassword()
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enter Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-500">Incorrect password</p>
            )}
            <div className="space-y-2">
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setShowHint(!showHint)}
              >
                {showHint ? 'Hide hint' : 'Need a hint?'}
              </Button>
              {showHint && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    🥶 Cold Palmer
                  </p>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 