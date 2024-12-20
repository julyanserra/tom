# WhatsApp Image Gallery

This application receives images from WhatsApp messages and displays them in a real-time gallery using Next.js and Supabase.

## Prerequisites

1. A Meta Developer account with WhatsApp Business API access
2. A Supabase account with a new project
3. Node.js 16+ installed

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   WHATSAPP_TOKEN=your-whatsapp-token
   WHATSAPP_VERIFY_TOKEN=your-verify-token
   ```

4. Set up your Supabase database by creating a table named `images` with the following columns:
   - `id` (int8) - Identity column
   - `image_data` (text) - To store base64 encoded images
   - `message_id` (text) - WhatsApp message ID
   - `timestamp` (timestamptz) - Timestamp of when the image was received

5. Configure your WhatsApp webhook:
   - Use your deployed application URL + `/api/webhook` as the webhook URL
   - Use your `WHATSAPP_VERIFY_TOKEN` for verification
   - Subscribe to the messages webhook

6. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- Receives images from WhatsApp messages
- Stores images in Supabase
- Real-time updates when new images are received
- Responsive grid layout
- Dark mode support

## Development

The application is built with:
- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- WhatsApp Cloud API 