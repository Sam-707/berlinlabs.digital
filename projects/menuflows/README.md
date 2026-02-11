# MenuFlows - Digital Restaurant Experience Platform

> Empowering every restaurant to offer a premium digital ordering experience

<div align="center">

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Sam-707/menuflows)
[![GitHub](https://img.shields.io/github/license/Sam-707/menuflows)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

</div>

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

1. **Click the Deploy button above** or visit [Vercel](https://vercel.com/new/clone?repository-url=https://github.com/Sam-707/menuflows)

2. **Set Environment Variables** in Vercel dashboard:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Deploy** - Vercel will automatically build and deploy your app

### Set Up Supabase Backend

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the schema** - Copy and paste `supabase-schema-multitenant.sql` in the SQL editor
3. **Get your credentials** from Settings → API
4. **Update environment variables** in Vercel

## 🏃‍♂️ Run Locally

**Prerequisites:** Node.js 20+ and npm

```bash
# Clone the repository
git clone https://github.com/Sam-707/menuflows.git
cd menuflows

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🏗️ Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Deployment**: Vercel
- **Multi-tenant**: URL-based routing (`/restaurant-slug`)

## 📱 Features

### For Customers
- 📱 **No app download** - QR code → mobile browser
- 🍔 **Browse menu** with categories and modifiers
- 🛒 **Shopping cart** with real-time updates
- 🤝 **Waiter handshake** - preserves hospitality

### For Restaurant Owners
- 🔐 **PIN authentication** - quick staff login
- 📊 **Dashboard** - orders, kitchen display, analytics
- 🍽️ **Menu management** - easy inventory updates
- 🎨 **Branding** - customize colors, logo, settings

### For Platform Admins
- 🏢 **Multi-tenant management** - create restaurants
- 📈 **Platform analytics** - cross-restaurant insights
- 🛠️ **Menu templates** - business-type specific setups

## 🌐 Live Demo

- **Customer Experience**: [menuflows.vercel.app/demo](https://menuflows.vercel.app/demo)
- **Owner Dashboard**: [menuflows.vercel.app/demo](https://menuflows.vercel.app/demo) → Enter PIN: `1234`
- **Admin Panel**: [menuflows.vercel.app/admin](https://menuflows.vercel.app/admin)

## 📚 Documentation

Comprehensive documentation is available in the [`/DOCS`](./DOCS) folder:

- [📖 Overview](./DOCS/README.md) - Project introduction and setup
- [🏗️ Architecture](./DOCS/ARCHITECTURE.md) - Technical design and structure  
- [✨ Features](./DOCS/FEATURES.md) - Complete feature documentation
- [🗄️ Database](./DOCS/DATABASE.md) - Schema and relationships
- [🚀 Deployment](./DOCS/DEPLOYMENT.md) - Production deployment guide
- [🔧 Troubleshooting](./DOCS/TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./DOCS/CONTRIBUTING.md) for details.

## 📄 License

This project is proprietary software. All rights reserved.

---

**Built with ❤️ for the restaurant industry**
