"use client"

import React from 'react'
import { Menu, X } from 'lucide-react'

interface MobileToggleProps {
  isOpen: boolean
  onToggle: () => void
}

export const MobileToggle: React.FC<MobileToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-[100] p-3 rounded-lg bg-teal-500 text-white shadow-lg hover:bg-teal-600 transition-colors duration-200"
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
    >
      {isOpen ? <X size={20} /> : <Menu size={20} />}
    </button>
  )
}

export default MobileToggle