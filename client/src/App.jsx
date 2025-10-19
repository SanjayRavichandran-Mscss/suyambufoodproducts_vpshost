import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerPage from "./Pages/CustomerPage";
import AdminPages from "./Pages/AdminPage";
import AdminLogin from "./components/Authentication/AdminLogin";
import CustomerLogin from "./components/Authentication/CustomerLogin";
import CustomerRegister from "./components/Authentication/CustomerRegister";
import CheckOutPage from "./Pages/CheckOutPage";
import Aboutus from "./components/CustomerComponents/AboutUs";
import ContactUs from "./components/CustomerComponents/ContactUs";
import { AdminProtectedRoute, CustomerProtectedRoute } from "./components/ProtectedRoutes/ProtectedRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<CustomerPage />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/customer" element={<CustomerPage />} /> {/* Made public - handles single product via query params */}
        <Route path="/customerlogin" element={<CustomerLogin />} />
        <Route path="/customerregister" element={<CustomerRegister />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        
        {/* Protected customer routes - only accessible when logged in */}
        <Route element={<CustomerProtectedRoute />}>
          <Route path="/checkout/*" element={<CheckOutPage />} />
        </Route>
        
        {/* Protected admin routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/*" element={<AdminPages />} />
        </Route>
        
        {/* Catch all - redirect to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}