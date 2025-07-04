import React from 'react'
import HeaderDesk from '@/public/assets/layout/header.svg'
import HeaderMob from '@/public/assets/layout/header-mob.svg'
import Image from 'next/image'

const HeaderContainer = () => {
  return (
    <section className='w-full sticky'>
        <Image src={HeaderDesk} alt='Nav' className='w-full hidden md:block'/>
        <Image src={HeaderMob} alt='Nav' className='w-full block md:hidden '/>
    </section>
  )
}

export default HeaderContainer
