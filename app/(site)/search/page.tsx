import { Suspense } from "react";

import { SearchPage } from "@/components/site/search-page";

export default function SearchRoutePage() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
