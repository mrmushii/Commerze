import { Suspense } from "react";
import { SuccessPageContent } from "./SuccessPageContent";

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
