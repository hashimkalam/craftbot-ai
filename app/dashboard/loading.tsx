import Image from 'next/image'
import logo from "@/public/images/just_logo.png"

function Loading() {
  return (
    <div className='mx-auto animate-spin p-10'> 
        <Image src={logo} alt="Logo" className="w-24 lg:w-32" />
       
    </div>
  )
}

export default Loading