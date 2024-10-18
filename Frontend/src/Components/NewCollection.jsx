import React, { useState, useEffect } from 'react';
import Item from './Items/Item';
import Loader from '../Context/pages/Loader'; // Assuming you have a Loader component

export default function NewCollection() {
  const [newCollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const baseURL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch new collection data from backend
    const fetchNewCollections = async () => {
      try {
        const response = await fetch(`${baseURL}/newcollections`);
        const data = await response.json();
        setNewCollection(data);
      } catch (error) {
        console.error("Error fetching new collections:", error);
      } finally {
        setLoading(false); // Hide loader after fetching is complete
      }
    };

    fetchNewCollections(); // Start fetching data in parallel
  }, [baseURL]);

  if (loading) {
    return <Loader />; // Show loader while data is being fetched
  }

  return (
    <div className="flex flex-col items-center gap-[20px] mb-[100px]">
      <h1 className='text-gray-950 text-[50px] font-semibold'>
        NEW COLLECTIONS
      </h1>
      <hr className='w-[200px] h-[6px] rounded-[10px] bg-slate-800' />
      <div className="grid grid-cols-4 mt-[50px] gap-[30px]">
        {newCollection.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
}
