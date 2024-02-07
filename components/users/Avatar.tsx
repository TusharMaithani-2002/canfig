import Image from 'next/image';
import React from 'react'

const IMAGE_SIZE = 48;

interface Props {
    otherStyles?:string,
    name:string
}

const Avatar = ({otherStyles,name}:Props) => {
  return (
    <div className={`relative h-9 w-9 rounded-full ${otherStyles}`} data-tooltip={name}>
        <Image 
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(Math.random() * 30)}.png`}
        height={IMAGE_SIZE} width={IMAGE_SIZE} className='rounded-full' alt={name}/>
    </div>
  )
}

export default Avatar
