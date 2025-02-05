# Modern Journal App

A modern journaling application built with Next.js, TypeScript, Clerk Authentication, and NeonDB.

## Features

- 🔐 Secure authentication with Clerk
- 📝 Create, read, update, and delete journal entries
- 🎨 Beautiful and responsive UI with shadcn/ui
- 🌙 Dark mode support
- 🎭 Mood tracking
- 🏷️ Tag your entries
- ✨ Smooth animations with Framer Motion

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Clerk Authentication
- Prisma ORM
- NeonDB (PostgreSQL)
- Tailwind CSS
- shadcn/ui
- Framer Motion

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/mahfuz0001/journal.nexonlabs.uk.git
cd journal-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Fill in your Clerk and NeonDB credentials

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Environment
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
