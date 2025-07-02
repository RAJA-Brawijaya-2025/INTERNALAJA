"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface DivisiStats {
  nama_divisi: string;
  jumlah_panitia: number;
}

interface DashboardStats {
  totalPanitia: number;
  totalDivisi: number;
  divisiStats: DivisiStats[];
}

interface SpecialPermissions {
  canAccessKestari: boolean;
  canAccessKonsumsi: boolean;
  canAccessDefault: boolean;
  note: string;
  additionalRoutes: string[];
}

interface DivisiAccessResult {
  hasAccess: boolean;
  redirectPath: string;
  dashboardType: string;
  panitiaData: any;
  message: string;
  specialPermissions?: SpecialPermissions;
}

export default function DashboardDefault() {
  const { data: session, status } = useSession();
  const { userData, loading: userLoading } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [specialPermissions, setSpecialPermissions] = useState<SpecialPermissions | null>(null);

  useEffect(() => {
    const checkUserDivisiAndRedirect = async () => {
      console.log("🔍 Dashboard: Checking user divisi for redirect...");

      if (status === "loading" || userLoading) {
        console.log("⏳ Dashboard: Still loading session or user data...");
        return;
      }

      if (status === "unauthenticated") {
        console.log("❌ Dashboard: Unauthenticated, redirecting to login");
        router.push("/");
        return;
      }

      if (status === "authenticated" && userData) {
        try {
          console.log("✅ Dashboard: Authenticated, checking divisi redirect...");
          
          // Gunakan API divisi-access untuk check redirect
          const response = await fetch("/api/panitiapeserta/divisi-access", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: session?.user?.email }),
          });

          const result: DivisiAccessResult = await response.json();
          
          if (response.ok && result.hasAccess) {
            const { redirectPath, dashboardType, panitiaData } = result;
            
            console.log(`📊 Divisi check result:`, {
              divisi_id: panitiaData.divisi_id,
              divisi_nama: panitiaData.divisi_nama,
              dashboardType,
              redirectPath,
              specialPermissions: result.specialPermissions
            });

            // Set special permissions jika ada
            if (result.specialPermissions) {
              setSpecialPermissions(result.specialPermissions);
            }

            // Logic redirect yang diperbaiki:
            // 1. KESTARI (divisi_id=6) → redirect ke /dashboardkestari
            // 2. Konsumsi (divisi_id=7) → redirect ke /dashboardkonsumsi  
            // 3. PIT (divisi_id=11) → stay di /dashboard dengan special permissions
            // 4. Others → stay di /dashboard
            
            if (dashboardType === 'kestari' && redirectPath === '/dashboardkestari') {
              console.log(`🚀 KESTARI user, redirecting to: ${redirectPath}`);
              setTimeout(() => {
                router.push(redirectPath);
              }, 1000);
              return;
            } else if (dashboardType === 'konsumsi' && redirectPath === '/dashboardkonsumsi') {
              console.log(`🚀 Konsumsi user, redirecting to: ${redirectPath}`);
              setTimeout(() => {
                router.push(redirectPath);
              }, 1000);
              return;
            } else if (dashboardType === 'pit_special' || dashboardType === 'default') {
              // PIT users dan divisi lain bisa akses dashboard default
              console.log(`🎯 User stays on default dashboard (${dashboardType})`);
              setIsChecking(false);
            } else {
              // Fallback untuk case lain
              console.log(`🎯 Fallback: User stays on default dashboard`);
              setIsChecking(false);
            }
          } else {
            console.log("❌ Dashboard: Failed to get divisi data:", result.error);
            setError(result.error || "Failed to get divisi data");
            setIsChecking(false);
          }
        } catch (err: any) {
          console.error("❌ Dashboard: Error checking divisi:", err);
          setError("Error checking divisi: " + err.message);
          setIsChecking(false);
        }
      }
    };

    checkUserDivisiAndRedirect();
  }, [session, status, userData, userLoading, router]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (isChecking || status === "loading" || userLoading) return;
      
      try {
        console.log("📊 Fetching dashboard statistics...");
        setStatsLoading(true);
        
        const response = await fetch("/api/dashboard/stats", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        
        if (response.ok && result.success) {
          setDashboardStats(result.data);
          console.log("✅ Dashboard stats loaded:", result.data);
        } else {
          console.error("❌ Failed to fetch dashboard stats:", result.error);
        }
      } catch (err) {
        console.error("💥 Error fetching dashboard stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
  }, [isChecking, status, userLoading]);

  // Split divisi stats into 3 columns like in the image
  const splitDivisiStats = (stats: DivisiStats[]) => {
    const totalItems = stats.length;
    const itemsPerColumn = Math.ceil(totalItems / 3);
    
    return [
      stats.slice(0, itemsPerColumn),
      stats.slice(itemsPerColumn, itemsPerColumn * 2),
      stats.slice(itemsPerColumn * 2)
    ];
  };

  // Loading state
  if (status === "loading" || userLoading || isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-6"></div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {status === "loading" || userLoading ? "Memuat session..." : "Memeriksa divisi Anda..."}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {status === "loading" || userLoading
              ? "Tunggu sebentar, sistem sedang memverifikasi login Anda."
              : "Sistem sedang menentukan dashboard yang sesuai dengan divisi Anda."
            }
          </p>

          {userData && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left text-sm">
              <h3 className="font-bold mb-2 text-blue-800">Info User:</h3>
              <div className="space-y-1 text-blue-700">
                <p><strong>Nama:</strong> {userData.nama_lengkap}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Divisi:</strong> {userData.divisi_nama}</p>
                <p><strong>Jabatan:</strong> {userData.jabatan_nama}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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

  // Main dashboard content
  return (
    <div className="space-y-8">
      {/* Header with Raja Brawijaya ornament */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative py-12 px-8 text-center">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          {/* Header content */}
          <div className="relative">
            {/* Golden ornament */}
            <div className="flex justify-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-8 bg-yellow-400 rounded-full opacity-80"></div>
                <div className="text-2xl font-bold tracking-wider">RAJA</div>
                <div className="w-12 h-8 bg-yellow-400 rounded-full opacity-80"></div>
              </div>
            </div>
            <div className="text-lg font-semibold mb-4">Brawijaya</div>
            
            {/* Dashboard Title */}
            <h1 className="text-4xl font-bold mb-2">Dashboard Admin</h1>
            <p className="text-teal-100">Dashboard Admin Raja Brawijaya 2025</p>
            
            {/* Special permissions indicator for PIT users */}
            {specialPermissions && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-400 bg-opacity-20 border border-yellow-300 rounded-lg text-yellow-100">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Special Access: PIT User</span>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Statistics Cards */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Total Panitia */}
          <div className="text-center border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-teal-50 to-teal-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Panitia</h2>
            <div className="text-6xl font-bold text-teal-600">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-20 rounded mx-auto w-32"></div>
              ) : (
                dashboardStats?.totalPanitia || 0
              )}
            </div>
          </div>

          {/* Total Divisi */}
          <div className="text-center border border-gray-200 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-blue-100">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Total Divisi</h2>
            <div className="text-6xl font-bold text-teal-600">
              {statsLoading ? (
                <div className="animate-pulse bg-gray-200 h-20 rounded mx-auto w-32"></div>
              ) : (
                dashboardStats?.totalDivisi || 0
              )}
            </div>
          </div>
        </div>

        {/* Divisi Breakdown */}
        {!statsLoading && dashboardStats?.divisiStats && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Distribusi Panitia per Divisi</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {splitDivisiStats(dashboardStats.divisiStats).map((column, columnIndex) => (
                <div key={columnIndex} className="space-y-3">
                  {column.map((divisi, index) => (
                    <div 
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md hover:bg-gray-100 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{divisi.nama_divisi}</span>
                        <span className="text-lg font-bold text-teal-600 bg-teal-100 px-3 py-1 rounded-full">
                          {divisi.jumlah_panitia}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {statsLoading && (
          <div>
            <div className="animate-pulse bg-gray-200 h-6 rounded w-48 mx-auto mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((col) => (
                <div key={col} className="space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Info Card */}
      {userData && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi User</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nama Lengkap:</span>
                <span className="font-medium">{userData.nama_lengkap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{userData.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Divisi:</span>
                <span className="font-medium">
                  <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs">
                    {userData.divisi_nama}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Jabatan:</span>
                <span className="font-medium">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {userData.jabatan_nama}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs">
              <strong>Debug Info:</strong> Divisi ID: {userData.divisi_id}
              {specialPermissions && (
                <div className="mt-1">
                  <strong>Special Permissions:</strong> {JSON.stringify(specialPermissions, null, 2)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}