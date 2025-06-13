# 🛍️ Commerze: Your Style, Reimagined from Chittagong

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-6B54FB?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)](https://stripe.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)


---

<p align="center">
  <em>Step into the world of Commerze, where every thread tells a story. From the bustling heart of Chittagong, Bangladesh, we bring you a seamless blend of traditional craftsmanship and contemporary global fashion.</em>
</p>

---

<p align="center">
  <img src="https://github.com/mrmushii/Commerze/blob/1e6d1c09182ab1eeea9b834e49395674ed76eb82/Screenshot%202025-06-14%20004337.png" alt="Commerze E-commerce Homepage Screenshot" width="800">
  <img src="https://github.com/mrmushii/Commerze/blob/1e6d1c09182ab1eeea9b834e49395674ed76eb82/Screenshot%202025-06-14%20005311.png" alt="Commerze E-commerce Homepage Screenshot" width="800">
  <img src="https://github.com/mrmushii/Commerze/blob/1e6d1c09182ab1eeea9b834e49395674ed76eb82/Screenshot%202025-06-14%20005340.png" alt="Commerze E-commerce Homepage Screenshot" width="800">
  <img src="https://github.com/mrmushii/Commerze/blob/1e6d1c09182ab1eeea9b834e49395674ed76eb82/Screenshot%202025-06-14%20005358.png" alt="Commerze E-commerce Homepage Screenshot" width="800">
  <img src="https://github.com/mrmushii/Commerze/blob/1e6d1c09182ab1eeea9b834e49395674ed76eb82/Screenshot%202025-06-14%20005413.png" alt="Commerze E-commerce Homepage Screenshot" width="800">
  <img src="https://github.com/mrmushii/Commerze/blob/1e6d1c09182ab1eeea9b834e49395674ed76eb82/Screenshot%202025-06-14%20005455.png" alt="Commerze E-commerce Homepage Screenshot" width="800">
</p>

## ✨ Discover Commerze: Features That Elevate Your Shopping Experience

Commerze is not just an online store; it's a meticulously crafted digital boutique offering a unique shopping journey and powerful administrative control.

### 👗 **Intuitive Product Catalog & Browsing**
- **Rich Product Details:** Explore garments with multiple high-resolution images, comprehensive descriptions, available sizes, vibrant colors, specific material compositions, and gender classifications.
- **Dynamic Pricing:** See clear pricing, original price strike-throughs, and calculated discounts for transparent shopping.

### 🔍 **Smart Navigation & Discovery**
- **Advanced Sidebar Filters:** Effortlessly narrow down your choices on the products page by **category (Men, Women, Kids)**, **clothing type (Formal, Casual, Party, Sportswear)**, adjustable price range, specific colors, sizes, and gender.
- **Real-time Search:** A sleek, integrated search bar in the Navbar provides instant product suggestions as you type, leading to a dedicated search results page for comprehensive queries.
- **Curated Dress Styles:** Visually explore and jump directly to collections like "Casual," "Formal," "Party," and "Sportswear" from the homepage.

### 🛒 **Seamless Cart & Checkout Journey**
- **Persistent Shopping Cart:** Your cart intelligently saves items locally, ready for your return.
- **Dynamic Cart Icon:** A lively icon in the Navbar shows the real-time count of items in your cart.
- **Effortless Management:** Easily adjust quantities or remove items directly within your cart.
- **Secure Stripe Checkout:** Experience smooth and secure payment processing with full Stripe integration.
- **Robust Order Processing:** Our system leverages Stripe Webhooks for reliable order creation and accurate stock management, ensuring peace of mind for every transaction.
- **Instant Order Confirmation:** Get immediate feedback on a dedicated success page, with a smart retry mechanism to handle any transient network hiccups.

### 🔐 **Empowering User & Admin Control**
- **Clerk-Powered Authentication:** Enjoy secure and straightforward user registration, login, and robust session management.
- **Personalized Dashboards:** Access user-specific areas to review order history and manage personal profiles.
- **Intuitive Admin Panel:** For store managers, a password-protected, visually stunning dashboard offers:
    - **Key Metrics:** At-a-glance overview of Total Products, Total Orders, and Revenue.
    - **Sales Analytics:** Engaging charts and graphs providing insights into sales performance over time.
    - **Product Lifecycle Management (CRUD):** Full control to Create, Read, Update, and Delete product listings.
        - **Multi-Image Uploads:** Easily upload multiple product images using `react-dropzone`, seamlessly stored on **Cloudinary**.
    - **Order Fulfillment:** Efficiently view and update order statuses.
- **User Feedback System:**
    - **Customer Reviews:** See honest reviews and average ratings directly on each product page.
    - **Review Submission:** Authenticated users can leave star ratings and detailed comments, directly influencing product ratings.
    - **Testimonials Showcase:** A dedicated "Our Happy Customers" section on the homepage highlights recent positive feedback.

### 🌐 **Built for Performance & Modernity**
- **Real-time Notifications:** Stay informed with subtle, timely toasts.
- **Pixel-Perfect Responsiveness:** Flawless display and functionality across all devices, from mobile phones (with a sleek hamburger menu) to large desktops.

---

## 🛠️ Tech Stack: The Engine Behind Commerze

Commerze is built on a modern, robust, and scalable stack, chosen for performance, developer experience, and maintainability.

### 💻 Frontend Arsenal
- **Framework:** **[Next.js 15+](https://nextjs.org/)** (App Router for optimized routing and rendering)
- **Library:** **[React](https://react.dev/)** (for dynamic UI development)
- **Styling:** **[Tailwind CSS v4.0](https://tailwindcss.com/)** (utility-first CSS framework for rapid UI development)
- **UI Components:** **[Shadcn UI](https://ui.shadcn.com/)** (beautiful and accessible UI primitives)
- **Icons:** **[Lucide React](https://lucide.dev/icons/)** (lightweight and customizable SVG icons)
- **API Communication:** **[Axios](https://axios-http.com/)** (promise-based HTTP client)
- **User Feedback:** **[React Hot Toast](https://react-hot-toast.com/)** (elegant notification system)
- **File Uploads:** **[React Dropzone](https://react-dropzone.js.org/)** (intuitive drag-and-drop file upload interface)
- **Data Visualization:** **[Recharts](https://recharts.org/en-US/)** (powerful charting library for admin analytics)
- **Date Utilities:** **[date-fns](https://date-fns.org/)** (modern JavaScript date utility library)

### 🚀 Backend Powerhouse
- **Runtime:** **[Node.js](https://nodejs.org/)** (scalable server-side environment)
- **Database:** **[MongoDB Atlas](https://www.mongodb.com/atlas)** (cloud-hosted, NoSQL database for flexible data storage)
- **ORM/ODM:** **[Mongoose](https://mongoosejs.com/)** (elegant MongoDB object modeling for Node.js)
- **Authentication:** **[Clerk](https://clerk.com/)** (comprehensive user authentication and management)
- **Payment Gateway:** **[Stripe](https://stripe.com/)** (industry-leading platform for online payments)
- **Cloud Storage:** **[Cloudinary](https://cloudinary.com/)** (secure and optimized cloud storage for all product images)
- **Schema Validation:** **[Zod](https://zod.dev/)** (TypeScript-first schema declaration and validation)
- **Form Management:** **[React Hook Form](https://react-hook-form.com/)** (performant and flexible form state management)

---

## ⚡ Getting Started: Launch Commerze Locally

Follow these steps to set up and run Commerze on your local development environment.

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/download/) (LTS version recommended)
- `npm` (comes with Node.js) or [Yarn](https://classic.yarnpkg.com/en/docs/install/)

### 1. Clone the Repository
Start by cloning the Commerze GitHub repository to your local machine:
```bash
git clone [https://github.com/mrmushii/Commerze.git](https://github.com/mrmushii/Commerze.git)
cd Commerze

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
