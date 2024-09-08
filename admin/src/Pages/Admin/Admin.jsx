import React from 'react'
import Sidebar from '../../Components/Sidebar'
import { Routes,Route } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct'
import ListProduct from '../../Components/ListProduct'

export default function Admin() {
  return (
    <div className='flex '>
        <Sidebar />
        <Routes>
          <Route path='/addproduct' element={<AddProduct />} />
          <Route path='/listproduct' element={<ListProduct />} />
        </Routes>
    </div>
  )
}
