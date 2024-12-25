'use client'

import { useState, useEffect } from 'react'
import { ImageGallery } from '@/components/ImageGallery';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RiWhatsappLine } from "react-icons/ri"
import { Button } from "@/components/ui/button"
import { PasswordPrompt } from '@/components/PasswordPrompt'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'Not configured'

  useEffect(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search)
    const urlPassword = urlParams.get('password')
    
    if (urlPassword === 'chippychips') {
      localStorage.setItem('isAuthenticated', 'true')
      setIsAuthenticated(true)
      // Optionally remove the password from URL
      window.history.replaceState({}, '', window.location.pathname)
    } else {
      // Check local storage if URL password isn't present/correct
      const auth = localStorage.getItem('isAuthenticated')
      setIsAuthenticated(auth === 'true')
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return null // or a loading spinner
  }

  if (!isAuthenticated) {
    return <PasswordPrompt onCorrectPassword={() => setIsAuthenticated(true)} />
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-background py-12">
      <div className="container px-4 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Tom's Gallery
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-sm text-muted-foreground">
              A collection of precious moments with Chippy Chips
            </p>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3"
              onClick={() => {
                const howToUse = document.getElementById('how-to-use');
                howToUse?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How to Use
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <ImageGallery />
        </div>
        
        <Card className="mx-auto max-w-2xl" id="how-to-use">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription className="flex items-center gap-2">
              Send your photos to WhatsApp number:{' '}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                {whatsappNumber.replace(/(\+\d{1})(\d{3})(\d{3})(\d{4})/, '$1($2)$3-$4')}
              </code>
              <a
                href={`https://wa.me/${whatsappNumber.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-green-600 p-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 h-10 w-10"
              >
                <RiWhatsappLine className="h-6 w-6" />
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your photos will appear here automatically once they are received. The gallery updates in real-time!
            </p>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your phone's camera to start chatting on WhatsApp
              </p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/${whatsappNumber.replace('+', '')}`}
                alt="WhatsApp QR Code"
                className="rounded-lg shadow-md"
                width={150}
                height={150}
              />
              <p className="text-xs text-muted-foreground">
                Note: Make sure your phone has WhatsApp installed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}