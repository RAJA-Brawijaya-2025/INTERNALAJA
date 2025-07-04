"use client"

import React from 'react'

interface SidebarHeaderProps {
  title?: string
  subtitle?: string
  isCollapsed?: boolean
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ 
  title = "RAJA Brawijaya",
  subtitle = "Panel Panitia PIT",
  isCollapsed = false
}) => {
  return (
    <div className="shrink-0 p-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-lg">RB</span>
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900 truncate">{title}</h2>
            <p className="text-sm text-gray-500 truncate">{subtitle}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarHeader