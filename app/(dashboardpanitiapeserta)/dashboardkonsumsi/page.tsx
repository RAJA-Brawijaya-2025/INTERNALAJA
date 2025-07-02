/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useKonsumsiAccessCheck } from "@/hooks/useKonsumsiAccess";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Download,
  Edit,
  AlertCircle,
  Coffee,
  Utensils,
  Users,
  CheckCircle,
  RefreshCw,
  Calendar,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Bug,
  Loader2,
  Shield,
} from "lucide-react";

interface KonsumsiData {
  id: number;
  panitia_id: number;
  nim: string;
  nama_lengkap: string;
  divisi: string;
  jenis_konsumsi: "konsumsi_1" | "konsumsi_2";
  jenis_display: string;
  status_pengambilan: "sudah_diambil" | "belum_diambil";
  status_display: string;
  waktu_pengambilan: string | null;
  waktu_display: string;
  tanggal_konsumsi: string;
  metode_konfirmasi: "QR Code" | "Manual" | "Barcode" | "NFC";
  petugas_konfirmasi: string;
  kegiatan_nama: string;
  rangkaian_nama: string | null;
  catatan?: string;
}

interface KegiatanData {
  id: number;
  nama: string;
  deskripsi?: string;
  jenisRangkaian: "single" | "multiple";
  tanggalRaw?: string;
  divisi?: string[];
  subKegiatan?: Array<{
    id: number;
    nama: string;
    tanggalRaw: string;
    tanggalFormatted: string;
  }>;
}

interface DayOption {
  id: number;
  nama: string;
  tanggal: string;
}

interface Statistics {
  konsumsi_1: {
    total: number;
    sudah_diambil: number;
    belum_diambil: number;
    persentase: number;
  };
  konsumsi_2: {
    total: number;
    sudah_diambil: number;
    belum_diambil: number;
    persentase: number;
  };
}

export default function DashboardKonsumsi() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Access control untuk cek divisi user - menggunakan hook yang sama seperti kestari
  const { panitiaData } = useKonsumsiAccessCheck();

  // State untuk konsumsi
  const [selectedKegiatan, setSelectedKegiatan] = useState("");
  const [selectedKegiatanId, setSelectedKegiatanId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedRangkaianId, setSelectedRangkaianId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [showKegiatanDropdown, setShowKegiatanDropdown] = useState(false);
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("konsumsi_1");
  const [activeCardFilter, setActiveCardFilter] = useState("semua");
  const [kegiatanList, setKegiatanList] = useState<KegiatanData[]>([]);
  const [allKonsumsiData, setAllKonsumsiData] = useState<KonsumsiData[]>([]);
  const [filteredKonsumsiData, setFilteredKonsumsiData] = useState<KonsumsiData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [stats, setStats] = useState<Statistics>({
    konsumsi_1: { total: 0, sudah_diambil: 0, belum_diambil: 0, persentase: 0 },
    konsumsi_2: { total: 0, sudah_diambil: 0, belum_diambil: 0, persentase: 0 },
  });
  const [meta, setMeta] = useState({
    total_panitia_eligible: 0,
    divisi_included: [] as string[],
    is_semua_divisi: false,
  });
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // == FUNGSI KONSUMSI == //

  const isSingleEvent = () => {
    const kegiatan = getCurrentKegiatan();
    return kegiatan?.jenisRangkaian === "single";
  };

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

  const restoreStateFromURL = useCallback(() => {
    const urlKegiatanId = searchParams.get("kegiatanId");
    const urlKegiatanNama = searchParams.get("kegiatanNama");
    const urlDayName = searchParams.get("dayName");
    const urlRangkaianId = searchParams.get("rangkaianId");
    const urlDate = searchParams.get("date");

    return {
      kegiatanId: urlKegiatanId ? parseInt(urlKegiatanId) : null,
      kegiatanNama: urlKegiatanNama ? decodeURIComponent(urlKegiatanNama) : "",
      dayName: urlDayName ? decodeURIComponent(urlDayName) : "",
      rangkaianId:
        urlRangkaianId && urlRangkaianId !== "null"
          ? parseInt(urlRangkaianId)
          : null,
      date: urlDate ? decodeURIComponent(urlDate) : "",
    };
  }, [searchParams]);

  const groupedData = Object.values(
    filteredKonsumsiData.reduce(
      (acc: Record<number, any>, item: KonsumsiData) => {
        if (!acc[item.panitia_id]) {
          acc[item.panitia_id] = {
            panitia_id: item.panitia_id,
            nim: item.nim,
            nama_lengkap: item.nama_lengkap,
            divisi: item.divisi,
            konsumsi_1: null,
            konsumsi_2: null,
          };
        }
        if (item.jenis_konsumsi === "konsumsi_1") {
          acc[item.panitia_id].konsumsi_1 = item;
        } else {
          acc[item.panitia_id].konsumsi_2 = item;
        }
        return acc;
      },
      {} as Record<number, any>
    )
  );

  const handleSort = (key: string) => {
    if (key === "nim") return;
    setSortConfig((prev) => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const sortedGroups = [...groupedData];
  if (sortConfig) {
    sortedGroups.sort((a, b) => {
      if (sortConfig.key === "konsumsi_1" || sortConfig.key === "konsumsi_2") {
        const statusA = a[sortConfig.key]?.status_pengambilan || "";
        const statusB = b[sortConfig.key]?.status_pengambilan || "";
        if (statusA !== statusB) {
          if (sortConfig.direction === "asc") {
            return statusA === "sudah_diambil" ? -1 : 1;
          } else {
            return statusA === "sudah_diambil" ? 1 : -1;
          }
        }
        return a.nama_lengkap.localeCompare(b.nama_lengkap);
      }
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }

  const entriesPerPage = 20;

  const normalizeDate = (raw: string) => {
    const d = new Date(raw);
    if (isNaN(d.getTime())) {
      return raw.split("T")[0];
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  useEffect(() => {
    if (selectedKegiatanId && selectedDate) fetchKonsumsiData();
    else {
      setAllKonsumsiData([]);
      setFilteredKonsumsiData([]);
      resetStats();
    }
  }, [selectedKegiatanId, selectedRangkaianId, selectedDate, refreshKey]);

  useEffect(() => {
    const filtered = allKonsumsiData.filter((k) => {
      const searchMatch =
        !searchQuery ||
        k.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.nim.includes(searchQuery) ||
        k.divisi.toLowerCase().includes(searchQuery.toLowerCase());
      return searchMatch;
    });
    setFilteredKonsumsiData(filtered);
    setCurrentPage(1);
  }, [searchQuery, allKonsumsiData]);

  useEffect(() => {
    if (selectedKegiatanId && selectedDate) {
      const i = setInterval(() => fetchKonsumsiData(true), 30000);
      return () => clearInterval(i);
    }
  }, [selectedKegiatanId, selectedDate]);

  useEffect(() => {
    const editSuccess = searchParams.get("edit");
    const timestamp = searchParams.get("t");

    if (editSuccess === "success") {

      if (selectedKegiatanId && selectedDate) {
        setTimeout(() => {
          setRefreshKey((prev) => prev + 1);
          fetchKonsumsiData(true);
        }, 100);
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("edit");
      url.searchParams.delete("t");
      window.history.replaceState({}, "", url.toString());

      setTimeout(() => {
        showSuccessNotification();
      }, 500);
    }
  }, [searchParams, selectedKegiatanId, selectedDate]);

  const showSuccessNotification = () => {
    const notification = document.createElement("div");
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
        Data konsumsi berhasil diperbarui!
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
        notification.style.animation = "slideIn 0.3s ease-out reverse";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  };

  const resetStats = () => {
    setStats({
      konsumsi_1: {
        total: 0,
        sudah_diambil: 0,
        belum_diambil: 0,
        persentase: 0,
      },
      konsumsi_2: {
        total: 0,
        sudah_diambil: 0,
        belum_diambil: 0,
        persentase: 0,
      },
    });
    setMeta({
      total_panitia_eligible: 0,
      divisi_included: [],
      is_semua_divisi: false,
    });
  };

  const fetchKegiatan = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/panitiapeserta/kegiatan?limit=100");
      const j = await res.json();
      if (j.success && j.data.length) {
        setKegiatanList(j.data);

        const urlState = restoreStateFromURL();

        if (urlState.kegiatanId && urlState.kegiatanNama) {
          const kegiatan = j.data.find(
            (k: KegiatanData) => k.id === urlState.kegiatanId
          );

          if (kegiatan) {
            setSelectedKegiatan(urlState.kegiatanNama);
            setSelectedKegiatanId(urlState.kegiatanId);
            setSelectedDay(urlState.dayName);
            setSelectedRangkaianId(urlState.rangkaianId);
            setSelectedDate(urlState.date);

            setIsLoading(false);
            return;
          }
        }

        const k = j.data[0];
        setSelectedKegiatan(k.nama);
        setSelectedKegiatanId(k.id);

        let dayName = "";
        let rangkaianId = null;
        let date = "";

        if (k.jenisRangkaian === "single") {
          dayName = "Hari Kegiatan";
          date = normalizeDate(k.tanggalRaw!);
        } else {
          const s = k.subKegiatan![0];
          dayName = s.nama;
          rangkaianId = s.id;
          date = normalizeDate(s.tanggalRaw);
        }

        setSelectedDay(dayName);
        setSelectedRangkaianId(rangkaianId);
        setSelectedDate(date);

        updateURLParams({
          kegiatanId: k.id.toString(),
          kegiatanNama: encodeURIComponent(k.nama),
          dayName: encodeURIComponent(dayName),
          rangkaianId: rangkaianId ? rangkaianId.toString() : "null",
          date: encodeURIComponent(date),
        });
      } else {
        setError("Tidak ada kegiatan");
      }
    } catch {
      setError("Gagal memuat kegiatan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchKonsumsiData = async (silent = false) => {
    if (!selectedKegiatanId || !selectedDate) return;
    if (!silent) {
      setIsLoading(true);
      setError("");
    } else setIsRefreshing(true);
    try {
      const dateOnly = selectedDate;
      const params = new URLSearchParams({
        kegiatan_id: selectedKegiatanId.toString(),
        tanggal: dateOnly,
        limit: "1000",
        _t: Date.now().toString(),
        _refresh: silent ? "true" : "false",
      });
      params.append(
        "kegiatan_rangkaian_id",
        selectedRangkaianId ? selectedRangkaianId.toString() : "null"
      );
      const res = await fetch(`/api/konsumsi?${params}`);
      const j = await res.json();
      if (j.success) {
        setAllKonsumsiData(j.data || []);
        setStats(j.statistics || stats);
        setMeta(j.meta || meta);
        setLastRefresh(new Date());
      } else {
        if (!silent) {
          setError(j.message || "Gagal memuat konsumsi");
          setAllKonsumsiData([]);
        }
      }
    } catch {
      if (!silent) {
        setError("Gagal memuat konsumsi");
        setAllKonsumsiData([]);
      }
    } finally {
      if (!silent) setIsLoading(false);
      else setIsRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    if (selectedKegiatanId && selectedDate) {
      setRefreshKey((prev) => prev + 1);
      await fetchKonsumsiData(true);
    }
  };

  const getCurrentKegiatan = () =>
    kegiatanList.find((k) => k.id === selectedKegiatanId);

  const getDayOptions = (kegiatan?: KegiatanData): DayOption[] => {
    const k = kegiatan || getCurrentKegiatan();
    if (!k) return [];
    if (k.jenisRangkaian === "single") {
      return [
        {
          id: k.id,
          nama: "Hari Kegiatan",
          tanggal: normalizeDate(k.tanggalRaw!),
        },
      ];
    }
    return (
      k.subKegiatan?.map((s) => ({
        id: s.id,
        nama: s.nama,
        tanggal: normalizeDate(s.tanggalRaw),
      })) || []
    );
  };

  const currentStats =
    activeCardFilter === "semua"
      ? {
          total: stats.konsumsi_1.total + stats.konsumsi_2.total,
          sudah_diambil:
            stats.konsumsi_1.sudah_diambil + stats.konsumsi_2.sudah_diambil,
          belum_diambil:
            stats.konsumsi_1.belum_diambil + stats.konsumsi_2.belum_diambil,
          persentase:
            stats.konsumsi_1.total + stats.konsumsi_2.total
              ? Math.round(
                  ((stats.konsumsi_1.sudah_diambil +
                    stats.konsumsi_2.sudah_diambil) /
                    (stats.konsumsi_1.total + stats.konsumsi_2.total)) *
                    100
                )
              : 0,
        }
      : stats[activeCardFilter as keyof typeof stats];

  const sudahPct = currentStats.persentase;
  const belumPct = 100 - sudahPct;

  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const totalPages = Math.ceil(filteredKonsumsiData.length / entriesPerPage);

  const handleKegiatanChange = (k: KegiatanData) => {
    setSelectedKegiatan(k.nama);
    setSelectedKegiatanId(k.id);
    setShowKegiatanDropdown(false);

    let dayName = "";
    let rangkaianId = null;
    let date = "";

    if (k.jenisRangkaian === "single") {
      dayName = "Hari Kegiatan";
      date = normalizeDate(k.tanggalRaw!);
    } else {
      const days = getDayOptions(k);
      if (days.length) {
        dayName = days[0].nama;
        date = days[0].tanggal;
        rangkaianId = days[0].id;
      }
    }

    setSelectedDay(dayName);
    setSelectedDate(date);
    setSelectedRangkaianId(rangkaianId);

    updateURLParams({
      kegiatanId: k.id.toString(),
      kegiatanNama: encodeURIComponent(k.nama),
      dayName: encodeURIComponent(dayName),
      rangkaianId: rangkaianId ? rangkaianId.toString() : "null",
      date: encodeURIComponent(date),
    });

    setCurrentPage(1);
    setError("");
    setRefreshKey((prev) => prev + 1);
  };

  const handleDayChange = (d: DayOption) => {
    const k = getCurrentKegiatan();
    const newRangkaianId = k?.jenisRangkaian === "single" ? null : d.id;

    setSelectedDay(d.nama);
    setSelectedDate(d.tanggal);
    setSelectedRangkaianId(newRangkaianId);
    setShowDayDropdown(false);

    updateURLParams({
      kegiatanId: selectedKegiatanId?.toString() || "",
      kegiatanNama: encodeURIComponent(selectedKegiatan),
      dayName: encodeURIComponent(d.nama),
      rangkaianId: newRangkaianId ? newRangkaianId.toString() : "null",
      date: encodeURIComponent(d.tanggal),
    });

    setCurrentPage(1);
    setError("");
    setRefreshKey((prev) => prev + 1);
  };

  const handleDownload = () => {
    const k = getCurrentKegiatan();
    const csv = [
      [
        "NIM",
        "Nama",
        "Divisi",
        "Jenis",
        "Status",
        "Waktu",
        "Tanggal",
        "Metode",
      ],
      ...filteredKonsumsiData.map((x) => [
        x.nim,
        x.nama_lengkap,
        x.divisi,
        x.jenis_display,
        x.status_display,
        x.waktu_display,
        x.tanggal_konsumsi,
        x.metode_konfirmasi,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `konsumsi_${k?.nama}_${selectedDay}_${selectedDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleScanQR = () => {
    if (!selectedKegiatanId || !selectedDate) {
      setError("Pilih kegiatan dan tanggal terlebih dahulu");
      return;
    }

    const qrParams = new URLSearchParams({
      kegiatanId: selectedKegiatanId.toString(),
      kegiatanNama: selectedKegiatan,
      tanggal: selectedDate,
      tipe: "konsumsi",
      returnKegiatanId: selectedKegiatanId.toString(),
      returnKegiatanNama: encodeURIComponent(selectedKegiatan),
      returnDayName: encodeURIComponent(selectedDay),
      returnRangkaianId: selectedRangkaianId
        ? selectedRangkaianId.toString()
        : "null",
      returnDate: encodeURIComponent(selectedDate),
    });

    if (selectedRangkaianId) {
      qrParams.append("rangkaianId", selectedRangkaianId.toString());
      qrParams.append("rangkaianNama", selectedDay);
    }

    router.push(`/dashboardkonsumsi/qraja?${qrParams.toString()}`);
  };

  const handleEdit = (nim: string) => {
    const ctx = new URLSearchParams({
      kegiatan_id: selectedKegiatanId!.toString(),
      tanggal: selectedDate,
    });
    if (selectedRangkaianId) {
      ctx.append("kegiatan_rangkaian_id", selectedRangkaianId.toString());
    }
    router.push(`/dashboardkonsumsi/editpanitia/${nim}?${ctx.toString()}`);
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5;

    if (totalPages <= maxPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pageNumbers.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return (
      <div className="flex items-center space-x-1">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && setCurrentPage(page)}
            disabled={typeof page !== "number"}
            className={`px-3 py-2 text-sm border rounded-md ${
              page === currentPage
                ? "bg-[#4891A1] text-white border-[#4891A1]"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            } ${
              typeof page !== "number" ? "cursor-default" : "cursor-pointer"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // -- Tampilan Konsumsi Utama (Access Control sudah dihandle oleh Layout) -- //
  if (isLoading && !allKonsumsiData.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4891A1] mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Konsumsi Panitia
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Dashboard pemantauan pengambilan konsumsi Panitia Raja Brawijaya 2025
            </p>
            {/* Indicator Divisi User */}
            {panitiaData && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs bg-orange-50 text-orange-800 px-2 py-1 rounded-full font-medium">
                  {panitiaData.divisi_nama}
                </span>
                {panitiaData.divisi_id === 11 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                    Download Access
                  </span>
                )}
              </div>
            )}
            {isRefreshing && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-sm text-[#4891A1] bg-blue-50 px-2 py-1 rounded-full">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Auto-refresh aktif</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Debug Toggle - Uncommented for access verification */}
            {/* <button
              onClick={() => setShowDebug(!showDebug)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                showDebug 
                  ? 'bg-orange-50 text-orange-800 border border-orange-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
              title="Toggle debug mode untuk cek access download"
            >
              <Bug size={16} />
              Debug {showDebug ? 'ON' : 'OFF'}
            </button> */}
            
            <button
              onClick={handleManualRefresh}
              disabled={!selectedKegiatanId || !selectedDate || isLoading}
              className={`flex items-center gap-2 bg-[#4891A1] text-white px-4 py-2 rounded-lg hover:bg-[#35707e] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm ${
                isRefreshing ? "animate-pulse" : ""
              }`}
            >
              <RefreshCw
                size={16}
                className={`${
                  isRefreshing ? "animate-spin" : ""
                } transition-transform duration-200`}
              />
              <span className="hidden sm:inline">
                {isRefreshing ? "Loading..." : "Refresh"}
              </span>
            </button>

            {/* Download Button - Hanya untuk PIT (divisi_id = 11) */}
            {panitiaData?.divisi_id === 11 && (
              <button
                onClick={handleDownload}
                disabled={!filteredKonsumsiData.length}
                className="flex items-center gap-2 w-full sm:w-auto justify-center bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download Data Konsumsi (Khusus PIT)"
              >
                <Download size={16} />
                <span className="hidden xs:inline">Download Data Konsumsi</span>
                <span className="inline xs:hidden">Download</span>
              </button>
            )}
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
              <Bug size={20} />
              Debug Information - Konsumsi
            </h3>
            <div className="text-sm text-orange-700 space-y-1">
              <p><strong>User Divisi ID:</strong> {panitiaData?.divisi_id || 'Not loaded'}</p>
              <p><strong>User Divisi Name:</strong> {panitiaData?.divisi_nama || 'Not loaded'}</p>
              <p><strong>Download Access:</strong> {panitiaData?.divisi_id === 11 ? 'Granted (PIT)' : 'Denied (Not PIT)'}</p>
              <hr className="my-2 border-orange-300" />
              <p>
                <strong>Selected Kegiatan ID:</strong> {selectedKegiatanId}
              </p>
              <p>
                <strong>Selected Kegiatan:</strong> {selectedKegiatan}
              </p>
              <p>
                <strong>Selected Day:</strong> {selectedDay}
              </p>
              <p>
                <strong>Selected Rangkaian ID:</strong> {selectedRangkaianId}
              </p>
              <p>
                <strong>Selected Date:</strong> {selectedDate}
              </p>
              <p>
                <strong>Is Single Event:</strong>{" "}
                {isSingleEvent() ? "Yes" : "No"}
              </p>
              <p>
                <strong>Total Records:</strong> {allKonsumsiData.length}
              </p>
              <p>
                <strong>Filtered Records:</strong> {filteredKonsumsiData.length}
              </p>
              <p>
                <strong>Current Page Data:</strong>{" "}
                {sortedGroups.slice(start, end).length}
              </p>
              <p>
                <strong>Page:</strong> {currentPage} of {totalPages}
              </p>
              <p>
                <strong>Refresh Key:</strong> {refreshKey}
              </p>
              <div className="mt-2 p-2 bg-white rounded text-xs">
                <strong>URL State:</strong>
                <pre>
                  {JSON.stringify(
                    {
                      kegiatanId: searchParams.get("kegiatanId"),
                      kegiatanNama: searchParams.get("kegiatanNama"),
                      dayName: searchParams.get("dayName"),
                      rangkaianId: searchParams.get("rangkaianId"),
                      date: searchParams.get("date"),
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Dropdowns */}
        <div
          className={`grid gap-4 mb-6 ${
            isSingleEvent() ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {/* Kegiatan Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowKegiatanDropdown(!showKegiatanDropdown)}
              className="w-full bg-[#4891A1] text-white px-4 py-3 rounded-lg flex justify-between items-center hover:bg-[#3d7a89] transition-colors"
            >
              {selectedKegiatan || "Pilih Kegiatan"}
              <ChevronDown size={16} />
            </button>
            {showKegiatanDropdown && (
              <div className="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto">
                {kegiatanList.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => handleKegiatanChange(k)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{k.nama}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Calendar size={12} />
                      {k.jenisRangkaian === "single"
                        ? "Single Event"
                        : "Multiple Events"}
                      {k.divisi && (
                        <>
                          •{" "}
                          {k.divisi.length > 3
                            ? `${k.divisi.length} Divisi`
                            : k.divisi.join(", ")}
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Day Dropdown */}
          {!isSingleEvent() && (
            <div className="relative">
              <button
                onClick={() => setShowDayDropdown(!showDayDropdown)}
                disabled={!selectedKegiatanId}
                className="w-full bg-[#4891A1] text-white px-4 py-3 rounded-lg flex justify-between items-center hover:bg-[#3d7a89] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectedDay || "Pilih Hari"}
                <ChevronDown size={16} />
              </button>
              {showDayDropdown && selectedKegiatanId && (
                <div className="absolute z-10 bg-white border border-gray-200 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {getDayOptions().map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleDayChange(d)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium">{d.nama}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <Calendar size={12} />
                        {fmtDate(d.tanggal)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Filter Buttons */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            {
              key: "konsumsi_1",
              label: "Konsumsi 1",
              icon: Coffee,
              color: "blue",
            },
            {
              key: "konsumsi_2",
              label: "Konsumsi 2",
              icon: Utensils,
              color: "orange",
            },
            {
              key: "semua",
              label: "Semua Konsumsi",
              icon: Users,
              color: "gray",
            },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveCardFilter(filter.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeCardFilter === filter.key
                  ? "bg-[#4891A1] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <filter.icon size={16} />
              {filter.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Info Kegiatan */}
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#4891A1]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedKegiatan || "-"}
                </div>
                <div className="text-xl font-semibold text-[#4891A1]">
                  {isSingleEvent() ? "Single Event" : selectedDay}
                </div>
                {selectedDate && (
                  <div className="text-sm text-gray-500 mt-1">
                    {fmtDate(selectedDate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Konsumsi 1 */}
          {(activeCardFilter === "konsumsi_1" ||
            activeCardFilter === "konsumsi_2" ||
            activeCardFilter === "semua") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Coffee size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Konsumsi 1</div>
                  <div className="text-sm font-medium text-gray-400">
                    Sudah Diambil
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-green-600">
                  {stats.konsumsi_1.sudah_diambil}
                </div>
                <div className="text-sm text-gray-500">
                  {stats.konsumsi_1.persentase}%
                </div>
              </div>
              <div className="text-lg font-medium text-red-600 mb-3">
                Belum diambil {stats.konsumsi_1.belum_diambil}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.konsumsi_1.persentase}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Card Konsumsi 2 */}
          {(activeCardFilter === "konsumsi_2" ||
            activeCardFilter === "semua") && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Utensils size={20} className="text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Konsumsi 2</div>
                  <div className="text-sm font-medium text-gray-400">
                    Sudah Diambil
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-green-600">
                  {stats.konsumsi_2.sudah_diambil}
                </div>
                <div className="text-sm text-gray-500">
                  {stats.konsumsi_2.persentase}%
                </div>
              </div>
              <div className="text-lg font-medium text-red-600 mb-3">
                Belum diambil {stats.konsumsi_2.belum_diambil}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.konsumsi_2.persentase}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Card Total Konsumsi */}
          {activeCardFilter === "semua" && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Users size={20} className="text-gray-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Konsumsi</div>
                  <div className="text-sm font-medium text-gray-400">
                    Sudah Diambil
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-green-600">
                  {currentStats.sudah_diambil}
                </div>
                <div className="text-sm text-gray-500">{sudahPct}%</div>
              </div>
              <div className="text-lg font-medium text-red-600 mb-3">
                Belum diambil {currentStats.belum_diambil}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${sudahPct}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm p-2 sm:p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap=4 w-full md:w-auto">
              {isRefreshing && (
                <RefreshCw size={16} className="text-[#4891A1] animate-spin" />
              )}
              <div className="relative w-full md:w-auto">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari Nama, NIM, Divisi"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4891A1] focus:border-transparent w-full md:w-64"
                />
              </div>
            </div>
          </div>

          {/* Data Header */}
          <div className="flex items-center gap-2">
            <Users size={20} className="text-[#4891A1]" />
            <span className="font-semibold text-gray-900 text-sm sm:text-base">
              Data Konsumsi ({meta.total_panitia_eligible})
            </span>
          </div>

          {/* Table Responsive */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIM
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("nama_lengkap")}
                  >
                    <span className="flex items-center gap-1">
                      Nama
                      {sortConfig?.key === "nama_lengkap" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronDown className="inline w-3 h-3" />
                        ) : (
                          <ChevronUp className="inline w-3 h-3" />
                        ))}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("divisi")}
                  >
                    <span className="flex items-center gap-1">
                      Divisi
                      {sortConfig?.key === "divisi" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronDown className="inline w-3 h=3" />
                        ) : (
                          <ChevronUp className="inline w=3 h-3" />
                        ))}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("konsumsi_1")}
                  >
                    <span className="flex items-center gap-1">
                      Konsumsi 1
                      {sortConfig?.key === "konsumsi_1" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronDown className="inline w-3 h-3" />
                        ) : (
                          <ChevronUp className="inline w-3 h-3" />
                        ))}
                    </span>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                    onClick={() => handleSort("konsumsi_2")}
                  >
                    <span className="flex items-center gap-1">
                      Konsumsi 2
                      {sortConfig?.key === "konsumsi_2" &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronDown className="inline w-3 h-3" />
                        ) : (
                          <ChevronUp className="inline w-3 h-3" />
                        ))}
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4891A1] mb-4"></div>
                        <p className="text-gray-500">Memuat data konsumsi...</p>
                      </div>
                    </td>
                  </tr>
                ) : sortedGroups.slice(start, end).length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {!selectedKegiatanId || !selectedDate
                        ? "Pilih kegiatan dan tanggal untuk melihat data konsumsi"
                        : searchQuery
                        ? "Tidak ada data yang sesuai dengan pencarian"
                        : "Belum ada data konsumsi"}
                    </td>
                  </tr>
                ) : (
                  sortedGroups.slice(start, end).map((group: any) => (
                    <tr key={group.panitia_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {group.nim}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {group.nama_lengkap}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {group.divisi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            group.konsumsi_1?.status_pengambilan ===
                            "sudah_diambil"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {group.konsumsi_1?.status_pengambilan ===
                          "sudah_diambil"
                            ? "Sudah"
                            : "Belum"
                          }{group.konsumsi_1?.waktu_display && ` (${group.konsumsi_1.waktu_display})`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            group.konsumsi_2?.status_pengambilan ===
                            "sudah_diambil"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {group.konsumsi_2?.status_pengambilan ===
                          "sudah_diambil"
                            ? "Sudah"
                            : "Belum"
                          }{group.konsumsi_2?.waktu_display && ` (${group.konsumsi_2.waktu_display})`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(group.nim)}
                          className="text-[#4891A1] hover:text-[#3d7a89] p-1 rounded"
                          title="Edit Konsumsi"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4">{totalPages > 1 && renderPagination()}</div>
        </div>
      </div>
      {/* Floating QR Scan Button */}
      <button
        onClick={handleScanQR}
        title="Scan QR Konsumsi"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#4891A1] text-white flex items-center justify-center shadow-lg hover:bg-[#35707e] focus:outline-none focus:ring-4 focus:ring-[#4891A1]/30 transition-all duration-200"
        style={{ boxShadow: "0 4px 24px 0 rgba(72,145,161,0.18)" }}
      >
        <QrCode size={32} />
      </button>
    </div>
  );
}