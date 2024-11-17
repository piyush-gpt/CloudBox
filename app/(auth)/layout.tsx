import Image from 'next/image'
import React from 'react'

function layout({children}:{children:React.ReactNode}) {
  return (
    <div className=' flex min-h-screen'>
      <section className=' bg-brand p-7 lg:w-2/5 hidden items-center lg:flex justify-center'>
        <div className=' flex max-h-[800px] max-w-[430px] flex-col justify-center space-y-8'>
          <Image src='/assets/icons/main.svg' width={200} height={100} alt='logo'/>
          <div className=' space-y-5 text-white'>
            <h1 className=' h1'>
            Effortless file organization for you
            </h1>
            <p className=' body-1'>
            Safely store and manage all your documents in one convenient location.
            </p>
          </div>
          <Image src='/assets/images/illustrations.png' alt='files' width={250} height={150} className=' hover:rotate-2 hover:scale-105 transition-all'/>
        </div>
      </section>
      <section className=' flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0'>
        <div className=' mb-16 lg:hidden'>
          <Image src='/assets/icons/main.svg' width={200} height={100} alt='logo' className=' w-[200px]'/>
        </div>
        {children}
      </section>
    </div>
  )
}

export default layout