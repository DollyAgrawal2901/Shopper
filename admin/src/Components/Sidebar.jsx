import React from 'react'
import {Link} from 'react-router-dom'
import add_product_icon from '../assets/Product_Cart.svg'
import list_product_icon from '../assets/Product_list_icon.svg'

export default function Sidebar() {
  return (
    <div className='flex flex-col pt-[30px] gap-[20px] w-[100%] max-w-[250px] h-[100vh] bg-slate-100'>
        <Link to={'/addproduct'} style={{textDecoration:'none'}}>
        <div className='flex items-center justify-center my-[0px] mx-[20px] py-[5px] px-[10px] rounded-[6px] bg-slate-300 gap-[20px] cursor-pointer'>
            <img src={add_product_icon} alt="" />
            <p>Add Product</p>
        </div>
        </Link>
        <Link to={'/listproduct'} style={{textDecoration:'none'}}>
        <div className='flex items-center justify-center my-[0px] mx-[20px] py-[5px] px-[10px] rounded-[6px] bg-slate-300 gap-[20px] cursor-pointer'>
            <img src={list_product_icon} alt="" />
            <p>Product List</p>
        </div>
        </Link>
    </div>
  )
}
