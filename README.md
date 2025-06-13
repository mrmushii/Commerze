Commerze: Your Modern E-commerce Cloth Store
Commerze is a full-stack, responsive e-commerce platform specializing in clothing. Built with cutting-edge technologies, it offers a seamless shopping experience for customers and robust management tools for administrators.

✨ Features
Product Catalog: Browse a wide range of clothing products.

Detailed product pages with multiple images, descriptions, sizes, colors, material, and gender.

Dynamic price display with discount calculations.

Advanced Filtering & Search:

Sidebar filters on the products page for category, type, price range, color, size, and gender.

Live search bar in the Navbar with instant results dropdown.

Dedicated search results page.

Browse by Dress Style section on the homepage.

Shopping Cart: Persistent cart powered by browser local storage.

Dynamic cart item count on Navbar icon.

Adjust quantities and remove items directly in the cart.

Secure Checkout (Stripe Integration):

Seamless payment processing via Stripe Checkout.

Reliable order creation and stock management using Stripe Webhooks.

Immediate order confirmation on success page with a fallback retry mechanism.

User Authentication (Clerk):

Secure user registration and login.

User-specific dashboards.

User profile management.

Admin Panel:

Protected routes for administrators.

Comprehensive dashboard with key metrics (Total Products, Orders, Revenue) and sales charts.

Product Management: CRUD (Create, Read, Update, Delete) products.

Multi-image upload with react-dropzone and Cloudinary integration.

Order Management: View all orders, update order status.

Reviews & Ratings:

Display customer reviews and average ratings on product pages.

Users can submit reviews with star ratings and comments.

Automated calculation and update of product average rating and review count.

"Our Happy Customers" testimonials section on the homepage (fetches actual reviews).

Notifications: Real-time user feedback using react-hot-toast.

Responsive Design: Fully mobile-responsive layout and navigation with a hamburger menu.

Newsletter Subscription: Simple newsletter sign-up.

About Us & Contact Pages: Dedicated informative pages.

🚀 Technologies Used
Frontend:

Next.js 15+ (App Router)

React

Tailwind CSS v4.0

Shadcn UI (for UI components like Dropdown Menu, Pagination)

Lucide React (for SVG icons)

Axios (HTTP client)

React Hot Toast (notifications)

React Dropzone (file uploads)

Recharts (charting library)

date-fns (date utility)

Backend:

Node.js

MongoDB Atlas (Cloud Database)

Mongoose (MongoDB ODM)

Clerk (Authentication & User Management)

Stripe (Payment Gateway)

Cloudinary (Cloud Image Storage)

Zod (Schema Validation)

React Hook Form (Form Management)

🏁 Getting Started
Follow these steps to set up the project locally.

Prerequisites
Node.js (LTS version recommended)

npm or Yarn

1. Clone the Repository
git clone [https://github.com/mrmushii/Commerze.git](https://github.com/mrmushii/Commerze.git)
cd Commerze


2. Install Dependencies
npm install
# or
yarn install


3. Environment Variables Setup
Create a .env.local file in the root of your project and add the following environment variables. Obtain your keys from the respective service dashboards.

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


Important Notes for Keys:

For Stripe, ensure you're using test mode keys (pk_test_, sk_test_, whsec_) during development.

The STRIPE_WEBHOOK_SECRET is generated when you create a webhook endpoint in your Stripe Dashboard.

4. Configure next.config.js for Image Domains
Add allowed image hostnames to your next.config.js file for next/image component to function correctly with external images (like Clerk user avatars, placeholders, and Cloudinary).

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


5. Run the Development Server
npm run dev
# or
yarn dev


Open http://localhost:3000 with your browser to see the result.

6. Set up Stripe Webhook (for local development)
For Stripe webhooks to reach your local machine, you need a tunneling service like ngrok.

Start your Next.js server (npm run dev).

Start ngrok in a new terminal:

ngrok http 3000


Copy the https:// forwarding URL provided by ngrok (e.g., https://abcdef12345.ngrok-free.app).

Go to your Stripe Dashboard > Developers > Webhooks.

Add a new endpoint (or edit existing) and set the URL to:
[YOUR_NGROK_HTTPS_URL]/api/webhooks/stripe

Select the checkout.session.completed event (and optionally payment_intent.succeeded, charge.failed).

Copy the Signing secret (whsec_...) and paste it into your .env.local as STRIPE_WEBHOOK_SECRET.

7. Create an Admin User
To access the admin panel and manage products/orders:

Sign up or log in to your application as a regular user.

Go to your Clerk Dashboard: https://dashboard.clerk.com/

Navigate to "Users" and select the user you want to make an admin.

Under the "Public metadata" section, add the following JSON:

{
  "role": "admin"
}


Save changes.

Crucially: Sign out of your application completely, clear your browser's site data/cache/cookies for your app's domain, and then sign back in. This ensures your session token includes the new admin role.

📂 Project Structure (Key Directories)
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


🚀 Deployment
The easiest way to deploy your Next.js app is to use the Vercel Platform.

Vercel Environment Variables: Ensure all variables from your .env.local are set as environment variables in your Vercel project settings.

Cloudinary: Remember that local file uploads (public/uploads) will not persist on Vercel. For production, you must use Cloudinary (already integrated in /api/upload/route.ts) and ensure its environment variables are set on Vercel.

Stripe Webhook: For Vercel deployment, update your Stripe webhook URL to point to your Vercel domain: https://your-vercel-domain.vercel.app/api/webhooks/stripe.

Check out the Next.js deployment documentation for more details.

🤝 Contributing
Contributions are welcome! If you find a bug or have an enhancement idea, please open an issue or submit a pull request.

📄 License
This project is open-source and available under the MIT License.