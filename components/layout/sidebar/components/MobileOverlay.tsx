"use client"

import React from 'react'

interface MobileOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export const MobileOverlay: React.FC<MobileOverlayProps> = ({ isOpen, onClose }) => {
  return (
    <div
      onClick={onClose}
      className={`lg:hidden fixed inset-0 bg-black transition-opacity duration-300 z-[90] ${
        isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    />
  )
}

export default MobileOverlay