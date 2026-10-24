import { Suspense } from "react";
import { OrdersDashboard } from "./components/OrdersDashboard";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="bg-brand-800 text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-8 py-4">
          <div className="grid size-9 place-items-center rounded-lg bg-white text-sm font-bold text-brand-800">SO</div>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Sales Order Monitor</h1>
            <p className="text-xs text-brand-200">Orders across all branches</p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-8 py-8">
        {/* useSearchParams in the dashboard needs a Suspense boundary for prerendering. */}
        <Suspense>
          <OrdersDashboard />
        </Suspense>
      </main>
    </div>
  );
}
