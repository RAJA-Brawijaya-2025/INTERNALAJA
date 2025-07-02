'use client'

import { ReactNode } from 'react';
import { useKestariAccess } from '@/hooks/useKestariAccess';
import { AlertCircle, Shield, Users, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KestariAccessWrapperProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
}

export default function KestariAccessWrapper({ 
  children, 
  fallbackComponent 
}: KestariAccessWrapperProps) {
  const { hasAccess, loading, panitiaData, error, accessReason, retry } = useKestariAccess({
    redirectOnDenied: true,
    unauthorizedRedirectUrl: '/',
    maxRetries: 3,
    retryDelay: 2000
  });

  const router = useRouter();

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4891A1]"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Memverifikasi Akses
          </h2>
          <p className="text-gray-600 text-sm">
            Mengecek izin akses ke Dashboard Kestari...
          </p>
          
          {/* Progress indicator */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#4891A1] h-2 rounded-full animate-pulse"
              style={{ width: '60%' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Access Granted
  if (hasAccess && panitiaData) {
    return (
      <>
        {/* Access Success Banner */}
        {/* <div className="bg-[#e0f2f7] border-l-4 border-[#4891A1] p-4 mb-4 mx-3 md:mx-6 mt-3 md:mt-6 rounded-r-lg">
          <div className="flex items-center">
            <Shield className="text-[#4891A1] mr-2" size={20} />
            <div>
              <p className="text-xs text-gray-600">
                Selamat datang, {panitiaData.nama_lengkap} - {panitiaData.divisi_nama}
              </p>
            </div>
          </div>
        </div> */}
        
        {/* Render dashboard content */}
        {children}
      </>
    );
  }

  // Access Denied - Show fallback or error page
  if (fallbackComponent) {
    return <>{fallbackComponent}</>;
  }

  // Default Access Denied UI
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <div className="text-center">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <AlertCircle className="text-red-600" size={32} />
            </div>
          </div>
          
          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Akses Ditolak
          </h1>
          
          {/* Error Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm font-medium mb-2">
              Dashboard Kestari - Akses Terbatas
            </p>
            <p className="text-red-700 text-sm">
              {error || 'Anda tidak memiliki izin untuk mengakses Dashboard Kestari. Halaman ini hanya dapat diakses oleh divisi KESTARI dan PIT.'}
            </p>
          </div>

          {/* User Info if available */}
          {panitiaData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Users className="text-blue-600 mr-2" size={16} />
                <span className="text-blue-800 font-medium text-sm">Info Akun Anda</span>
              </div>
              <p className="text-blue-700 text-sm">
                <strong>Nama:</strong> {panitiaData.nama_lengkap}
              </p>
              <p className="text-blue-700 text-sm">
                <strong>Divisi:</strong> {panitiaData.divisi_nama}
              </p>
              <p className="text-blue-700 text-sm">
                <strong>Jabatan:</strong> {panitiaData.jabatan_nama}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2 bg-[#4891A1] text-white px-6 py-3 rounded-lg hover:bg-[#35707e] transition-colors font-medium"
            >
              <Home size={16} />
              Kembali ke Beranda
            </button>
            
            <button
              onClick={retry}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <RefreshCw size={16} />
              Coba Lagi
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-xs">
              Jika Anda merasa ini adalah kesalahan, silakan hubungi koordinator divisi atau IT Support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}