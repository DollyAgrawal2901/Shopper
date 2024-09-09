import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../ShopContext';
import { useParams } from 'react-router-dom';
import Breadcrum from '../../Components/Breadcrum';
import ProductDisplay from '../../Components/ProductDisplay';
import DescriptionBox from '../../Components/DescriptionBox';
import RelatedProducts from '../../Components/RelatedProducts';

export default function Product() {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const baseURL =  import.meta.env.VITE_API_URL;

  useEffect(() => {
    const localProduct = all_product.find((e) => e.id === Number(productId));

    if (localProduct) {
      setProduct(localProduct);
    } else {
      // Fetch product from MongoDB if not found locally
      const fetchProductFromDB = async () => {
        try {
          const response = await fetch(`${baseURL}/product/${productId}`);
          if (response.ok) {
            const data = await response.json();
            setProduct(data);
          } else {
            console.error("Product not found in MongoDB");
          }
        } catch (error) {
          console.error("Error fetching product from MongoDB:", error);
        }
      };
      fetchProductFromDB();
    }
  }, [all_product, productId]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Breadcrum product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox />
      <RelatedProducts />
    </div>
  );
}
