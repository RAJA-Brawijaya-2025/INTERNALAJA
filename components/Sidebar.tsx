"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useUser } from '@/contexts/UserContext'
import {
  LayoutDashboard,
  UserPlus,
  QrCode,
  Users,
  Calendar,
  Menu,
  X,
  UtensilsCrossed,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
  onClose: () => void
}

interface MenuItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  description: string
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, description: "Halaman utama dashboard" },
  { name: "Tambah Admin", href: "/panitia", icon: UserPlus, description: "Tambahkan anggota panitia baru" },
  { name: "Tambah Panitia", href: "/panitia/buatqr", icon: QrCode, description: "Tambahkan peserta dengan QR Code" },
  { name: "Daftar Kegiatan", href: "/panitia/daftarkegiatan", icon: Calendar, description: "Lihat semua kegiatan" },
  { name: "Kestari", href: "/dashboardkestari", icon: Users, description: "Panel Kestari" },
  { name: "Konsumsi", href: "/dashboardkonsumsi", icon: UtensilsCrossed, description: "Panel Konsumsi" },
]

export default function Sidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const { userData, loading } = useUser()
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)

  // mount guard
  useEffect(() => { setMounted(true) }, [])
  // close on route change
  useEffect(() => { onClose() }, [pathname, onClose])

  // lock scroll on mobile open
  useEffect(() => {
    if (typeof window === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''
    document.documentElement.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  // Don't render until mounted and user data loaded
  if (!mounted || loading) return null

  console.log('🔍 Sidebar Debug:', {
    userData: userData,
    isPIT: userData?.isPIT,
    divisi_nama: userData?.divisi_nama,
    divisi_id: userData?.divisi_id
  })

  // Hide sidebar for non-PIT users
  // Menggunakan userData dari UserContext yang lebih reliable
  if (!userData?.isPIT) {
    console.log('❌ Sidebar hidden - User is not PIT:', userData?.divisi_nama)
    return null
  }

  console.log('✅ Sidebar visible - User is PIT')

  const toggleSidebar = () => onToggle(!isOpen)
  const handleImageError = () => setImageError(true)

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-[100] p-3 rounded-lg bg-blue-900 text-white shadow-lg hover:bg-blue-800 transition-colors duration-200"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      <div
        onClick={onClose}
        className={`lg:hidden fixed inset-0 bg-black transition-opacity duration-300 z-[90] ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200 lg:z-[80]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="shrink-0 p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">RAJA Brawijaya</h2>
                <p className="text-sm text-blue-200">Panel Panitia PIT</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2 relative">
              {menuItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg scale-[1.02]'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                      }`}
                      title={item.description}
                    >
                      <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'} />
                      <span className="font-medium">{item.name}</span>
                      {isActive && <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-80" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer User */}
          <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              {session?.user?.image && !imageError ? (
                <div className="relative w-10 h-10">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    fill
                    className="rounded-full object-cover ring-2 ring-blue-100"
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    sizes="40px"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center ring-2 ring-blue-100">
                  <span className="text-white font-medium text-sm">{session?.user?.name?.charAt(0).toUpperCase() ?? 'U'}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{userData?.nama_lengkap || session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-600 truncate">{userData?.email || session?.user?.email || 'email@example.com'}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-600 font-medium">PIT - {userData?.jabatan_nama}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[95] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Same content as desktop */}
          {/* Header */}
          <div className="shrink-0 p-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RB</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">RAJA Brawijaya</h2>
                <p className="text-sm text-blue-200">Panel Panitia PIT</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2 relative">
              {menuItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg scale-[1.02]'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                      }`}
                      title={item.description}
                      onClick={onClose} // Close mobile sidebar on navigation
                    >
                      <Icon size={20} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'} />
                      <span className="font-medium">{item.name}</span>
                      {isActive && <div className="absolute right-2 w-2 h-2 bg-white rounded-full opacity-80" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer User */}
          <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
              {session?.user?.image && !imageError ? (
                <div className="relative w-10 h-10">
                  <Image
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    fill
                    className="rounded-full object-cover ring-2 ring-blue-100"
                    onError={handleImageError}
                    referrerPolicy="no-referrer"
                    sizes="40px"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center ring-2 ring-blue-100">
                  <span className="text-white font-medium text-sm">{session?.user?.name?.charAt(0).toUpperCase() ?? 'U'}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{userData?.nama_lengkap || session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-600 truncate">{userData?.email || session?.user?.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-600 font-medium">PIT - {userData?.jabatan_nama}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}