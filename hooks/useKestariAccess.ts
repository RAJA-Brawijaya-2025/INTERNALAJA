'use client'

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface KestariAccessData {
  hasAccess: boolean;
  loading: boolean;
  panitiaData: {
    id: number;
    nama_lengkap: string;
    email: string;
    divisi_id: number;
    jabatan_id: number;
    divisi_nama: string;
    jabatan_nama: string;
  } | null;
  error?: string;
  retryCount: number;
  accessReason?: 'kestari' | 'pit' | 'denied';
}

interface UseKestariAccessOptions {
  redirectOnDenied?: boolean;
  unauthorizedRedirectUrl?: string;
  maxRetries?: number;
  retryDelay?: number;
}

export function useKestariAccess(options: UseKestariAccessOptions = {}): KestariAccessData & { retry: () => void } {
  // Always call hooks in the same order - no conditional hooks
  const { data: session, status } = useSession();
  const router = useRouter();
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Extract options with defaults - always the same
  const redirectOnDenied = options.redirectOnDenied ?? true;
  const unauthorizedRedirectUrl = options.unauthorizedRedirectUrl ?? '/';
  const maxRetries = options.maxRetries ?? 3;
  const retryDelay = options.retryDelay ?? 2000;
  
  // Always initialize state the same way
  const [accessData, setAccessData] = useState<KestariAccessData>({
    hasAccess: false,
    loading: true,
    panitiaData: null,
    retryCount: 0
  });

  // Always define callback - no conditional definition
  const checkKestariAccess = useCallback(async (retryCount = 0) => {
    console.log(`🔍 Checking Kestari access (attempt ${retryCount + 1})`);
    
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Update loading state if retry
    if (retryCount > 0) {
      setAccessData(prev => ({ 
        ...prev, 
        loading: true, 
        error: undefined,
        retryCount 
      }));
    }

    // Handle session loading
    if (status === "loading") {
      console.log("⏳ Session still loading...");
      return;
    }
    
    // Handle no session - redirect to home
    if (!session?.user?.email) {
      console.log("❌ No session found - redirecting to home");
      
      setAccessData({
        hasAccess: false,
        loading: false,
        panitiaData: null,
        error: 'Not authenticated',
        retryCount,
        accessReason: 'denied'
      });
      
      if (redirectOnDenied) {
        router.push('/');
      }
      return;
    }

    try {
      console.log('🔍 Making API request for Kestari access:', session.user.email);
      
      const response = await fetch('/api/panitiapeserta/divisi-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: 'Unknown error', details: errorText };
        }
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('📊 API Result for Kestari access:', result);

      // Check if user has access to Kestari dashboard
      if (result.hasAccess && result.panitiaData) {
        const divisiId = result.panitiaData.divisi_id;
        
        // Allow access for KESTARI (6) and PIT (11)
        const allowedDivisi = [6, 11];
        const hasKestariAccess = allowedDivisi.includes(divisiId);
        
        if (hasKestariAccess) {
          const accessReason = divisiId === 6 ? 'kestari' : 'pit';
          
          setAccessData({
            hasAccess: true,
            loading: false,
            panitiaData: result.panitiaData,
            retryCount,
            accessReason
          });
          
          console.log(`✅ Kestari access granted for ${result.panitiaData.divisi_nama} (${accessReason.toUpperCase()}):`, result.panitiaData?.nama_lengkap);
        } else {
          console.log(`❌ Kestari access denied for divisi: ${result.panitiaData.divisi_nama} (ID: ${divisiId})`);
          
          setAccessData({
            hasAccess: false,
            loading: false,
            panitiaData: result.panitiaData,
            error: `Access denied. Kestari dashboard hanya untuk divisi KESTARI dan PIT. Anda terdaftar sebagai: ${result.panitiaData.divisi_nama}`,
            retryCount,
            accessReason: 'denied'
          });
          
          if (redirectOnDenied) {
            // Redirect based on their actual divisi
            const userRedirectPath = result.redirectPath || '/dashboard';
            console.log(`🚀 Redirecting to appropriate dashboard: ${userRedirectPath}`);
            router.push(userRedirectPath);
          }
        }
      } else {
        console.log('❌ General access denied:', result.error);
        
        setAccessData({
          hasAccess: false,
          loading: false,
          panitiaData: null,
          error: result.error || 'Access denied',
          retryCount,
          accessReason: 'denied'
        });
        
        if (redirectOnDenied) {
          router.push(unauthorizedRedirectUrl);
        }
      }
    } catch (error: any) {
      console.error('💥 Error checking Kestari access:', error);
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
        
        setAccessData(prev => ({
          ...prev,
          loading: true,
          error: `Retrying... (${retryCount + 1}/${maxRetries})`,
          retryCount: retryCount + 1
        }));
        
        retryTimeoutRef.current = setTimeout(() => {
          checkKestariAccess(retryCount + 1);
        }, retryDelay);
        
        return;
      }
      
      // Max retries reached
      console.log('💀 Max retries reached');
      
      setAccessData({
        hasAccess: false,
        loading: false,
        panitiaData: null,
        error: `Network error after ${maxRetries} attempts: ${error.message}`,
        retryCount,
        accessReason: 'denied'
      });
      
      if (redirectOnDenied && error.message !== 'Not authenticated') {
        router.push(unauthorizedRedirectUrl);
      }
    }
  }, [session, status, router, redirectOnDenied, unauthorizedRedirectUrl, maxRetries, retryDelay]);

  // Always define retry callback
  const retry = useCallback(() => {
    console.log('🔄 Manual retry triggered for Kestari access');
    setAccessData(prev => ({ ...prev, retryCount: 0 }));
    checkKestariAccess(0);
  }, [checkKestariAccess]);

  // Always call useEffect - no conditional effects
  useEffect(() => {
    checkKestariAccess(0);
    
    // Cleanup timeout on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [checkKestariAccess]);

  // Always return the same structure
  return { 
    hasAccess: accessData.hasAccess,
    loading: accessData.loading,
    panitiaData: accessData.panitiaData,
    error: accessData.error,
    retryCount: accessData.retryCount,
    accessReason: accessData.accessReason,
    retry 
  };
}

// Simple non-redirecting version for conditional checks
export function useKestariAccessCheck(): Omit<KestariAccessData, 'retryCount'> {
  const { hasAccess, loading, panitiaData, error, accessReason } = useKestariAccess({ 
    redirectOnDenied: false,
    maxRetries: 1
  });
  
  return { hasAccess, loading, panitiaData, error, accessReason };
}