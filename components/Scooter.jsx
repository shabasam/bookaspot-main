import React from 'react'
import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";



const Sooter = () => {
  return (
    <div className='w-full bg-white drop-shadow-2xl  '>
        <div className='text-center mt-10 font-bold'>Streams</div>
        <div className="flex justify-center gap-2">
         <FaXTwitter />
         <FaInstagram />
         <FaLinkedinIn />
        </div>
        
    </div>
  )
}

export default Sooter