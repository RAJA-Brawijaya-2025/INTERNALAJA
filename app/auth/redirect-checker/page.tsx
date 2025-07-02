"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PanitiaData {
  id: number;
  nama_lengkap: string;
  email: string;
  divisi_id: number;
  jabatan_id: number;
  divisi_nama: string;
  jabatan_nama: string;
}

interface DivisiAccessResponse {
  hasAccess: boolean;
  redirectPath: string;
  dashboardType: string;
  panitiaData: PanitiaData;
  message: string;
  error?: string;
}

export default function RedirectChecker() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectData, setRedirectData] = useState<DivisiAccessResponse | null>(null);
  const [countdown, setCountdown] = useState(2);

  // Main redirect logic
  useEffect(() => {
    const checkDivisiAndRedirect = async () => {
      console.log("🔍 RedirectChecker: Starting divisi check...");

      // Wait for session
      if (status === "loading") {
        console.log("⏳ RedirectChecker: Waiting for session...");
        return;
      }

      if (status === "unauthenticated") {
        console.log("❌ RedirectChecker: Unauthenticated, redirecting to login");
        router.push("/");
        return;
      }

      if (status === "authenticated" && session?.user?.email) {
        try {
          console.log("✅ RedirectChecker: Authenticated, checking divisi...");
          
          const response = await fetch("/api/panitiapeserta/divisi-access", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: session.user.email }),
          });

          const result: DivisiAccessResponse = await response.json();
          
          if (response.ok && result.hasAccess) {
            console.log(`📊 Divisi check result:`, {
              divisi_id: result.panitiaData.divisi_id,
              divisi_nama: result.panitiaData.divisi_nama,
              dashboardType: result.dashboardType,
              redirectPath: result.redirectPath
            });

            setRedirectData(result);
            setLoading(false);
            
            // Auto redirect after 2 seconds
            setTimeout(() => {
              console.log(`🚀 Redirecting to: ${result.redirectPath}`);
              router.push(result.redirectPath);
            }, 2000);
            
          } else {
            console.error("❌ RedirectChecker: Failed to get divisi data:", result.error);
            setError(result.error || "Failed to get divisi data");
            setLoading(false);
          }
        } catch (err: any) {
          console.error("💥 RedirectChecker: Error checking divisi:", err);
          setError("Error checking divisi: " + err.message);
          setLoading(false);
        }
      }
    };

    checkDivisiAndRedirect();
  }, [session, status, router]);

  // Countdown timer
  useEffect(() => {
    if (!loading && redirectData) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, redirectData]);

  // Manual redirect function
  const performRedirect = () => {
    if (redirectData) {
      console.log(`🚀 Manual redirect to: ${redirectData.redirectPath}`);
      router.push(redirectData.redirectPath);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-6"></div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Memeriksa Divisi Anda...
          </h2>
          
          <p className="text-gray-600 mb-4">
            Sistem sedang menentukan dashboard yang sesuai dengan divisi Anda.
          </p>

          {session?.user?.email && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left text-sm">
              <h3 className="font-bold mb-2 text-blue-800">Info Session:</h3>
              <div className="space-y-1 text-blue-700">
                <p><strong>Email:</strong> {session.user.email}</p>
                <p><strong>Status:</strong> {status}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error && !redirectData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.348 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-red-800 mb-4">
            Terjadi Kesalahan
          </h2>
          
          <p className="text-red-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show redirect info
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Login Berhasil!
          </h2>
          
          {redirectData?.panitiaData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-bold mb-2 text-gray-800">Informasi Anda:</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Nama:</span> {redirectData.panitiaData.nama_lengkap}</p>
                <p><span className="font-medium">Email:</span> {redirectData.panitiaData.email}</p>
                <p><span className="font-medium">Divisi:</span> {redirectData.panitiaData.divisi_nama}</p>
                <p><span className="font-medium">Jabatan:</span> {redirectData.panitiaData.jabatan_nama}</p>
                <p><span className="font-medium">Divisi ID:</span> {redirectData.panitiaData.divisi_id}</p>
              </div>
            </div>
          )}

          {/* Dashboard Type Info */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              redirectData?.dashboardType === 'kestari' ? 'bg-purple-100 text-purple-800' :
              redirectData?.dashboardType === 'konsumsi' ? 'bg-orange-100 text-orange-800' :
              redirectData?.dashboardType === 'pit_special' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {redirectData?.dashboardType === 'kestari' && '🎨 Dashboard KESTARI'}
              {redirectData?.dashboardType === 'konsumsi' && '🍽️ Dashboard Konsumsi'}
              {redirectData?.dashboardType === 'pit_special' && '⚡ Dashboard PIT (Special Access)'}
              {redirectData?.dashboardType === 'default' && '🏠 Dashboard Utama'}
            </div>
          </div>

          {/* Redirect Path Info */}
          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <p className="text-sm text-teal-700">
              <strong>Tujuan:</strong> {redirectData?.redirectPath}
            </p>
          </div>

          {/* Countdown */}
          <p className="text-gray-600 mb-4">
            Mengalihkan ke dashboard dalam <span className="font-bold text-teal-600">{countdown}</span> detik...
          </p>

          {/* Manual redirect button */}
          <button
            onClick={performRedirect}
            className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-medium"
          >
            Lanjutkan Sekarang
          </button>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-teal-600 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${100 - (countdown / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}