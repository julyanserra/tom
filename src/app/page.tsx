'use client'

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

export default function Home() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'Not configured';

  return (
    <main className="flex min-h-screen flex-col items-center bg-background py-12">
      <div className="container px-4 space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Tom's Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-[750px]">
            Share your photos and videos instantly through WhatsApp
          </p>
          <Button
            variant="outline"
            onClick={() => {
              const howToUse = document.getElementById('how-to-use');
              howToUse?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How to Use
          </Button>
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
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md bg-green-600 p-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 h-10 w-10"
              >
                <RiWhatsappLine className="h-6 w-6" />
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your photos will appear here automatically once they are received. The gallery updates in real-time!
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}