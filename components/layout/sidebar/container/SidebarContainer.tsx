"use client"

import React from 'react'
import { useSidebar } from '../hooks'
import {
  SidebarContainer,
  SidebarNavigation,
  SidebarUserProfile,
  MobileToggle,
  MobileOverlay
} from '../components'
import type { SidebarProps } from '../types'

const MainSidebarContainer: React.FC<SidebarProps> = ({ 
  isOpen, 
  onToggle, 
  onClose 
}) => {
  const {
    state,
    toggle,
    close,
    menuItems,
    userProfile,
    handleLogout,
    shouldRender,
    isLoading
  } = useSidebar(isOpen)

  // Sync external state with internal state
  React.useEffect(() => {
    if (isOpen !== state.isOpen) {
      toggle(isOpen)
    }
  }, [isOpen, state.isOpen, toggle])

  // Sync external handlers
  React.useEffect(() => {
    if (state.isOpen !== isOpen) {
      onToggle(state.isOpen)
    }
  }, [state.isOpen, isOpen, onToggle])

  // Don't render if loading or not authorized
  if (isLoading) {
    return (
      <div className="hidden lg:flex lg:w-64 lg:fixed lg:inset-y-0 bg-gray-100 animate-pulse">
        <div className="w-full bg-white shadow-xl">
          <div className="h-20 bg-gray-200" />
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!shouldRender) {
    return null
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <MobileToggle 
        isOpen={state.isOpen} 
        onToggle={() => toggle(!state.isOpen)} 
      />

      {/* Mobile Overlay */}
      <MobileOverlay 
        isOpen={state.isOpen} 
        onClose={close} 
      />

      {/* Sidebar Container */}
      <SidebarContainer 
        isOpen={state.isOpen}
        isCollapsed={state.isCollapsed}
      >
        
        {/* Navigation */}
        <SidebarNavigation
          menuItems={menuItems}
          activeItem={state.activeItem}
          onClose={close}
          isCollapsed={state.isCollapsed}
        />

        {/* User Profile */}
        <SidebarUserProfile
          userProfile={userProfile}
          onLogout={handleLogout}
          isCollapsed={state.isCollapsed}
        />
      </SidebarContainer>
    </>
  )
}

export default MainSidebarContainer