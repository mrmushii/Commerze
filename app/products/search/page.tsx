import React, { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading search page...</div>}>
      <SearchClient />
    </Suspense>
  );
}