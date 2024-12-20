import { ImageGallery } from '@/components/ImageGallery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || 'Not configured';

  return (
    <main className="min-h-screen p-8">
      <div className="container">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          WhatsApp Image Gallery
        </h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
            <CardDescription>
              Send your photos to WhatsApp number:{' '}
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                {whatsappNumber}
              </code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your photos will appear here automatically once they are received!
            </p>
          </CardContent>
        </Card>

        <ImageGallery />
      </div>
    </main>
  );
} 