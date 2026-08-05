import { Route, BrowserRouter, Routes } from "react-router-dom";
import { LanguageProvider } from "./i18n/LanguageContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingPage from "./pages/BookingPage";
import ThawaniSuccessPage from "./pages/ThawaniSuccessPage";
import ThawaniCancelledPage from "./pages/ThawaniCancelledPage";
import LookupPage from "./pages/LookupPage";

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-court-50">
            <Header />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/lookup" element={<LookupPage />} />
              <Route path="/booking/:reference/success" element={<ThawaniSuccessPage />} />
              <Route path="/booking/:reference/cancelled" element={<ThawaniCancelledPage />} />
              <Route path="/booking/:reference" element={<BookingPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </LanguageProvider>
  );
}
