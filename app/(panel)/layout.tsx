/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useCallback, useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import HeaderContainer from "@/components/layout/header/HeaderContainer"
import MainSidebarContainer from "@/components/layout/sidebar/container/SidebarContainer"

// Type definitions
interface EnhancedProfileAvatarProps {
  imageUrl?: string
  name?: string
  size?: "sm" | "md" | "lg" | "xl"
  showBorder?: boolean
  borderColor?: string
}

// Enhanced ProfileAvatar Component dengan perfect circle
const EnhancedProfileAvatar: React.FC<EnhancedProfileAvatarProps> = ({ 
  imageUrl, 
  name, 
  size = "lg",
  showBorder = true,
  borderColor = "border-[#4891A1]"
}) => {
  const [imageError, setImageError] = useState(false)
  
  // Size configurations with proper typing
  const sizeClasses: Record<string, string> = {
    sm: "w-8 h-8",
    md: "w-10 h-10", 
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }
  
  const textSizeClasses: Record<string, string> = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-xl"
  }

  // Get initials from name with proper typing
  const getInitials = (name?: string): string => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((word: string) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase()
  }

  const baseClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    flex 
    items-center 
    justify-center 
    overflow-hidden 
    relative
    ${showBorder ? `border-2 ${borderColor}` : ''}
  `

  return (
    <div className={baseClasses}>
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt={name || "Profile"}
          className="w-full h-full object-cover object-center"
          onError={() => setImageError(true)}
          onLoad={(e) => {
            // Ensure image is properly loaded and centered
            const target = e.currentTarget as HTMLImageElement
            target.style.objectPosition = "center center"
          }}
        />
      ) : (
        <div 
          className={`w-full h-full flex items-center justify-center text-white font-semibold ${textSizeClasses[size]}`}
          style={{ backgroundColor: '#4891A1' }}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  )
}

interface PanelLayoutProps {
  children: React.ReactNode
}

export default function PanelLayout({ children }: PanelLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { userData, loading, error } = useUser()
  const router = useRouter()
  
  const handleToggle = useCallback((open: boolean) => setSidebarOpen(open), [])
  const handleClose = useCallback(() => setSidebarOpen(false), [])

  // Function to handle logout
  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=")
        const name = eqPos > -1 ? c.substr(0, eqPos) : c
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname
      })
      
      // Sign out from NextAuth
      await signOut({ 
        redirect: false,
        callbackUrl: "/"
      })
      
      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()
      
      // Redirect to home page
      router.push("/")
      
    } catch (error) {
      console.error("Error during logout:", error)
      // Force redirect even if there's an error
      window.location.href = "/"
    } finally {
      setIsLoggingOut(false)
    }
  }, [router])

  // Jika masih loading, tampilkan loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderBottomColor: '#4891A1' }}
          ></div>
          <p className="text-gray-600">Memuat data user...</p>
        </div>
      </div>
    )
  }

  // Jika ada error, tampilkan error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Terjadi Kesalahan</h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    )
  }

  // Cek apakah user adalah dari divisi PIT
  const isPITUser = userData?.isPIT === true
  
  return (
    <section>
    <HeaderContainer/>
    
    <div className="relative flex min-h-screen bg-gray-50">
      {/* ─── Sidebar (hanya tampil jika user PIT) ─── */}
      {isPITUser && (
        <MainSidebarContainer isOpen={sidebarOpen} onToggle={handleToggle} onClose={handleClose} />

      )}

      {/* ─── Konten ─── */}
      <div className="flex flex-col flex-1">
        {/* Header mobile (hanya tampil jika user PIT) */}
        {isPITUser && (
          <div className="sticky top-0 z-40 lg:hidden h-14 w-full flex items-center gap-2
                           bg-gray-50/95 backdrop-blur border-b border-gray-200">
            {/* Burger */}
            <button
              aria-label="Buka sidebar"
              className="absolute left-4 p-2"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo di tengah */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: '#4891A1' }}>
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <span className="text-base font-semibold text-gray-800">
                RAJA Brawijaya
              </span>
            </div>
          </div>
        )}

        {/* Area konten */}
        <main className={`flex-1 ${isPITUser ? '' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
            {/* Header dengan Welcome dan Logout Button untuk SEMUA USER */}
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm" 
                 style={{
                   background: 'linear-gradient(135deg, #ffffff 0%, rgba(72, 145, 161, 0.03) 100%)',
                   borderColor: 'rgba(72, 145, 161, 0.2)',
                   boxShadow: '0 4px 6px -1px rgba(72, 145, 161, 0.1), 0 2px 4px -1px rgba(72, 145, 161, 0.06)'
                 }}>
              <div className="flex items-center justify-between">
                {/* Welcome Message - untuk SEMUA divisi */}
                {userData && (
                  <div className="flex items-center gap-3">
                    <EnhancedProfileAvatar 
                      imageUrl={userData.profile_image ?? undefined}
                      name={userData.nama_lengkap}
                      size="lg"
                      showBorder={true}
                      borderColor="border-[#4891A1]"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Selamat datang, {userData.nama_lengkap}
                      </p>
                      <p className="text-xs text-gray-600">
                        {userData.jabatan_nama} - {userData.divisi_nama}
                      </p>
                    </div>
                  </div>
                )}

                {/* Spacer untuk mendorong logout ke kanan */}
                <div className="flex-1"></div>

                {/* Logout Button - Selalu di kanan untuk semua user */}
                <div className="ml-auto">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-lg 
                               disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm
                               hover:shadow-md transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: '#4891A1',
                      boxShadow: '0 2px 4px rgba(72, 145, 161, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3a7a87'
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(72, 145, 161, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4891A1'
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(72, 145, 161, 0.3)'
                    }}
                    aria-label="Logout"
                  >
                    {isLoggingOut ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-sm font-medium">Logging out...</span>
                      </>
                    ) : (
                      <>
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16,17 21,12 16,7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
    </section>
  )
}