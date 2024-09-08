import React from 'react'
import navlogo from '../assets/nav-logo.svg'
import navProfile from '../assets/nav-profile.svg'

export default function Navbar() {
  return (
    <div className='flex items-center justify-between py-[15px] px-[60px] shadow-[0_1px_3px_-2px_rgba(0,0,0,1)] mb-[1px] bg-amber-100'>
        <img className='w-[200px] ' src={navlogo} alt="" />
        <img className='w-[75px]' src={navProfile} alt="" />
        
    </div>
  )
}
