"use client"

import React from 'react'
import { SidebarMenuItem } from './SidebarMenuItem'
import type { MenuItem } from '../types'

interface SidebarNavigationProps {
  menuItems: MenuItem[]
  activeItem: string | null
  onClose: () => void
  isCollapsed?: boolean
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  menuItems, 
  activeItem, 
  onClose,
  isCollapsed = false 
}) => {
  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <ul className="space-y-2">
        {menuItems.map(item => (
          <SidebarMenuItem
            key={item.id}
            item={item}
            isActive={activeItem === item.href}
            onClose={onClose}
            isCollapsed={isCollapsed}
          />
        ))}
      </ul>
    </nav>
  )
}

export default SidebarNavigation