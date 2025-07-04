"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { AlertTriangle } from 'lucide-react';


const LogoutConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg mx-auto relative">
        {/* Main Container with gradient background */}
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(194, 218, 223, 1) 0%, rgba(224, 236, 239, 1) 20%, rgba(224, 236, 239, 1) 80%, rgba(194, 218, 223, 1) 100%)',
            height: '395px'
          }}
        >
          {/* Background Batik Pattern */}
          <div className="absolute inset-0 flex items-center justify-center opacity-50 overflow-hidden">
            <div className="flex gap-2 w-full h-full -translate-x-8">
              {/* Batik Pattern 1 */}
              <div className="w-1/2 h-full bg-gradient-to-br from-slate-300 to-slate-400 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <pattern id="batik1" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                      <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                      <path d="M5,5 L15,15 M15,5 L5,15" stroke="currentColor" strokeWidth="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#batik1)" className="text-slate-600"/>
                </svg>
              </div>
              
              {/* Batik Pattern 2 */}
              <div className="w-1/2 h-full bg-gradient-to-bl from-slate-300 to-slate-400 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <pattern id="batik2" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
                      <rect x="2" y="2" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="0.4"/>
                      <circle cx="7.5" cy="7.5" r="2" fill="none" stroke="currentColor" strokeWidth="0.3"/>
                      <path d="M0,0 L15,15 M0,15 L15,0" stroke="currentColor" strokeWidth="0.2"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#batik2)" className="text-slate-600"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 p-8 sm:p-10 h-full flex flex-col justify-between">
            {/* White Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4">
              {/* Status Icon */}
              <div className="w-28 h-28 sm:w-35 sm:h-35 flex items-center justify-center">
                <div className="w-full h-full bg-red-50 rounded-full flex items-center justify-center relative">
                  <AlertTriangle className="w-16 h-16 text-red-500" strokeWidth={1.5} />
                  <div className="absolute inset-0 rounded-full border-4 border-red-200 animate-pulse"></div>
                </div>
              </div>
              
              {/* Message */}
              <h2 
                className="text-center font-normal leading-tight"
                style={{
                  color: '#244850',
                  fontSize: '20px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '128%',
                  letterSpacing: '0.005em'
                }}
              >
                Yakin untuk Logout Sekarang?
              </h2>
            </div>
            
            {/* Button Group */}
            <div className="flex flex-col sm:flex-row gap-2 mt-9">
              {/* Back Button */}
              <button 
                onClick={onCancel}
                className="flex-1 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, rgba(72, 145, 161, 1) 0%, rgba(102, 163, 176, 1) 100%)',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '128%',
                  letterSpacing: '0.005em',
                  fontWeight: '600'
                }}
              >
                Kembali
              </button>
              
              {/* Logout Button */}
              <button 
                onClick={onConfirm}
                className="flex-1 bg-white font-semibold py-4 px-8 rounded-lg border transition-all duration-200 hover:scale-105 shadow-lg hover:bg-gray-50"
                style={{
                  borderColor: '#3c7886',
                  borderWidth: '1px',
                  color: '#3c7886',
                  fontSize: '14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '128%',
                  letterSpacing: '0.005em',
                  fontWeight: '600'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const { userData, loading: userLoading } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Handle URL error parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      switch (errorParam) {
        case 'EmailNotStudentUB':
          setError('Hanya email @student.ub.ac.id yang diizinkan');
          break;
        case 'NotRegisteredPanitia':
          setError('Email Anda tidak terdaftar sebagai panitia');
          break;
        case 'DatabaseError':
          setError('Terjadi kesalahan database. Silakan coba lagi.');
          break;
        case 'UserDataError':
          setError('Gagal memuat data user. Silakan login ulang.');
          break;
        default:
          setError('Terjadi kesalahan tidak dikenal');
      }
      
      // Clear error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Auto redirect for authenticated users
  useEffect(() => {
    const handleAutoRedirect = async () => {
      // Jika masih loading, tunggu
      if (status === 'loading' || userLoading) {
        return;
      }

      // Jika tidak ada session, tidak perlu redirect
      if (status === 'unauthenticated' || !session) {
        return;
      }

      // Jika ada session tapi belum ada userData, tunggu
      if (!userData) {
        return;
      }

      // Redirect berdasarkan divisi
      setIsRedirecting(true);
      
      try {
        if (userData.isPIT) {
          // PIT user ke panel
          router.push('/panitia');
        } else if (['KESTARI', 'KONSUMSI'].includes(userData.divisi_nama)) {
          // Divisi tertentu ke dashboard panitia peserta
          const divisiPath = userData.divisi_nama.toLowerCase();
          router.push(`/dashboard${divisiPath}`);
        } else {
          // Divisi lain ke dashboard umum (jika ada)
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Redirect error:', error);
        setIsRedirecting(false);
      }
    };

    handleAutoRedirect();
  }, [session, status, userData, userLoading, router]);

  const handleSignIn = () => {
    setError(null);
    signIn('google', { 
      callbackUrl: '/',
      redirect: true 
    });
  };

  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  // Loading state saat redirect
  if (isRedirecting) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:flex h-screen relative overflow-hidden justify-center items-center"
             style={{
               background: 'linear-gradient(145.79deg, rgba(133, 181, 192, 1) 0%, rgba(72, 145, 161, 1) 50%, rgba(60, 120, 134, 1) 100%)'
             }}>
          
          {/* Batik Background Pattern */}
          <img 
            src="/assets/batik-10.svg" 
            alt="Batik Pattern"
            className="absolute opacity-50 w-[1251px] h-[1115px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />

          {/* Loading Content */}
          <div className="relative z-10 bg-white/90 rounded-xl p-8 text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderBottomColor: '#4891A1' }}
            ></div>
            <p className="text-[#4891A1] font-medium">Mengarahkan ke dashboard...</p>
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="md:hidden h-screen relative overflow-hidden flex items-center justify-center"
             style={{
               background: 'linear-gradient(168.17deg, rgba(133, 181, 192, 1) 0%, rgba(60, 120, 134, 1) 40%, rgba(72, 145, 161, 1) 100%)'
             }}>
          
          <div className="bg-white rounded-lg p-8 text-center mx-4">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderBottomColor: '#4891A1' }}
            ></div>
            <p className="text-[#4891A1] font-medium">Mengarahkan ke dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  // Loading state saat session/user loading
  if (status === 'loading' || (session && userLoading)) {
    return (
      <>
        {/* Desktop Loading */}
        <div className="hidden md:flex h-screen relative overflow-hidden justify-center items-center"
             style={{
               background: 'linear-gradient(145.79deg, rgba(133, 181, 192, 1) 0%, rgba(72, 145, 161, 1) 50%, rgba(60, 120, 134, 1) 100%)'
             }}>
          
          {/* Batik Background Pattern */}
          <img 
            src="/assets/batik-10.svg" 
            alt="Batik Pattern"
            className="absolute opacity-50 w-[1251px] h-[1115px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
          />

          {/* Loading Content */}
          <div className="relative z-10 bg-white/90 rounded-xl p-8 text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderBottomColor: '#4891A1' }}
            ></div>
            <p className="text-[#4891A1] font-medium">Memuat...</p>
          </div>
        </div>

        {/* Mobile Loading */}
        <div className="md:hidden h-screen relative overflow-hidden flex items-center justify-center"
             style={{
               background: 'linear-gradient(168.17deg, rgba(133, 181, 192, 1) 0%, rgba(60, 120, 134, 1) 40%, rgba(72, 145, 161, 1) 100%)'
             }}>
          
          <div className="bg-white rounded-lg p-8 text-center mx-4">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
              style={{ borderBottomColor: '#4891A1' }}
            ></div>
            <p className="text-[#4891A1] font-medium">Memuat...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop Version */}
      <div className="hidden md:flex h-screen relative overflow-hidden justify-center items-center"
           style={{
             background: 'linear-gradient(145.79deg, rgba(133, 181, 192, 1) 0%, rgba(72, 145, 161, 1) 50%, rgba(60, 120, 134, 1) 100%)'
           }}>
        
        {/* Batik Background Pattern */}
        <img 
          src="/assets/batik-10.svg" 
          alt="Batik Pattern"
          className="absolute opacity-50 w-[1251px] h-[1115px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />

        {/* Background Rectangle di Blur */}
        <div className="absolute w-[533px] h-[375px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div 
            className="w-full h-full rounded-xl opacity-28 shadow-lg"
            style={{
              background: '#ffffff',
              filter: 'blur(2px)',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'
            }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-[534px] rounded-xl py-6 flex flex-col gap-5 items-center text-center">
          {/* Header with Logo */}
          <div className="flex flex-row gap-3 items-start justify-center self-stretch">
            {/* Left Logo Group */}
            <div className="w-[98px] h-[37px] relative">
              <img src="/assets/group0.svg" alt="Group 1" className="absolute left-0 top-0 h-auto" />
              <img src="/assets/group1.svg" alt="Group 2" className="absolute left-[54px] top-[14.44px] h-auto" />
            </div>
            
            {/* Center Logo */}
            <img src="/assets/logo-sementara0.svg" alt="Logo" className="w-[184px] h-[92px]" />
            
            {/* Right Logo Group */}
            <div className="w-[97px] h-[37px] relative">
              <img src="/assets/group3.svg" alt="Group 3" className="absolute left-0 top-0 h-auto" />
              <img src="/assets/group4.svg" alt="Group 4" className="absolute left-[37.47px] top-[14.44px] h-auto" />
            </div>
          </div>

          {/* Login Form Section */}
          <div className="rounded-lg px-5 flex flex-col gap-7 items-center self-stretch">
            {/* Title and Description */}
            <div className="flex flex-col gap-2 items-start self-stretch">
              <div className="text-white text-center text-[38px] font-bold leading-[128%] tracking-[0.005em] self-stretch overflow-hidden whitespace-nowrap text-ellipsis"
                   style={{ fontFamily: 'Sora-Bold, sans-serif' }}>
                Login
              </div>
              <div className="text-white text-center text-base font-light leading-[128%] tracking-[0.005em] self-stretch"
                   style={{ fontFamily: 'Sora-Light, sans-serif' }}>
                Silakan login dengan akun email UB Anda
              </div>
            </div>

            {/* Login Content */}
            {error ? (
              /* Error State */
              <div className="w-full max-w-[400px] bg-white/90 rounded-lg p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gagal Masuk
                </h3>
                <p className="text-sm text-red-600 mb-6">
                  {error}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleSignIn}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200"
                    style={{ backgroundColor: '#4891A1' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3a7a87';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4891A1';
                    }}
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Muat Ulang Halaman
                  </button>
                </div>
              </div>
            ) : session ? (
              /* Authenticated State */
              <div className="space-y-4 w-full max-w-[300px]">
                <div className="bg-white/90 rounded-lg p-4">
                  <p className="text-[#4891a1] text-center mb-2 break-words">
                    🟢 Halo, <strong>{session.user?.name}</strong>
                  </p>
                  <p className="text-sm text-[#4891a1] text-center">{session.user?.email}</p>
                  {userData && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-[#4891a1]">
                        {userData.nama_lengkap}
                      </p>
                      <p className="text-xs text-gray-600">
                        {userData.jabatan_nama} - {userData.divisi_nama}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-4 px-8 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* Google Login Button */
              <div 
                className="bg-white rounded-lg py-4 px-8 flex flex-row gap-2 items-center justify-center w-[300px] h-12 cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
                onClick={handleSignIn}
              >
                <img src="/assets/flat-color-icons-google0.svg" alt="Google Icon" className="w-6 h-6" />
                <div className="text-[#4891a1] text-sm font-medium leading-[21px]" style={{ fontFamily: 'DmSans-Medium, sans-serif' }}>
                  Masuk dengan Google
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden h-screen relative overflow-hidden block"
           style={{
             background: 'linear-gradient(168.17deg, rgba(133, 181, 192, 1) 0%, rgba(60, 120, 134, 1) 40%, rgba(72, 145, 161, 1) 100%)'
           }}>
        
        {/* Batik Background Patterns */}
        <div className="absolute opacity-[0.08] flex flex-col w-[405.72px] left-1/2 -translate-x-1/2 -top-[315px]">
          {[...Array(6)].map((_, rowIndex) => (
            <div key={`batik-row-${rowIndex}`} 
                 className={`self-stretch h-[548.78px] relative ${rowIndex > 0 ? '-mt-[283px]' : ''}`}>
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[64.27px] top-[269.91px]" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[193.94px] top-[134.96px]" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[323.61px] top-0" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-0 top-[335.74px]" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[129.67px] top-[200.79px]" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[259.34px] top-[65.83px]" />
            </div>
          ))}
        </div>
        <div className="absolute opacity-[0.08] flex flex-col w-[405.72px] -left-[2512px] -top-[154px]">
          {[...Array(6)].map((_, rowIndex) => (
            <div key={`batik-row-2-${rowIndex}`} 
                 className={`self-stretch h-[548.78px] relative ${rowIndex > 0 ? '-mt-[283px]' : ''}`}>
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[64.27px] top-[269.91px]" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[193.94px] top-[134.96px]" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[323.61px] top-0" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-0 top-[335.74px]" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[129.67px] top-[200.79px]" />
              <img src="/assets/layer-70.svg" alt="" className="absolute h-auto left-[259.34px] top-[65.83px]" />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="absolute flex flex-col gap-6 items-center justify-center w-[355px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {/* Header dan Logo */}
          <div className="flex flex-row gap-3 items-center justify-center self-stretch">
            <div className="w-[98px] h-[37px] relative">
              <img src="/assets/group0.svg" alt="Group 1" className="absolute left-0 top-0 h-auto" />
              <img src="/assets/group1.svg" alt="Group 2" className="absolute left-[54px] top-[14.44px] h-auto" />
            </div>
            <img src="/assets/logo-sementara0.svg" alt="Logo" className="w-[136px] h-[68px]" />
            <div className="w-[97px] h-[37px] relative">
              <img src="/assets/group3.svg" alt="Group 3" className="absolute left-0 top-0 h-auto" />
              <img src="/assets/group4.svg" alt="Group 4" className="absolute left-[37.47px] top-[14.44px] h-auto" />
            </div>
          </div>

          {/* Login Card */}
          <div 
            className="bg-white rounded-lg p-5 flex flex-col gap-7 items-center justify-center w-[334px] relative"
            style={{
              boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
            }}
          >
            {/* Title dan Deskripsi*/}
            <div className="flex flex-col gap-2 items-center justify-center self-stretch">
              <div 
                className="text-center text-[32px] font-semibold leading-[128%] tracking-[0.005em] self-stretch overflow-hidden whitespace-nowrap text-ellipsis"
                style={{
                  background: 'linear-gradient(90deg, rgba(72, 145, 161, 1) 0%, rgba(60, 120, 134, 1) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontFamily: 'Sora-SemiBold, sans-serif'
                }}
              >
                Login
              </div>
              <div className="text-[#244850] text-center text-sm font-normal leading-[128%] tracking-[0.005em] self-stretch"
                   style={{ fontFamily: 'Sora-Regular, sans-serif' }}>
                Silakan login dengan akun email UB Anda
              </div>
            </div>

            {/* Login Content */}
            {error ? (
              /* Error State */
              <div className="w-full text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Gagal Masuk
                </h3>
                <p className="text-sm text-red-600 mb-6">
                  {error}
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleSignIn}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200"
                    style={{ backgroundColor: '#4891A1' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3a7a87';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#4891A1';
                    }}
                  >
                    Coba Lagi
                  </button>
                  <button
                    onClick={handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    Muat Ulang Halaman
                  </button>
                </div>
              </div>
            ) : session ? (
              /* Authenticated State */
              <div className="space-y-4 w-full">
                <div className="border border-[#5eead4] bg-[#f0fdfa] rounded-lg p-4">
                  <p className="text-[#0f766e] text-center mb-2 break-words">
                    🟢 Halo, <strong>{session.user?.name}</strong>
                  </p>
                  <p className="text-sm text-[#0d9488] text-center">{session.user?.email}</p>
                  {userData && (
                    <div className="mt-3 pt-3 border-t border-[#5eead4]">
                      <p className="text-sm font-medium text-[#0f766e]">
                        {userData.nama_lengkap}
                      </p>
                      <p className="text-xs text-[#0d9488]">
                        {userData.jabatan_nama} - {userData.divisi_nama}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg py-3 px-6 transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-md font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* Google Login Button */
              <div 
                className="bg-white rounded-lg border border-[#3c7886] py-4 px-8 flex flex-row gap-2 items-center justify-center self-stretch h-12 cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
                onClick={handleSignIn}
              >
                <img src="/assets/flat-color-icons-google0.svg" alt="Google Icon" className="w-6 h-6" />
                <div className="text-[#3c7886] text-left text-sm font-semibold leading-[128%] tracking-[0.005em]"
                     style={{ fontFamily: 'Sora-SemiBold, sans-serif' }}>
                  Masuk dengan Google
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}