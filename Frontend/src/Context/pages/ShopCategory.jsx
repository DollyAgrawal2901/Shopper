import React, { useEffect, useState, useContext } from 'react';
import { ShopContext } from '../ShopContext';
import dropdown_icon from '../../Components/assets/dropdown_icon.png';
import Item from '../../Components/Items/Item';
import Loader from './Loader'; // Import the Loader component

export default function ShopCategory(props) {
  const { all_product, setAllProducts } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Set local products from context
    setProducts(all_product || []);
  }, [all_product]);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const response = await fetch(`${baseURL}/allproduct`);
        if (response.ok) {
          const data = await response.json();
          
          // Ensure the loader shows for at least 1 second
          setTimeout(() => {
            setNewProducts(data);
            setLoading(false); // Stop loading once data is fetched
            if (setAllProducts) setAllProducts(data); // Update context if needed
          }, 1000); // 1-second minimum loader time
        } else {
          console.error("Error fetching new products from MongoDB");
        }
      } catch (error) {
        console.error("Error fetching new products:", error);
      } finally {
        if (!loading) setLoading(false); // Ensure loader stops even on error
      }
    };

    fetchNewProducts();
  }, [setAllProducts, baseURL, loading]);

  // Combine local and new products
  const combinedProducts = [...newProducts];

  // Filter products by category
  const filteredProducts = combinedProducts.filter(
    (item) => item.category === props.category
  );

  if (loading) {
    return <Loader />; // Display loader while fetching data
  }

  return (
    <div>
      <img className='block my-[30px] mx-auto w-[82%]' src={props.banner} alt="" />
      <div className='flex my-0 mx-[170px] justify-between items-center'>
        <p className='font-semibold'>
          <span className='font-semibold'>Showing 1-{filteredProducts.length}</span> out of {filteredProducts.length} products
        </p>
        <div className='py-[10px] px-[20px] rounded-[40px] border border-[#888]'>
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>
      <div className='my-[20px] mx-[170px] grid grid-cols-4 gap-y-[80px]'>
        {filteredProducts.length === 0 ? (
          <p className='text-center text-gray-500 py-4'>No products available</p>
        ) : (
          filteredProducts.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        )}
      </div>
      <div className='flex justify-center items-center my-[150px] mx-auto w-[233px] h-[69px] rounded-[75px] bg-gray-500 text-gray-900 text-[18px] font-medium'>
        Explore More
      </div>
    </div>
  );
}
