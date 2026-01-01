# Simple Product Store

A modern e-commerce platform built with Next.js 16, Supabase, TypeScript, and TailwindCSS.

## Prerequisites

- Node.js v20.19.6
- npm v10.8.2
- npx v10.8.2

## Quick Start

### 1. Supabase Setup

1. **Create a Supabase Project** at [supabase.com](https://supabase.com)

2. **Get Your Credentials**
   - Go to Project Settings > API
   - Copy the `Project URL` and `publishable_key`

3. **Run the Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and run the contents of `supabase_schema.sql`

4. **Create Storage Bucket**
   - Go to Storage in Supabase dashboard
   - Create a new public bucket named `products`

### 2. Configure Environment Variables

```bash
cp env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key-here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Authentication**: Email/password registration, login, protected routes
- **Product Management**: Create, edit, delete products with multiple images
- **Public Product Pages**: Shareable URLs, image carousel
- **Shopping Cart & Checkout**: Add to cart, mock checkout process

## Tech Stack

- **Frontend**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Heroicons

## Project Structure

```
ng-assignment/
├── app/                    # App Router pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # User dashboard
│   ├── products/[id]/     # Product edit page
│   ├── p/[shareId]/       # Public product view
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout flow
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── contexts/              # React contexts (AuthContext)
├── lib/                   # Utilities (supabase, products, cart)
├── middleware.ts          # Route protection
└── supabase_schema.sql    # Database schema
```

## Troubleshooting

### Images not uploading
- Verify the `products` storage bucket is public
- Ensure file size is under 5MB

### Authentication not working
- Verify environment variables are set correctly
- Check Supabase Auth settings

### Database errors
- Verify SQL schema was run successfully
- Check RLS policies are enabled
