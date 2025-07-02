/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronDown,
  Search,
  Download,
  Edit,
  AlertCircle,
  QrCode,
  RefreshCw,
  Bug,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";

// Import Access Control Components
import KestariAccessWrapper from "@/components/KestariAccessWrapper";
import { useKestariAccessCheck } from "@/hooks/useKestariAccess";

// ... (interface definitions tetap sama)
interface PanitiaData {
  id: number;
  panitia_id: number;
  nim: string;
  nama_lengkap: string;
  divisi: string;
  kehadiran: "Hadir" | "Tidak Hadir";
  status: "Hadir" | "Tidak Hadir";
  waktu_hadir: string;
  waktu_absensi: string | null;
  tanggal_absensi: string;
  metode_absensi: "QR Code" | "Manual";
  catatan?: string;
  kegiatan_nama?: string;
  _apiIndex?: number;
  _debugInfo?: string | null;
}

interface KegiatanData {
  id: number;
  nama: string;
  deskripsi?: string;
  jenisRangkaian: "single" | "multiple";
  tanggal?: string;
  tanggalRaw?: string;
  divisi?: string[];
  subKegiatan?: Array<{
    id: number;
    nama: string;
    tanggal: string;
    tanggalFormatted?: string;
  }>;
}

interface DayOption {
  id: number;
  nama: string;
  tanggal: string;
}

interface StatsData {
  total: number;
  hadir: number;
  tidakHadir: number;
  hadirPercentage: number;
  tidakHadirPercentage: number;
}

// Main Dashboard Component (Protected Content)
function DashboardKestariContent() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Access control untuk cek divisi user
  const { panitiaData } = useKestariAccessCheck();
  
  // State untuk kegiatan dan tanggal
  const [selectedKegiatan, setSelectedKegiatan] = useState("");
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedRangkaianId, setSelectedRangkaianId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  
  // State untuk UI
  const [showKegiatanDropdown, setShowKegiatanDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // State untuk data
  const [kegiatanList, setKegiatanList] = useState<KegiatanData[]>([]);
  const [allPanitiaData, setAllPanitiaData] = useState<PanitiaData[]>([]);
  const [filteredPanitiaData, setFilteredPanitiaData] = useState<PanitiaData[]>([]);
  
  // State untuk loading dan error
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  
  // Debug mode
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showDebug, setShowDebug] = useState(false);
  
  // Constants
  const jenisKonsumsi = "konsumsi_1";
  const entriesPerPage = 20;

  // State untuk sorting
  const [sortConfig, setSortConfig] = useState<{ key: 'divisi' | 'kehadiran' | 'waktu_hadir' | 'metode_absensi'; direction: 'asc' | 'desc' } | null>(null);

  // Helper function untuk mengecek apakah kegiatan adalah single event
  const isSingleEvent = () => {
    const kegiatan = getCurrentKegiatan();
    return kegiatan?.jenisRangkaian === "single";
  };

  // ===== NEW: URL State Management Functions =====
  const updateURLParams = useCallback((params: Record<string, string>) => {
    const url = new URL(window.location.href);
    
    // Update atau hapus parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== "" && value !== "null") {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    
    // Update URL tanpa reload
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Restore state dari URL parameters
  const restoreStateFromURL = useCallback(() => {
    const urlKegiatanId = searchParams.get('kegiatanId');
    const urlKegiatanNama = searchParams.get('kegiatanNama');
    const urlDayName = searchParams.get('dayName');
    const urlRangkaianId = searchParams.get('rangkaianId');
    const urlDate = searchParams.get('date');

    console.log('🔄 Restoring state from URL:', {
      kegiatanId: urlKegiatanId,
      kegiatanNama: urlKegiatanNama,
      dayName: urlDayName,
      rangkaianId: urlRangkaianId,
      date: urlDate
    });

    return {
      kegiatanId: urlKegiatanId ? parseInt(urlKegiatanId) : null,
      kegiatanNama: urlKegiatanNama ? decodeURIComponent(urlKegiatanNama) : "",
      dayName: urlDayName ? decodeURIComponent(urlDayName) : "",
      rangkaianId: urlRangkaianId && urlRangkaianId !== "null" ? parseInt(urlRangkaianId) : null,
      date: urlDate ? decodeURIComponent(urlDate) : ""
    };
  }, [searchParams]);

  // Load kegiatan data dan restore state
  useEffect(() => {
    fetchKegiatan();
  }, []);

  // Auto refresh detection dari edit success
  useEffect(() => {
    const editSuccess = searchParams.get('edit');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const timestamp = searchParams.get('t');
    
    if (editSuccess === 'success') {
      console.log('🔄 Detected edit success, triggering auto refresh...');
      
      // Force refresh data setelah edit berhasil
      if (selectedKegiatanId && selectedDate) {
        setTimeout(() => {
          setRefreshKey(prev => prev + 1);
          fetchAbsensiData(true);
        }, 100);
      }
      
      // Clean query parameters dari URL
      const url = new URL(window.location.href);
      url.searchParams.delete('edit');
      url.searchParams.delete('t');
      window.history.replaceState({}, '', url.toString());
      
      // Show success notification
      setTimeout(() => {
        showSuccessNotification();
      }, 500);
    }
  }, [searchParams, selectedKegiatanId, selectedDate]);

  // Auto fetch data when dependencies change
  useEffect(() => {
    if (selectedKegiatanId && selectedDate) {
      fetchAbsensiData();
    } else {
      setAllPanitiaData([]);
      setFilteredPanitiaData([]);
    }
  }, [selectedKegiatanId, selectedRangkaianId, selectedDate, refreshKey]);

  // Filter data berdasarkan search dan divisi
  useEffect(() => {
    filterPanitiaData();
  }, [searchQuery, allPanitiaData, selectedKegiatanId, selectedRangkaianId, kegiatanList]);

  // Success notification helper
  const showSuccessNotification = () => {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: #10b981; 
        color: white; 
        padding: 16px 24px; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        Data presensi berhasil diperbarui!
      </div>
      <style>
        @keyframes slideIn { 
          from { transform: translateX(100%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
      </style>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  };

  // ===== MODIFIED: Fetch kegiatan dengan state restoration =====
  const fetchKegiatan = async () => {
    try {
      const response = await fetch("/api/panitiapeserta/kegiatan?limit=100");
      const result = await response.json();
      
      if (result.success) {
        setKegiatanList(result.data);
        
        // Coba restore state dari URL dulu
        const urlState = restoreStateFromURL();
        
        if (urlState.kegiatanId && urlState.kegiatanNama) {
          // Restore state dari URL
          const kegiatan = result.data.find((k: KegiatanData) => k.id === urlState.kegiatanId);
          
          if (kegiatan) {
            console.log('✅ Restoring state from URL:', urlState);
            
            setSelectedKegiatan(urlState.kegiatanNama);
            setSelectedKegiatanId(urlState.kegiatanId);
            setSelectedDay(urlState.dayName);
            setSelectedRangkaianId(urlState.rangkaianId);
            setSelectedDate(urlState.date);
            
            return; // Skip auto-select jika berhasil restore
          }
        }
        
        // Auto select first kegiatan jika tidak ada state di URL
        if (result.data.length > 0) {
          const firstKegiatan = result.data[0];
          setSelectedKegiatan(firstKegiatan.nama);
          setSelectedKegiatanId(firstKegiatan.id);
          
          let dayName = "";
          let rangkaianId = null;
          let date = "";
          
          if (firstKegiatan.jenisRangkaian === "single") {
            dayName = "Hari Kegiatan";
            date = firstKegiatan.tanggalRaw || "";
          } else if (firstKegiatan.subKegiatan && firstKegiatan.subKegiatan.length > 0) {
            const firstSub = firstKegiatan.subKegiatan[0];
            dayName = firstSub.nama;
            rangkaianId = firstSub.id;
            date = firstSub.tanggal;
          }
          
          setSelectedDay(dayName);
          setSelectedRangkaianId(rangkaianId);
          setSelectedDate(date);
          
          // Update URL dengan pilihan default
          updateURLParams({
            kegiatanId: firstKegiatan.id.toString(),
            kegiatanNama: encodeURIComponent(firstKegiatan.nama),
            dayName: encodeURIComponent(dayName),
            rangkaianId: rangkaianId ? rangkaianId.toString() : "null",
            date: encodeURIComponent(date)
          });
        }
      } else {
        setError("Gagal memuat data kegiatan");
      }
    } catch (err) {
      console.error('❌ Error fetching kegiatan:', err);
      setError("Gagal memuat data kegiatan");
    }
  };

  // ===== MODIFIED: Handler kegiatan change dengan URL update =====
  const handleKegiatanChange = (kegiatan: KegiatanData) => {
    setSelectedKegiatan(kegiatan.nama);
    setSelectedKegiatanId(kegiatan.id);
    setShowKegiatanDropdown(false);

    let dayName = "";
    let rangkaianId = null;
    let date = "";

    if (kegiatan.jenisRangkaian === "single") {
      dayName = "Hari Kegiatan";
      date = kegiatan.tanggalRaw || "";
    } else {
      const dayOptions = (kegiatan.subKegiatan || []).map((sub) => ({
        id: sub.id,
        nama: sub.nama,
        tanggal: sub.tanggal,
      }));

      if (dayOptions[0]) {
        dayName = dayOptions[0].nama;
        date = dayOptions[0].tanggal;
        rangkaianId = dayOptions[0].id;
      }
    }

    setSelectedDay(dayName);
    setSelectedDate(date);
    setSelectedRangkaianId(rangkaianId);

    // Update URL
    updateURLParams({
      kegiatanId: kegiatan.id.toString(),
      kegiatanNama: encodeURIComponent(kegiatan.nama),
      dayName: encodeURIComponent(dayName),
      rangkaianId: rangkaianId ? rangkaianId.toString() : "null",
      date: encodeURIComponent(date)
    });

    setCurrentPage(1);
    setError("");
    setRefreshKey((prev) => prev + 1);
  };

  // ===== MODIFIED: Handler day change dengan URL update =====
  const handleDayChange = (day: DayOption) => {
    const kegiatan = getCurrentKegiatan();
    const newRangkaianId = kegiatan?.jenisRangkaian === "single" ? null : day.id;

    setSelectedDay(day.nama);
    setSelectedDate(day.tanggal);
    setSelectedRangkaianId(newRangkaianId);
    setShowDayDropdown(false);

    // Update URL
    updateURLParams({
      kegiatanId: selectedKegiatanId?.toString() || "",
      kegiatanNama: encodeURIComponent(selectedKegiatan),
      dayName: encodeURIComponent(day.nama),
      rangkaianId: newRangkaianId ? newRangkaianId.toString() : "null",
      date: encodeURIComponent(day.tanggal)
    });

    setCurrentPage(1);
    setError("");
    setRefreshKey((prev) => prev + 1);
  };

  // ===== MODIFIED: Floating QR Button dengan URL parameters yang persistent =====
  const handleQRScan = () => {
    const params = new URLSearchParams({
      kegiatanId: selectedKegiatanId?.toString() || "",
      kegiatanNama: encodeURIComponent(selectedKegiatan),
      rangkaianId: selectedRangkaianId?.toString() || "",
      tanggal: selectedDate,
      jenisKonsumsi,
      // Tambahkan parameter untuk state restoration
      returnKegiatanId: selectedKegiatanId?.toString() || "",
      returnKegiatanNama: encodeURIComponent(selectedKegiatan),
      returnDayName: encodeURIComponent(selectedDay),
      returnRangkaianId: selectedRangkaianId?.toString() || "null",
      returnDate: encodeURIComponent(selectedDate)
    });
    router.push(`/dashboardkestari/qraja?${params.toString()}`);
  };

  // Fetch absensi data dengan improved caching
  const fetchAbsensiData = useCallback(async (forceRefresh = false) => {
    if (!selectedKegiatanId || !selectedDate) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const formatDateForDB = (dateInput: string): string => {
        const date = new Date(dateInput);
        return date.toISOString().split("T")[0];
      };
      
      const params = new URLSearchParams({
        kegiatan_id: selectedKegiatanId.toString(),
        tanggal: formatDateForDB(selectedDate),
        limit: "1000",
        _t: Date.now().toString(),
        _refresh: forceRefresh ? 'true' : 'false'
      });
      
      if (selectedRangkaianId) {
        params.append("kegiatan_rangkaian_id", selectedRangkaianId.toString());
      } else {
        params.append("kegiatan_rangkaian_id", "null");
      }
      
      console.log('🌐 Fetching absensi data with params:', params.toString());
      
      const response = await fetch(`/api/absensi?${params}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cleanedData = result.data.map((item: any, apiIndex: number) => ({
          id: item.id || 0,
          panitia_id: item.panitia_id,
          nim: item.nim,
          nama_lengkap: item.nama_lengkap,
          divisi: item.divisi,
          kehadiran: item.kehadiran || item.status || 'Tidak Hadir',
          status: item.status || 'Tidak Hadir',
          waktu_hadir: item.waktu_hadir || '-',
          waktu_absensi: item.waktu_absensi,
          tanggal_absensi: item.tanggal_absensi,
          metode_absensi: item.metode_absensi || 'Manual',
          catatan: item.catatan,
          kegiatan_nama: item.kegiatan_nama,
          _apiIndex: apiIndex,
          _debugInfo: showDebug ? `API[${apiIndex}] ID:${item.id} PID:${item.panitia_id}` : null
        }));

        console.log(`✅ Data absensi berhasil di-${forceRefresh ? 'force-' : ''}refresh:`, cleanedData.length, 'records');
        
        setAllPanitiaData(cleanedData);
        
        if (forceRefresh) {
          showRefreshIndicator();
        }
      } else {
        setError(result.message || "Gagal memuat data absensi");
        setAllPanitiaData([]);
      }
    } catch (error) {
      console.error('❌ Error fetching absensi data:', error);
      setError("Gagal memuat data absensi");
      setAllPanitiaData([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedKegiatanId, selectedRangkaianId, selectedDate, showDebug]);

  // Show refresh indicator
  const showRefreshIndicator = () => {
    const indicator = document.createElement('div');
    indicator.innerHTML = `
      <div style="
        position: fixed; 
        bottom: 20px; 
        right: 20px; 
        background: #3b82f6; 
        color: white; 
        padding: 8px 16px; 
        border-radius: 6px; 
        font-size: 14px;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 6px;
      ">
        <svg class="animate-spin" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        Data refreshed
      </div>
    `;
    document.body.appendChild(indicator);
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 1500);
  };

  // Filter panitia data berdasarkan divisi dan search
  const filterPanitiaData = () => {
    let allowedDivisi: string[] = [];
    const kegiatan = getCurrentKegiatan();
    if (kegiatan) {
      if (kegiatan.jenisRangkaian === "single") {
        allowedDivisi = kegiatan.divisi || [];
      } else if (selectedRangkaianId && kegiatan.subKegiatan) {
        const sub = kegiatan.subKegiatan.find((s) => s.id === selectedRangkaianId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allowedDivisi = (sub && (sub as any).divisi) ? (sub as any).divisi : (kegiatan.divisi || []);
      } else {
        allowedDivisi = kegiatan.divisi || [];
      }
    }

    const isAll = allowedDivisi.includes("Semua");
    
    const filtered = allPanitiaData.filter((panitia) => {
      const divisiMatch = isAll || allowedDivisi.includes(panitia.divisi);
      const searchMatch = !searchQuery || 
        panitia.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        panitia.nim.includes(searchQuery) ||
        panitia.divisi.toLowerCase().includes(searchQuery.toLowerCase());
      
      return divisiMatch && searchMatch;
    });

    setFilteredPanitiaData(filtered);
    setCurrentPage(1);
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    if (selectedKegiatanId && selectedDate) {
      console.log('🔄 Manual refresh triggered...');
      setRefreshKey(prev => prev + 1);
      await fetchAbsensiData(true);
    }
  };

  // Get current kegiatan
  const getCurrentKegiatan = () => kegiatanList.find((k) => k.id === selectedKegiatanId);

  // Get day options
  const getDayOptions = (): DayOption[] => {
    const kegiatan = getCurrentKegiatan();
    if (!kegiatan) return [];
    
    if (kegiatan.jenisRangkaian === "single") {
      return [{ id: 1, nama: "Hari Kegiatan", tanggal: kegiatan.tanggalRaw || "" }];
    } else if (kegiatan.subKegiatan && kegiatan.subKegiatan.length > 0) {
      return kegiatan.subKegiatan.map((sub) => ({
        id: sub.id,
        nama: sub.nama,
        tanggal: sub.tanggal,
      }));
    }
    
    return [];
  };

  // Calculate statistics
  const calculateStats = (): StatsData => {
    const total = filteredPanitiaData.length;
    const hadir = filteredPanitiaData.filter(p => p.kehadiran === "Hadir").length;
    const tidakHadir = total - hadir;
    
    return {
      total,
      hadir,
      tidakHadir,
      hadirPercentage: total > 0 ? Math.round((hadir / total) * 100) : 0,
      tidakHadirPercentage: total > 0 ? Math.round((tidakHadir / total) * 100) : 0,
    };
  };

  // Handler sorting
  const handleSort = (key: 'divisi' | 'kehadiran' | 'waktu_hadir' | 'metode_absensi') => {
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Sorting logic
  const sortedData = [...filteredPanitiaData];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      let aVal: string = '';
      let bVal: string = '';
      if (sortConfig.key === 'divisi') {
        aVal = a.divisi;
        bVal = b.divisi;
      } else if (sortConfig.key === 'kehadiran') {
        const order = { 'Hadir': 1, 'Tidak Hadir': 0 };
        return sortConfig.direction === 'asc'
          ? (order[a.kehadiran] ?? 0) - (order[b.kehadiran] ?? 0)
          : (order[b.kehadiran] ?? 0) - (order[a.kehadiran] ?? 0);
      } else if (sortConfig.key === 'waktu_hadir') {
        aVal = a.waktu_hadir || '';
        bVal = b.waktu_hadir || '';
        if (aVal === '-' || !aVal) return 1;
        if (bVal === '-' || !bVal) return -1;
      } else if (sortConfig.key === 'metode_absensi') {
        aVal = a.metode_absensi;
        bVal = b.metode_absensi;
      }
      return sortConfig.direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });
  }
  const totalPages = Math.ceil(sortedData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Render pagination buttons
  const renderPaginationButtons = () => {
    const buttons: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      if (currentPage <= 3) {
        buttons.push(1, 2, 3, 4, "...end", totalPages - 1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        buttons.push(1, 2, "...start", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, 2, "...start", currentPage - 1, currentPage, currentPage + 1, "...end", totalPages - 1, totalPages);
      }
    }
    
    const uniqueButtons: { value: number | string; key: string }[] = [];
    const seen = new Set();
    buttons.forEach((btn, index) => {
      const key = typeof btn === "string" ? `${btn}-${index}` : btn.toString();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueButtons.push({ value: btn, key });
      }
    });
    
    return uniqueButtons;
  };

  // Format date helper
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Tanggal belum ditentukan";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Tanggal tidak valid";
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get current kegiatan info
  const getCurrentKegiatanInfo = () => {
    const kegiatan = getCurrentKegiatan();
    if (!kegiatan) {
      return {
        nama: "Pilih Kegiatan",
        hari: "Pilih Hari",
        tanggal: "",
        divisiCount: 0,
        divisiList: [] as string[],
      };
    }
    
    const kegiatanDivisi = kegiatan.divisi || [];
    return {
      nama: kegiatan.nama,
      hari: selectedDay,
      tanggal: selectedDate ? formatDate(selectedDate) : "",
      divisiCount: kegiatanDivisi.length,
      divisiList: kegiatanDivisi,
    };
  };

  // Calculate statistics
  const stats = calculateStats();

  // Handler download CSV
  const handleDownload = () => {
    const currentKegiatan = getCurrentKegiatan();
    const csvContent = [
      ["NIM", "Nama Lengkap", "Divisi", "Status", "Waktu Hadir", "Tanggal", "Metode"],
      ...sortedData.map((p) => [
        p.nim,
        p.nama_lengkap,
        p.divisi,
        p.kehadiran,
        p.waktu_hadir,
        p.tanggal_absensi,
        p.metode_absensi,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `absensi_${currentKegiatan?.nama || "kegiatan"}_${selectedDay}_${selectedDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler edit
  const handleEdit = (clickedPanitia: PanitiaData) => {
    if (!clickedPanitia.nim || !clickedPanitia.nama_lengkap) {
      setError("Data panitia tidak valid untuk diedit - NIM kosong");
      return;
    }

    const params = new URLSearchParams();
    if (selectedKegiatanId) params.append('kegiatan_id', selectedKegiatanId.toString());
    if (selectedRangkaianId) params.append('kegiatan_rangkaian_id', selectedRangkaianId.toString());
    if (selectedDate) params.append('tanggal', selectedDate);

    const editUrl = `/dashboardkestari/editpanitia/${clickedPanitia.nim}?${params.toString()}`;
    router.push(editUrl);
  };

  const kegiatanInfo = getCurrentKegiatanInfo();

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              Absensi Panitia
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Dashboard pemantauan kehadiran Panitia Raja Brawijaya 2025
            </p>
            {/* Indicator Divisi User */}
            {panitiaData && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs bg-[#e0f2f7] text-[#4891A1] px-2 py-1 rounded-full font-medium">
                  {panitiaData.divisi_nama}
                </span>
                {panitiaData.divisi_id === 11 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    Download Access
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {/* Debug Toggle - Uncommented for access verification */}
            {/* <button
              onClick={() => setShowDebug(!showDebug)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showDebug 
                  ? 'bg-[#e0f2f7] text-[#4891A1] border border-[#4891A1]' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
              title="Toggle debug mode untuk cek access download"
            >
              <Bug size={16} />
              Debug {showDebug ? 'ON' : 'OFF'}
            </button> */}
            
            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={!selectedKegiatanId || !selectedDate || isLoading}
              className={`flex items-center gap-2 bg-[#4891A1] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-[#35707e] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base ${
                isLoading ? 'animate-pulse' : ''
              }`}
              title="Refresh data terbaru"
            >
              <RefreshCw 
                size={16} 
                className={`${isLoading ? 'animate-spin' : ''} transition-transform duration-200`}
              />
              <span className="hidden md:inline">
                {isLoading ? 'Loading...' : 'Refresh'}
              </span>
            </button>
            
            {/* Download Button - Hanya untuk PIT (divisi_id = 11) */}
            {panitiaData?.divisi_id === 11 && (
              <button
                onClick={handleDownload}
                disabled={filteredPanitiaData.length === 0}
                className="flex items-center gap-2 bg-white border border-[#4891A1] text-[#4891A1] px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-[#e0f2f7] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                title="Download Absensi (Khusus PIT)"
              >
                <Download size={16} />
                <span className="hidden md:inline">Download Absensi</span>
                <span className="md:hidden">Download</span>
              </button>
            )}
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
              <Bug size={20} />
              Debug Information
            </h3>
            <div className="text-sm text-orange-700 space-y-1">
              <p><strong>User Divisi ID:</strong> {panitiaData?.divisi_id || 'Not loaded'}</p>
              <p><strong>User Divisi Name:</strong> {panitiaData?.divisi_nama || 'Not loaded'}</p>
              <p><strong>Download Access:</strong> {panitiaData?.divisi_id === 11 ? 'Granted (PIT)' : 'Denied (Not PIT)'}</p>
              <hr className="my-2 border-orange-300" />
              <p><strong>Selected Kegiatan ID:</strong> {selectedKegiatanId}</p>
              <p><strong>Selected Kegiatan:</strong> {selectedKegiatan}</p>
              <p><strong>Selected Day:</strong> {selectedDay}</p>
              <p><strong>Selected Rangkaian ID:</strong> {selectedRangkaianId}</p>
              <p><strong>Selected Date:</strong> {selectedDate}</p>
              <p><strong>Is Single Event:</strong> {isSingleEvent() ? 'Yes' : 'No'}</p>
              <p><strong>Total Records:</strong> {allPanitiaData.length}</p>
              <p><strong>Filtered Records:</strong> {filteredPanitiaData.length}</p>
              <p><strong>Current Page Data:</strong> {currentData.length}</p>
              <p><strong>Page:</strong> {currentPage} of {totalPages}</p>
              <p><strong>Refresh Key:</strong> {refreshKey}</p>
              <div className="mt-2 p-2 bg-white rounded text-xs">
                <strong>URL State:</strong>
                <pre>{JSON.stringify({
                  kegiatanId: searchParams.get('kegiatanId'),
                  kegiatanNama: searchParams.get('kegiatanNama'),
                  dayName: searchParams.get('dayName'),
                  rangkaianId: searchParams.get('rangkaianId'),
                  date: searchParams.get('date')
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle size={20} />
              <span className="font-medium text-sm md:text-base">{error}</span>
            </div>
          </div>
        )}

        {/* Kegiatan and Day Selection */}
        <div className={`grid gap-4 md:gap-6 mb-6 md:mb-8 ${isSingleEvent() ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {/* Kegiatan Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowKegiatanDropdown(!showKegiatanDropdown)}
              className="w-full bg-[#4891A1] text-white px-4 md:px-6 py-3 md:py-4 rounded-lg flex items-center justify-between font-medium text-sm md:text-base hover:bg-[#35707e] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span className="truncate">
                  {selectedKegiatan || "Pilih Kegiatan"}
                </span>
              </div>
              <ChevronDown size={20} className="flex-shrink-0" />
            </button>
            
            {showKegiatanDropdown && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {kegiatanList.map((kegiatan, index) => (
                  <button
                    key={`kegiatan-${kegiatan.id}-${index}`}
                    onClick={() => handleKegiatanChange(kegiatan)}
                    className="w-full px-4 md:px-6 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-sm md:text-base">
                      {kegiatan.nama}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500">
                      {kegiatan.jenisRangkaian === "single" ? "Single Event" : "Multiple Events"} •
                      {(kegiatan.divisi || []).includes("Semua") ? " Semua Divisi" : ` ${(kegiatan.divisi || []).length} Divisi`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Day Dropdown - Only show for multiple events */}
          {!isSingleEvent() && (
            <div className="relative">
              <button
                onClick={() => setShowDayDropdown(!showDayDropdown)}
                disabled={!selectedKegiatanId}
                className="w-full bg-[#4891A1] text-white px-4 md:px-6 py-3 md:py-4 rounded-lg flex items-center justify-between font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base hover:bg-[#35707e] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span className="truncate">{selectedDay || "Pilih Hari"}</span>
                </div>
                <ChevronDown size={20} className="flex-shrink-0" />
              </button>
              
              {showDayDropdown && selectedKegiatanId && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {getDayOptions().map((day, index) => (
                    <button
                      key={`day-${day.id}-${index}`}
                      onClick={() => handleDayChange(day)}
                      className="w-full px-4 md:px-6 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-sm md:text-base">
                        {day.nama}
                      </div>
                      {day.tanggal && (
                        <div className="text-xs md:text-sm text-gray-500">
                          {formatDate(day.tanggal)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Kegiatan Info Card */}
          <div className="bg-white rounded-lg p-4 md:p-6 border-l-4 border-[#4891A1] hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 text-gray-600 mb-2 text-sm md:text-base">
              <Calendar size={16} />
              {kegiatanInfo.nama}
            </div>
            <div className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
              {isSingleEvent() ? "Single Event" : kegiatanInfo.hari}
            </div>
            {kegiatanInfo.tanggal && (
              <div className="text-xs md:text-sm text-gray-500">
                {kegiatanInfo.tanggal}
              </div>
            )}
            <div className="text-xs text-[#4891A1] mt-2">
              {(kegiatanInfo.divisiList || []).includes("Semua")
                ? "Semua Divisi Terlibat"
                : `${kegiatanInfo.divisiCount} Divisi Terlibat`}
            </div>
          </div>

          {/* Hadir Card */}
          <div className="bg-white rounded-lg p-4 md:p-6 border-l-4 border-[#4891A1] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                <CheckCircle size={16} />
                Hadir
              </div>
              <div className="w-6 h-6 bg-[#e0f2f7] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#4891A1] rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 transition-all duration-300">
              {stats.hadir}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-[#4891A1] h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stats.hadirPercentage}%` }}
              ></div>
            </div>
            <div className="text-[#4891A1] text-sm">{stats.hadirPercentage}%</div>
          </div>

          {/* Tidak Hadir Card */}
          <div className="bg-white rounded-lg p-4 md:p-6 border-l-4 border-[#4891A1] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                <XCircle size={16} />
                Tidak Hadir
              </div>
              <div className="w-6 h-6 bg-[#e0f2f7] rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-[#4891A1] rounded-full"></div>
              </div>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 transition-all duration-300">
              {stats.tidakHadir}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-[#4891A1] h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${stats.tidakHadirPercentage}%` }}
              ></div>
            </div>
            <div className="text-[#4891A1] text-sm">{stats.tidakHadirPercentage}%</div>
          </div>
        </div>

        {/* Main Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="bg-[#4891A1] text-white p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white bg-opacity-20 rounded flex items-center justify-center">
                  <Users size={16} />
                </div>
                <span className="font-medium text-sm md:text-base">
                  Data Absensi ({stats.total})
                </span>
                {isLoading && (
                  <div className="animate-pulse bg-white bg-opacity-20 rounded px-2 py-1 text-xs">
                    Loading...
                  </div>
                )}
              </div>
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 w-full md:w-auto">
                {/* Search Input */}
                <div className="relative order-1 md:order-2">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Cari Nama, NIM, Divisi"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {showDebug && (
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                      Debug
                    </th>
                  )}
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                    NIM
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                    Nama
                  </th>
                  <th
                    className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-700 hidden md:table-cell cursor-pointer select-none"
                    onClick={() => handleSort('divisi')}
                  >
                    <span className="flex items-center gap-1">
                      Divisi
                      {sortConfig?.key === 'divisi' && (
                        sortConfig.direction === 'asc' ? (
                          <span>&#8595;</span>
                        ) : (
                          <span>&#8593;</span>
                        )
                      )}
                    </span>
                  </th>
                  <th
                    className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-700 cursor-pointer select-none"
                    onClick={() => handleSort('kehadiran')}
                  >
                    <span className="flex items-center gap-1">
                      Status
                      {sortConfig?.key === 'kehadiran' && (
                        sortConfig.direction === 'asc' ? (
                          <span>&#8595;</span>
                        ) : (
                          <span>&#8593;</span>
                        )
                      )}
                    </span>
                  </th>
                  <th
                    className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-700 hidden md:table-cell cursor-pointer select-none"
                    onClick={() => handleSort('waktu_hadir')}
                  >
                    <span className="flex items-center gap-1">
                      Waktu Hadir
                      {sortConfig?.key === 'waktu_hadir' && (
                        sortConfig.direction === 'asc' ? (
                          <span>&#8595;</span>
                        ) : (
                          <span>&#8593;</span>
                        )
                      )}
                    </span>
                  </th>
                  <th
                    className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-700 hidden md:table-cell cursor-pointer select-none"
                    onClick={() => handleSort('metode_absensi')}
                  >
                    <span className="flex items-center gap-1">
                      Metode
                      {sortConfig?.key === 'metode_absensi' && (
                        sortConfig.direction === 'asc' ? (
                          <span>&#8595;</span>
                        ) : (
                          <span>&#8593;</span>
                        )
                      )}
                    </span>
                  </th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-medium text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={showDebug ? 8 : 7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 text-sm">Memuat data...</p>
                      </div>
                    </td>
                  </tr>
                ) : !selectedKegiatanId || !selectedDate ? (
                  <tr>
                    <td colSpan={showDebug ? 8 : 7} className="px-6 py-12 text-center text-gray-600 text-sm">
                      Pilih kegiatan dan tanggal terlebih dahulu
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan={showDebug ? 8 : 7} className="px-6 py-12 text-center text-gray-600 text-sm">
                      {filteredPanitiaData.length === 0
                        ? "Tidak ada panitia yang berhak mengikuti kegiatan ini."
                        : "Tidak ada data yang ditemukan dengan pencarian tersebut."}
                    </td>
                  </tr>
                ) : (
                  currentData.map((panitia, tableRowIndex) => {
                    const uniqueKey = `table-row-${panitia.panitia_id}-${currentPage}-${tableRowIndex}-${refreshKey}`;
                    
                    return (
                      <tr
                        key={uniqueKey}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {showDebug && (
                          <td className="px-3 py-2 text-xs text-gray-500">
                            <div className="space-y-1">
                              <div>UI: {tableRowIndex}</div>
                              <div>ID: {panitia.id}</div>
                              <div>PID: {panitia.panitia_id}</div>
                              <div>API: {panitia._apiIndex}</div>
                            </div>
                          </td>
                        )}
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-mono text-gray-600">
                          {panitia.nim}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900">
                          <div className="font-medium">{panitia.nama_lengkap}</div>
                          <div className="text-xs text-gray-500 md:hidden">
                            {panitia.divisi}
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">
                          {panitia.divisi}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                              panitia.kehadiran === "Hadir"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            <div
                              className={`w-2 h-2 rounded-full mr-1 ${
                                panitia.kehadiran === "Hadir" ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            {panitia.kehadiran}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">
                          <span className={`${panitia.waktu_hadir !== '-' ? 'font-medium text-gray-900' : ''}`}>
                            {panitia.waktu_hadir}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 hidden md:table-cell">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              panitia.metode_absensi === "QR Code"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {panitia.metode_absensi}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <button
                            onClick={() => handleEdit(panitia)}
                            className="text-amber-600 hover:text-amber-800 transition-all duration-200 p-2 rounded hover:bg-amber-50 active:scale-95"
                            title={`Edit Presensi - ${panitia.nama_lengkap} (NIM: ${panitia.nim})`}
                          >
                            <Edit size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer - Pagination */}
          <div className="flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-gray-50 border-t gap-4">
            <div className="text-gray-600 text-xs md:text-sm text-center md:text-left">
              Showing {stats.total > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(endIndex, stats.total)} of {stats.total} entries
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2 md:px-3 py-1 md:py-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="hidden md:flex items-center gap-2">
                  {renderPaginationButtons().map((buttonObj) => (
                    <button
                      key={buttonObj.key}
                      onClick={() =>
                        typeof buttonObj.value === "number" && setCurrentPage(buttonObj.value)
                      }
                      className={`px-3 py-2 rounded transition-colors ${
                        buttonObj.value === currentPage
                          ? "bg-teal-600 text-white"
                          : buttonObj.value.toString().includes("...")
                          ? "text-gray-400 cursor-default"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      disabled={buttonObj.value.toString().includes("...")}
                    >
                      {buttonObj.value.toString().replace("start", "").replace("end", "")}
                    </button>
                  ))}
                </div>
                
                <div className="flex md:hidden items-center gap-2">
                  <span className="text-xs text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>
                
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2 md:px-3 py-1 md:py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating QR Button */}
      <button
        onClick={handleQRScan}
        disabled={!selectedKegiatanId || !selectedDate}
        className="fixed bottom-6 right-6 bg-[#4891A1] text-white p-4 rounded-full shadow-lg hover:bg-[#35707e] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-50 hover:scale-110 active:scale-95"
        title="Scan QR Code"
      >
        <QrCode size={24} />
      </button>
    </div>
  );
}

// Main Exported Component with Access Control
export default function DashboardKestari() {
  return (
    <KestariAccessWrapper>
      <DashboardKestariContent />
    </KestariAccessWrapper>
  );
}