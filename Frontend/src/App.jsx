import Navbar from "./Components/Navbar";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { useState, useEffect } from "react";
import Shop from "./Context/pages/Shop";
import ShopCategory from "./Context/pages/ShopCategory";
import Product from "./Context/pages/Product";
import Cart from "./Context/pages/Cart";
import LoginSignup from "./Context/pages/LoginSignup";
import Footer from "./Components/Footer";
import men_banner from './Components/assets/banner_mens.png';
import women_banner from './Components/assets/banner_women.png';
import kid_banner from './Components/assets/banner_kids.png';
import SuccessPage from "./Context/pages/SuccessPage";
import Profile from "./Context/pages/Profile";
import OrderedItems from "./Context/pages/OrderedItems";
import Loader from "./Context/pages/Loader"; // Import the loader


const AppContent = () => {
  const location = useLocation();
  const isSuccessPage = location.pathname === '/success';
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Stop loader after 3 seconds
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Simulate data fetching
  useEffect(() => {
    setLoading(true); // Start loading again when data fetch begins
    
    // Simulate data fetching here, e.g. fetch from API
    const fetchData = async () => {
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Adjust based on your data-fetching logic
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Stop loader when data is loaded
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {loading ? (
        <Loader />  // Show loader when loading is true
      ) : (
      <>
      {!isSuccessPage && <Navbar />}
        <Routes>
          <Route path='/' element={<Shop />} />
          <Route path='/mens' element={<ShopCategory banner={men_banner} category='men' />} />
          <Route path='/womens' element={<ShopCategory banner={women_banner} category='women' />} />
          <Route path='/kids' element={<ShopCategory banner={kid_banner} category='kid' />} />
          
          <Route path='/product/:productId' element={<Product />} />
          
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<LoginSignup />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ordereditems" element={<OrderedItems />} />
        </Routes>
      {!isSuccessPage && <Footer />}
      </>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
