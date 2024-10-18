import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../ShopContext';
import { useParams } from 'react-router-dom';
import Breadcrum from '../../Components/Breadcrum';
import ProductDisplay from '../../Components/ProductDisplay';
import DescriptionBox from '../../Components/DescriptionBox';
import RelatedProducts from '../../Components/RelatedProducts';
import Loader from './Loader'; // Assuming you have a Loader component

export default function Product() {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProduct = async () => {
      try {
        // Check if product exists in local data
        const localProduct = all_product.find((e) => e.id === Number(productId));

        if (localProduct) {
          setProduct(localProduct); // Use local product data if found
          setLoading(false); // Data is loaded, hide loader
        } else {
          // If not found locally, fetch product from MongoDB
          const response = await fetch(`${baseURL}/product/${productId}`);
          if (response.ok) {
            const data = await response.json();
            setProduct(data); // Set fetched data from MongoDB
          } else {
            setError("Product not found in MongoDB");
          }
          setLoading(false); // Data is loaded, hide loader
        }
      } catch (error) {
        setError("Error fetching product from MongoDB");
        console.error("Error fetching product from MongoDB:", error);
        setLoading(false); // In case of error, stop loader
      }
    };

    // Start fetching data immediately
    fetchProduct();
  }, [all_product, productId]);

  if (loading) {
    return <Loader />; // Display loader while fetching data
  }

  if (error) {
    return <div>{error}</div>; // Display error message if any
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox />
      <RelatedProducts currentCategory={product.category} />
    </div>
  );
}
