import Image from 'next/image'
import React from 'react'

const Browse = () => {
  return (
    <section className="mx-0 md:mx-10 my-8 p-6 py-16 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold text-center mb-8 text-gray-800 uppercase">BROWSE BY dress STYLE</h2>
      <div className='grid grid-cols-2'>
        <Image src={"/cas.png"} height={50} width={50} alt='casual' className='w-1/3'/>
        <Image src={"/cas.png"} height={50} width={50} alt='casual' className='w-2/5'/>
        <Image src={"/cas.png"} height={50} width={50} alt='casual' className='w-1/3'/>
      </div>
    </section>
  )
}

export default Browse