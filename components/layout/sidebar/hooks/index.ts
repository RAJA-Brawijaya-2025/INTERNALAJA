import { useState, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useUser } from '@/contexts/UserContext'
import { 
  LayoutDashboard, 
  UserPlus, 
  Calendar, 
  Users, 
  UtensilsCrossed,
  LogOut
} from 'lucide-react'
import type { MenuItem, SidebarState, UserProfile } from '../types'

// Custom hook for sidebar state management
export const useSidebarState = (initialOpen = false) => {
  const [state, setState] = useState<SidebarState>({
    isOpen: initialOpen,
    activeItem: null,
    isCollapsed: false
  })

  const pathname = usePathname()

  // Update active item based on current path
  useEffect(() => {
    setState(prev => ({
      ...prev,
      activeItem: pathname
    }))
  }, [pathname])

  // Lock scroll when sidebar is open on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (state.isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [state.isOpen])

  const toggle = useCallback((open?: boolean) => {
    setState(prev => ({
      ...prev,
      isOpen: open !== undefined ? open : !prev.isOpen
    }))
  }, [])

  const close = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const toggleCollapse = useCallback(() => {
    setState(prev => ({ ...prev, isCollapsed: !prev.isCollapsed }))
  }, [])

  // Close sidebar on route change
  useEffect(() => {
    close()
  }, [pathname, close])

  return {
    state,
    toggle,
    close,
    toggleCollapse
  }
}

// Custom hook for sidebar menu items
export const useSidebarMenu = () => {
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Halaman utama dashboard'
    },
    {
      id: 'daftar-admin',
      name: 'Daftar Admin',
      href: '/panitia',
      icon: UserPlus,
      description: 'Kelola daftar admin'
    },
    {
      id: 'daftar-kegiatan',
      name: 'Daftar Kegiatan',
      href: '/panitia/daftarkegiatan',
      icon: Calendar,
      description: 'Lihat semua kegiatan'
    },
    {
      id: 'daftar-panitia',
      name: 'Daftar Panitia',
      href: '/panitia/buatqr',
      icon: Users,
      description: 'Kelola daftar panitia'
    },
    {
      id: 'kestari',
      name: 'Kestari',
      href: '/dashboardkestari',
      icon: Users,
      description: 'Panel Kestari'
    },
    {
      id: 'konsumsi',
      name: 'Konsumsi',
      href: '/dashboardkonsumsi',
      icon: UtensilsCrossed,
      description: 'Panel Konsumsi'
    }
  ]

  return { menuItems }
}

// Custom hook for user authentication and profile
export const useSidebarAuth = () => {
  const { data: session, status } = useSession()
  const { userData, loading } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userProfile: UserProfile = {
    nama_lengkap: userData?.nama_lengkap,
    email: userData?.email ?? (session?.user?.email ?? undefined),
    profile_image: userData?.profile_image ?? (session?.user?.image ?? undefined),
    jabatan_nama: userData?.jabatan_nama,
    divisi_nama: userData?.divisi_nama,
    isPIT: userData?.isPIT
  }

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  const isAuthorized = userData?.isPIT === true
  const isLoading = loading || status === 'loading' || !mounted

  return {
    session,
    userProfile,
    handleLogout,
    isAuthorized,
    isLoading
  }
}

// Custom hook for sidebar visibility logic
export const useSidebarVisibility = () => {
  const { isAuthorized, isLoading } = useSidebarAuth()
  
  // Don't render until mounted and user data loaded
  if (isLoading) return { shouldRender: false, isLoading: true }
  
  // Hide sidebar for non-PIT users
  if (!isAuthorized) {
    console.log('❌ Sidebar hidden - User is not PIT')
    return { shouldRender: false, isLoading: false }
  }

  console.log('✅ Sidebar visible - User is PIT')
  return { shouldRender: true, isLoading: false }
}

// Main sidebar hook that combines all functionality
export const useSidebar = (initialOpen = false) => {
  const sidebarState = useSidebarState(initialOpen)
  const menu = useSidebarMenu()
  const auth = useSidebarAuth()
  const visibility = useSidebarVisibility()

  return {
    ...sidebarState,
    ...menu,
    ...auth,
    ...visibility
  }
}