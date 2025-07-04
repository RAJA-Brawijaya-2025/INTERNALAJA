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
            ? 'item-background text-white font-medium shadow-sm'
            : 'text-primary-800 hover:bg-primary-300 hover:text-white'
        }`}
        title={item.description}
        onClick={onClose}
      >
        <Icon 
          size={18} 
          className={`flex-shrink-0 ${
            isActive ? 'text-white' : 'text-primary-800 group-hover:text-white'
          }`} 
        />
        {!isCollapsed && (
          <span className="font-semibold truncate">{item.name}</span>
        )}
      </Link>
    </li>
  )
}

export default SidebarMenuItem