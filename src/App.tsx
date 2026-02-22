import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PageLoadingSkeleton } from "@/components/PageLoadingSkeleton";
import { RouteScrollToTop } from "@/components/RouteScrollToTop";

const Index = lazy(() => import("./pages/Index"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const Brands = lazy(() => import("./pages/Brands"));
const BrandVichy = lazy(() => import("./pages/BrandVichy"));
const BestSellers = lazy(() => import("./pages/BestSellers"));
const Offers = lazy(() => import("./pages/Offers"));
const Contact = lazy(() => import("./pages/Contact"));
const SkinConcerns = lazy(() => import("./pages/SkinConcerns"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Philosophy = lazy(() => import("./pages/Philosophy"));
const BulkUpload = lazy(() => import("./pages/BulkUpload"));
const AdminOrders = lazy(() => import("./pages/AdminOrders"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const Returns = lazy(() => import("./pages/Returns"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Consultation = lazy(() => import("./pages/Consultation"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <RouteScrollToTop />
          <Suspense fallback={<PageLoadingSkeleton />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/product/:handle" element={<ProductDetail />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:slug" element={<CollectionDetail />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/brands/vichy" element={<BrandVichy />} />
              <Route path="/best-sellers" element={<BestSellers />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/skin-concerns" element={<SkinConcerns />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/philosophy" element={<Philosophy />} />
              <Route path="/shipping" element={<ShippingPolicy />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/tracking" element={<TrackOrder />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/admin/bulk-upload" element={<BulkUpload />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
