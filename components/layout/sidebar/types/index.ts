import { LucideIcon } from 'lucide-react'

export interface MenuItem {
  id: string
  name: string
  href: string
  icon: LucideIcon
  description?: string
  badge?: string | number
}

export interface SidebarProps {
  isOpen: boolean
  onToggle: (open: boolean) => void
  onClose: () => void
}

export interface SidebarState {
  isOpen: boolean
  activeItem: string | null
  isCollapsed: boolean
}

export interface UserProfile {
  nama_lengkap?: string
  email?: string
  profile_image?: string
  jabatan_nama?: string
  divisi_nama?: string
  isPIT?: boolean
}

export interface SidebarConfig {
  title: string
  subtitle: string
  logo: string
  showUserProfile: boolean
  enableCollapse: boolean
}

export type SidebarVariant = 'default' | 'compact' | 'minimal'

export interface SidebarTheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
  border: string
}