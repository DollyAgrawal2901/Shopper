import React from 'react'

export default function LoginSignup() {
  return (
    <div className='w-[100%] bg-lime-100 pt-[100px] pb-[30px]'>
        <div className='w-[580px] h-[620px] bg-white m-auto py-[40px] px-[60px]'>
          <h1 className='mx-[0px] font-bold text-[30px]'>Sign Up</h1>
          <div className='flex flex-col gap-[29px] mt-[30px]'>
            <input className='h-[72px] w-[100%] pl-[20px] border border-[#c9c9c9] outline-none text-gray-600 text-[18px]' type="text" placeholder='Your Name' />
            <input className='h-[72px] w-[100%] pl-[20px] border border-[#c9c9c9] outline-none text-gray-600 text-[18px]' type="email" placeholder='Email Address' />
            <input className='h-[72px] w-[100%] pl-[20px] border border-[#c9c9c9] outline-none text-gray-600 text-[18px]' type="password" placeholder='Password' />
          </div>
          <button className='w-[480px] h-[66px] text-white bg-sky-400 mt-[30px] border-none text-[24px] font-medium cursor-pointer'>Continue</button>
          <p className='mt-[20px] text-slate-600 text-[18px] font-medium'>Already have an account? <span className='text-red-600 font-semibold'>Login here</span></p>
          <div className='flex items-center mt-[25px] gap-[20px] text-slate-600 text-[18px] font-medium'>
            <input type="checkbox" name='' id='' />
            <p>By Continuing, i agree to the terms of use & privacy policy.</p>
          </div>
        </div>
    </div>
  )
}
