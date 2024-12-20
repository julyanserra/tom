import { ImageGallery } from '@/components/ImageGallery';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'Not configured';

  return (
    <main className="flex min-h-screen flex-col items-center bg-background py-12">
      <div className="container px-4 space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            WhatsApp Image Gallery
          </h1>
          <p className="text-xl text-muted-foreground max-w-[750px]">
            Share your photos instantly through WhatsApp
          </p>
        </div>
        
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription>
              Send your photos to WhatsApp number:{' '}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                {whatsappNumber}
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your photos will appear here automatically once they are received. The gallery updates in real-time!
            </p>
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <ImageGallery />
        </div>
      </div>
    </main>
  );
} 