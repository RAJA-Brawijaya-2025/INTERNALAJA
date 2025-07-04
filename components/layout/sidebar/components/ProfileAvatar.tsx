"use client"

import React, { useState } from 'react'
import Image from 'next/image'

interface ProfileAvatarProps {
  imageUrl?: string
  name?: string
  size?: "sm" | "md" | "lg"
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  imageUrl, 
  name, 
  size = "md" 
}) => {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm", 
    lg: "w-12 h-12 text-base"
  }

  const getInitials = (name?: string): string => {
    if (!name) return "U"
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  if (imageUrl && !imageError) {
    return (
      <div className={`relative ${sizeClasses[size].split(' ').slice(0, 2).join(' ')} rounded-full overflow-hidden`}>
        <Image
          src={imageUrl}
          alt={name || 'User'}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
          sizes="40px"
        />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-teal-500 flex items-center justify-center`}>
      <span className="text-white font-medium">{getInitials(name)}</span>
    </div>
  )
}

export default ProfileAvatar