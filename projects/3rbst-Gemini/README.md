<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 3rbst - German Document Helper

WhatsApp-based AI service that helps Arabic speakers in Germany understand their German documents using Google Gemini AI and Evolution API.

## Features

- 📄 Analyze German documents via WhatsApp
- 🤖 AI-powered explanations in Arabic
- 💳 Credit-based system with PayPal integration
- 🔒 Privacy-focused (images are blurred before AI processing)
- ⚡ Instant responses via WhatsApp
- 📊 Supabase database for user management

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Vercel Serverless Functions
- **AI**: Google Gemini 2.0 Flash
- **Database**: Supabase (PostgreSQL)
- **WhatsApp**: Evolution API v2
- **Payments**: PayPal
- **Infrastructure**: Docker + Nginx

## Quick Start (Local Development)

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd 3rbst-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your credentials:
   ```env
   GEMINI_API_KEY=your-gemini-api-key
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=your-supabase-key

   # Optional for local testing (not needed for frontend only)
   EVOLUTION_API_URL=https://wa.your-domain.com
   EVOLUTION_API_TOKEN=your-token
   EVOLUTION_INSTANCE=your-instance
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

5. **Build for production**
   ```bash
   npm run build
   ```

## Deployment

For complete deployment instructions including:
- Supabase database setup
- Evolution API (WhatsApp) configuration
- Vercel deployment
- SSL certificate setup
- Production environment configuration

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.**

## Project Structure

```
3rbst-app/
├── api/                    # Vercel Serverless Functions
│   ├── analyze.ts         # Document analysis endpoint
│   ├── webhook.ts         # WhatsApp webhook handler
│   └── fulfill-order.ts   # Payment fulfillment
├── components/            # React components
│   ├── Analyzer.tsx      # Document analyzer UI
│   ├── PaymentModal.tsx  # Payment integration
│   └── ...
├── services/             # Backend services
│   ├── geminiService.ts  # Google Gemini AI integration
│   ├── supabase.ts       # Database operations
│   └── whatsappService.ts # WhatsApp messaging
├── docker-compose.yml    # Evolution API deployment
├── nginx.conf           # Reverse proxy configuration
└── vercel.json          # Vercel deployment config
```

## Environment Variables

See `.env.example` for all required environment variables.

### Required for Frontend
- `GEMINI_API_KEY` - Google Gemini API key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key

### Required for WhatsApp Integration
- `EVOLUTION_API_URL` - Evolution API endpoint
- `EVOLUTION_API_TOKEN` - Evolution API authentication token
- `EVOLUTION_INSTANCE` - WhatsApp instance name

## API Endpoints

- `GET /` - Frontend React app
- `POST /api/analyze` - Analyze document image
- `POST /api/webhook` - WhatsApp webhook receiver
- `POST /api/fulfill-order` - Process payments and add credits

## Contributing

This is a private project. For questions or support, contact the project maintainer.

## Security Notes

- All images are anonymized (blurred) before being sent to AI
- Environment variables should never be committed to git
- Use strong tokens for Evolution API
- Enable Supabase Row Level Security in production

## License

Proprietary - All rights reserved

## Support

For deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md)
# Force Vercel refresh: 1765550455
