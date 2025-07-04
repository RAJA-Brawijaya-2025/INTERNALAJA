"use client"

import React from 'react'
import { LogOut } from 'lucide-react'
import { ProfileAvatar } from './ProfileAvatar'
import type { UserProfile } from '../types'

interface SidebarUserProfileProps {
  userProfile: UserProfile
  onLogout: () => void
  isCollapsed?: boolean
}

export const SidebarUserProfile: React.FC<SidebarUserProfileProps> = ({ 
  userProfile, 
  onLogout,
  isCollapsed = false 
}) => {
  return (
    <div className="shrink-0 p-4 bg-white border-t border-gray-200">
      {/* User Info */}
      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 mb-3">
        <ProfileAvatar
          imageUrl={userProfile.profile_image}
          name={userProfile.nama_lengkap}
          size="md"
        />
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile.nama_lengkap || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userProfile.jabatan_nama || 'Staff'}
            </p>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className={`w-full flex items-center justify-center gap-3 px-4 py-3 bg-error-700 text-white rounded-lg transition-colors duration-200 ${
          isCollapsed ? 'justify-center' : ''
        }`}
        title="Logout"
      >
        <span className="font-medium">Logout</span>
        <LogOut size={18} className="flex-shrink-0" />
        {!isCollapsed && (
          <></>
        )}
      </button>
    </div>
  )
}

export default SidebarUserProfile