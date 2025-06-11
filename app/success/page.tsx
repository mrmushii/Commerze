import { Suspense } from "react";
import { SuccessPageContent } from "./SuccessPageContent";

// Export the main page component wrapped in Suspense for initial render
export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-700">Loading success page...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
