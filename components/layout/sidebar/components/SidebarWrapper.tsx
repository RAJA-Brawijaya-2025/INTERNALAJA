"use client"

import React from 'react'

interface SidebarWrapperProps {
  children: React.ReactNode
  isOpen: boolean
  isCollapsed?: boolean
}

export const SidebarWrapper: React.FC<SidebarWrapperProps> = ({ 
  children, 
  isOpen,
  isCollapsed = false 
}) => {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:bg-white lg:shadow-xl lg:z-[80] transition-all duration-300 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        <div className="flex flex-col h-full">
          {children}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[95] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {children}
        </div>
      </aside>
    </>
  )
}

export default SidebarWrapper