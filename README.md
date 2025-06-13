````markdown
# Commerze: Your Modern E-commerce Cloth Store

![Commerze Screenshot Placeholder](https://placehold.it/1200x600.png?text=Commerze+E-commerce+Homepage)

Commerze is a full-stack, responsive e-commerce platform specializing in clothing. Built with cutting-edge technologies, it offers a seamless shopping experience for customers and robust management tools for administrators.

## ✨ Features

* **Product Catalog:** Browse a wide range of clothing products.
    * Detailed product pages with multiple images, descriptions, sizes, colors, material, and gender.
    * Dynamic price display with discount calculations.
* **Advanced Filtering & Search:**
    * Sidebar filters on the products page for category, type, price range, color, size, and gender.
    * Live search bar in the Navbar with instant results dropdown.
    * Dedicated search results page.
    * Browse by Dress Style section on the homepage.
* **Shopping Cart:** Persistent cart powered by browser local storage.
    * Dynamic cart item count on Navbar icon.
    * Adjust quantities and remove items directly in the cart.
* **Secure Checkout (Stripe Integration):**
    * Seamless payment processing via Stripe Checkout.
    * Reliable order creation and stock management using Stripe Webhooks.
    * Immediate order confirmation on success page with a fallback retry mechanism.
* **User Authentication (Clerk):**
    * Secure user registration and login.
    * User-specific dashboards.
    * User profile management.
* **Admin Panel:**
    * Protected routes for administrators.
    * Comprehensive dashboard with key metrics (Total Products, Orders, Revenue) and sales charts.
    * Product Management: CRUD (Create, Read, Update, Delete) products.
        * Multi-image upload with `react-dropzone` and Cloudinary integration.
    * Order Management: View all orders, update order status.
* **Reviews & Ratings:**
    * Display customer reviews and average ratings on product pages.
    * Users can submit reviews with star ratings and comments.
    * Automated calculation and update of product average rating and review count.
    * "Our Happy Customers" testimonials section on the homepage (fetches actual reviews).
* **Notifications:** Real-time user feedback using `react-hot-toast`.
* **Responsive Design:** Fully mobile-responsive layout and navigation with a hamburger menu.
* **Newsletter Subscription:** Simple newsletter sign-up.
* **About Us & Contact Pages:** Dedicated informative pages.

## 🚀 Technologies Used

* **Frontend:**
    * [Next.js 15+](https://nextjs.org/) (App Router)
    * [React](https://react.dev/)
    * [Tailwind CSS v4.0](https://tailwindcss.com/)
    * [Shadcn UI](https://ui.shadcn.com/) (for UI components like Dropdown Menu, Pagination)
    * [Lucide React](https://lucide.dev/icons/) (for SVG icons)
    * [Axios](https://axios-http.com/) (HTTP client)
    * [React Hot Toast](https://react-hot-toast.com/) (notifications)
    * [React Dropzone](https://react-dropzone.js.org/) (file uploads)
    * [Recharts](https://recharts.org/en-US/) (charting library)
    * [date-fns](https://date-fns.org/) (date utility)
* **Backend:**
    * [Node.js](https://nodejs.org/)
    * [MongoDB Atlas](https://www.mongodb.com/atlas) (Cloud Database)
    * [Mongoose](https://mongoosejs.com/) (MongoDB ODM)
    * [Clerk](https://clerk.com/) (Authentication & User Management)
    * [Stripe](https://stripe.com/) (Payment Gateway)
    * [Cloudinary](https://cloudinary.com/) (Cloud Image Storage)
    * [Zod](https://zod.dev/) (Schema Validation)
    * [React Hook Form](https://react-hook-form.com/) (Form Management)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

* Node.js (LTS version recommended)
* npm or Yarn

### 1. Clone the Repository

```bash
git clone [https://github.com/mrmushii/Commerze.git](https://github.com/mrmushii/Commerze.git)
cd Commerze
````

### 2\. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3\. Environment Variables Setup

Create a `.env.local` file in the root of your project and add the following environment variables. Obtain your keys from the respective service dashboards.

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<your-username>:<your-password>@<your-cluster>.mongodb.net/<your-database-name>?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_YOUR_STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_STRIPE_WEBHOOK_SECRET

# Cloudinary Image Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Important Notes for Keys:**

  * For Stripe, ensure you're using **test mode** keys (`pk_test_`, `sk_test_`, `whsec_`) during development.
  * The `STRIPE_WEBHOOK_SECRET` is generated when you create a webhook endpoint in your Stripe Dashboard.

### 4\. Configure `next.config.js` for Image Domains

Add allowed image hostnames to your `next.config.js` file for `next/image` component to function correctly with external images (like Clerk user avatars, placeholders, and Cloudinary).

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'placehold.it',       // For general placeholders (e.g., cart images)
      'placehold.co',       // For specific placeholders (e.g., banner, default product images)
      'img.clerk.com',      // For Clerk user profile images
      'res.cloudinary.com', // For Cloudinary hosted images
      // Add any other external image hostnames here if you use them
    ],
  },
};

module.exports = nextConfig;
```

### 5\. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

### 6\. Set up Stripe Webhook (for local development)

For Stripe webhooks to reach your local machine, you need a tunneling service like `ngrok`.

1.  **Start your Next.js server** (`npm run dev`).
2.  **Start ngrok in a new terminal:**
    ```bash
    ngrok http 3000
    ```
3.  **Copy the `https://` forwarding URL** provided by ngrok (e.g., `https://abcdef12345.ngrok-free.app`).
4.  **Go to your Stripe Dashboard \> Developers \> Webhooks.**
5.  **Add a new endpoint** (or edit existing) and set the URL to:
    `[YOUR_NGROK_HTTPS_URL]/api/webhooks/stripe`
6.  **Select the `checkout.session.completed` event** (and optionally `payment_intent.succeeded`, `charge.failed`).
7.  **Copy the `Signing secret`** (`whsec_...`) and paste it into your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

### 7\. Create an Admin User

To access the admin panel and manage products/orders:

1.  Sign up or log in to your application as a regular user.
2.  Go to your Clerk Dashboard: [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
3.  Navigate to **"Users"** and select the user you want to make an admin.
4.  Under the **"Public metadata"** section, add the following JSON:
    ```json
    {
      "role": "admin"
    }
    ```
5.  Save changes.
6.  **Crucially:** Sign out of your application completely, clear your browser's site data/cache/cookies for your app's domain, and then sign back in. This ensures your session token includes the new `admin` role.

## 📂 Project Structure (Key Directories)

```
/
├── app/                  # Next.js App Router (pages & API routes)
│   ├── (auth)/           # Clerk authentication pages
│   ├── admin/            # Admin dashboard & management pages
│   ├── api/              # Backend API routes
│   ├── dashboard/        # User dashboard & order history
│   ├── products/         # Public product listing & detail pages
│   ├── ...               # Other static pages (cart, success, cancel, about, contact)
│   └── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/           # Reusable React components
│   ├── admin/            # Admin-specific components
│   ├── navbar/           # Navbar sub-components
│   ├── ui/               # Shadcn UI components
│   └── ...               # General components
├── lib/                  # Utility functions (dbConnect, cartEvents)
├── models/               # Mongoose schemas (Product, Order, Review, UserCart)
├── public/               # Static assets (images, fonts)
│   └── uploads/          # (Ephemeral) Directory for local image uploads via API
├── types.ts              # Global TypeScript interfaces
└── ...                   # Other config files (next.config.js, tailwind.config.js)
```

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

  * **Vercel Environment Variables:** Ensure all variables from your `.env.local` are set as environment variables in your Vercel project settings.
  * **Cloudinary:** Remember that local file uploads (`public/uploads`) will not persist on Vercel. For production, **you must use Cloudinary** (already integrated in `/api/upload/route.ts`) and ensure its environment variables are set on Vercel.
  * **Stripe Webhook:** For Vercel deployment, update your Stripe webhook URL to point to your Vercel domain: `https://your-vercel-domain.vercel.app/api/webhooks/stripe`.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🤝 Contributing

Contributions are welcome\! If you find a bug or have an enhancement idea, please open an issue or submit a pull request.

## 📄 License

This project is open-source and available under the [MIT License](https://opensource.org/licenses/MIT).

```
```