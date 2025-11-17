import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import SiteLayout from "@/components/layouts/SiteLayout";

// Lazy load all page components for code splitting
const BankingAreas = lazy(() => import("./pages/BankingAreas"));
const Home = lazy(() => import("./pages/Home"));
const Layers = lazy(() => import("./pages/Layers"));
const DomainDetail = lazy(() => import("./pages/DomainDetail"));
const DepositsUnifiedModel = lazy(() => import("./pages/DepositsUnifiedModel"));
const DepositsAssessment = lazy(() => import("./pages/DepositsAssessment"));
const DataModels = lazy(() => import("./pages/DataModels"));
const RetailBankingProgress = lazy(() => import("./pages/RetailBankingProgress"));
const PlatformSummary = lazy(() => import("./pages/PlatformSummary"));
const NotFound = lazy(() => import("./pages/NotFound"));

// New Blueprint Pages
const PlatformBlueprintHome = lazy(() => import("./pages/PlatformBlueprintHome"));
const PlatformBlueprintDomainOverview = lazy(() => import("./pages/PlatformBlueprintDomainOverview"));
const PlatformBlueprintDomainBusinessMetrics = lazy(() => import("./pages/PlatformBlueprintDomainBusinessMetrics"));
const PlatformBlueprintDomainDataModels = lazy(() => import("./pages/PlatformBlueprintDomainDataModels"));
const PlatformBlueprintDomainSTTM = lazy(() => import("./pages/PlatformBlueprintDomainSTTM"));
const PlatformBlueprintDomainSources = lazy(() => import("./pages/PlatformBlueprintDomainSources"));
const PlatformBlueprintDomainOperations = lazy(() => import("./pages/PlatformBlueprintDomainOperations"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteLayout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<BankingAreas />} />
              <Route path="/domains" element={<Home />} />
              <Route path="/layers" element={<Layers />} />
              <Route path="/data-models" element={<DataModels />} />
              <Route path="/platform-summary" element={<PlatformSummary />} />
              <Route path="/domain/:domainId" element={<DomainDetail />} />
              <Route path="/domain/deposits/unified-model" element={<DepositsUnifiedModel />} />
              <Route path="/domain/deposits/assessment" element={<DepositsAssessment />} />
              <Route path="/retail-banking/progress" element={<RetailBankingProgress />} />

              {/* New Platform Blueprint Routes */}
              <Route path="/platform-blueprint" element={<PlatformBlueprintHome />} />
              <Route path="/platform-blueprint/domain/:domainId" element={<PlatformBlueprintDomainOverview />} />
              <Route path="/platform-blueprint/domain/:domainId/business-metrics" element={<PlatformBlueprintDomainBusinessMetrics />} />
              <Route path="/platform-blueprint/domain/:domainId/data-models" element={<PlatformBlueprintDomainDataModels />} />
              <Route path="/platform-blueprint/domain/:domainId/sttm" element={<PlatformBlueprintDomainSTTM />} />
              <Route path="/platform-blueprint/domain/:domainId/sources" element={<PlatformBlueprintDomainSources />} />
              <Route path="/platform-blueprint/domain/:domainId/operations" element={<PlatformBlueprintDomainOperations />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </SiteLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Prevent double root creation during HMR in development
const rootElement = document.getElementById("root")!;
if (!rootElement.hasChildNodes()) {
  createRoot(rootElement).render(<App />);
}
