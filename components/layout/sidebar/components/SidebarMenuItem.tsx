"use client"

import React from 'react'
import Link from 'next/link'
import type { MenuItem } from '../types'

interface SidebarMenuItemProps {
  item: MenuItem
  isActive: boolean
  onClose: () => void
  isCollapsed?: boolean
}

export const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({ 
  item, 
  isActive, 
  onClose,
  isCollapsed = false 
}) => {
  const Icon = item.icon

  return (
    <li className="relative">
      <Link
        href={item.href}
        className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
          isActive
            ? 'bg-teal-500 text-white font-medium shadow-sm'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
        }`}
        title={item.description}
        onClick={onClose}
      >
        <Icon 
          size={18} 
          className={`flex-shrink-0 ${
            isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-600'
          }`} 
        />
        {!isCollapsed && (
          <span className="font-medium truncate">{item.name}</span>
        )}
      </Link>
    </li>
  )
}

export default SidebarMenuItem