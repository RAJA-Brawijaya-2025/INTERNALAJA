'use client';
import React from 'react';
import { CheckCircle, X, HelpCircle } from 'lucide-react';

//Popup Perubahan Berhasil Disimpan
export const PopupPerubahanBerhasilDisimpan = ({ onClose, onKembali }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-lg">
        <div 
          className="relative bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200 rounded-3xl h-96 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(194, 218, 223, 1) 0%, rgba(224, 236, 239, 1) 20%, rgba(224, 236, 239, 1) 80%, rgba(194, 218, 223, 1) 100%)',
            boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
          }}
        >
          {/* background batik */}
          <div className="absolute -left-28 top-0 flex items-center gap-2 w-full h-full opacity-50">
            <img src="/assets/batik1.svg" alt="batik pattern 1" className="w-96 h-full object-cover" />
            <img src="/assets/batik2.svg" alt="batik pattern 2" className="w-96 h-full object-cover" />
          </div>
          
          {/* Content container */}
          <div className="relative z-10 p-10 flex flex-col gap-9">
            {/* white card isi pesan */}
            <div 
              className="bg-white rounded-lg p-3 flex flex-col items-center gap-3 h-56"
              style={{
                boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
              }}
            >
              {/* Status icon */}
              <div className="w-36 h-36 flex items-center justify-center">
                <img src="/assets/berhasil.svg" alt="berhasil icon" className="w-full h-full object-contain" />
              </div>
              
              {/* Confirmation text */}
              <h2 
                className="text-slate-800 text-xl font-normal text-center"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '20px',
                  lineHeight: '128%',
                  letterSpacing: '0.005em',
                  color: '#244850'
                }}
              >
                Perubahan Berhasil Disimpan
              </h2>
            </div>
            
            {/* Button */}
            <div className="flex gap-2">
              <button
                onClick={onKembali}
                className="flex-1 h-12 px-8 py-4 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(90deg, rgba(72, 145, 161, 1) 0%, rgba(102, 163, 176, 1) 100%)'
                }}
              >
                <span 
                  className="text-white font-semibold"
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '14px',
                    lineHeight: '128%',
                    letterSpacing: '0.005em',
                    fontWeight: 600
                  }}
                >
                  Kembali
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//Popup Kegiatan Gagal Dihapus
export const PopupKegiatanGagalDihapus = ({ onClose, onKembali }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-lg">
        <div 
          className="relative bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200 rounded-3xl h-96 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(194, 218, 223, 1) 0%, rgba(224, 236, 239, 1) 20%, rgba(224, 236, 239, 1) 80%, rgba(194, 218, 223, 1) 100%)',
            boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
          }}
        >
          {/* background batik */}
          <div className="absolute -left-28 top-0 flex items-center gap-2 w-full h-full opacity-50">
            <img src="/assets/batik1.svg" alt="batik pattern 1" className="w-96 h-full object-cover" />
            <img src="/assets/batik2.svg" alt="batik pattern 2" className="w-96 h-full object-cover" />
          </div>
          
          {/* Content container */}
          <div className="relative z-10 p-10 flex flex-col gap-9">
            {/* white card isi popup */}
            <div 
              className="bg-white rounded-lg p-3 flex flex-col items-center gap-3 h-56"
              style={{
                boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
              }}
            >
              {/* Status icon */}
              <div className="w-36 h-36 flex items-center justify-center">
                <img src="/assets/gagal.svg" alt="gagal icon" className="w-full h-full object-contain" />
              </div>
              
              {/* Confirmation text */}
              <h2 
                className="text-slate-800 text-xl font-normal text-center"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '20px',
                  lineHeight: '128%',
                  letterSpacing: '0.005em',
                  color: '#244850'
                }}
              >
                Kegiatan Gagal Dihapus
              </h2>
            </div>
            
            {/* Button */}
            <div className="flex gap-2">
              <button
                onClick={onKembali}
                className="flex-1 h-12 px-8 py-4 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(90deg, rgba(72, 145, 161, 1) 0%, rgba(102, 163, 176, 1) 100%)'
                }}
              >
                <span 
                  className="text-white font-semibold"
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '14px',
                    lineHeight: '128%',
                    letterSpacing: '0.005em',
                    fontWeight: 600
                  }}
                >
                  Kembali
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//Popup Konfirmasi Hapus Kegiatan
export const PopupKonfirmasiHapusKegiatan = ({ onClose, onKembali, onHapus }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-lg">
        <div 
          className="relative bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200 rounded-3xl h-96 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(194, 218, 223, 1) 0%, rgba(224, 236, 239, 1) 20%, rgba(224, 236, 239, 1) 80%, rgba(194, 218, 223, 1) 100%)',
            boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
          }}
        >
          {/* background batik */}
          <div className="absolute -left-28 top-0 flex items-center gap-2 w-full h-full opacity-50">
            <img src="/assets/batik1.svg" alt="batik pattern 1" className="w-96 h-full object-cover" />
            <img src="/assets/batik2.svg" alt="batik pattern 2" className="w-96 h-full object-cover" />
          </div>
          
          {/* Content container */}
          <div className="relative z-10 p-10 flex flex-col gap-9">
            {/* white card isi popup */}
            <div 
              className="bg-white rounded-lg p-3 flex flex-col items-center gap-3 h-56"
              style={{
                boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
              }}
            >
              {/* Status icon */}
              <div className="w-36 h-36 flex items-center justify-center">
                <img src="/assets/status1.svg" alt="status icon" className="w-full h-full object-contain" />
              </div>
              
              {/* Confirmation text */}
              <h2 
                className="text-slate-800 text-xl font-normal text-center"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '20px',
                  lineHeight: '128%',
                  letterSpacing: '0.005em',
                  color: '#244850'
                }}
              >
                Yakin untuk Hapus Kegiatan?
              </h2>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onKembali}
                className="flex-1 h-12 px-8 py-4 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(90deg, rgba(72, 145, 161, 1) 0%, rgba(102, 163, 176, 1) 100%)'
                }}
              >
                <span 
                  className="text-white font-semibold"
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '14px',
                    lineHeight: '128%',
                    letterSpacing: '0.005em',
                    fontWeight: 600
                  }}
                >
                  Kembali
                </span>
              </button>
              
              <button
                onClick={onHapus}
                className="flex-1 h-12 px-8 py-4 bg-white rounded-lg border border-teal-700 flex items-center justify-center transition-all duration-200 hover:bg-gray-50"
              >
                <span 
                  className="font-semibold"
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '14px',
                    lineHeight: '128%',
                    letterSpacing: '0.005em',
                    fontWeight: 600,
                    color: '#3c7886'
                  }}
                >
                  Hapus
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//Popup Kegiatan Berhasil Ditambahkan
export const PopupKegiatanBerhasilDitambahkan = ({ onClose, onKembali }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-lg">
        <div 
          className="relative bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200 rounded-3xl h-96 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(194, 218, 223, 1) 0%, rgba(224, 236, 239, 1) 20%, rgba(224, 236, 239, 1) 80%, rgba(194, 218, 223, 1) 100%)',
            boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
          }}
        >
          {/* background batik */}
          <div className="absolute -left-28 top-0 flex items-center gap-2 w-full h-full opacity-50">
            <img src="/assets/batik1.svg" alt="batik pattern 1" className="w-96 h-full object-cover" />
            <img src="/assets/batik2.svg" alt="batik pattern 2" className="w-96 h-full object-cover" />
          </div>
          
          {/* Content container */}
          <div className="relative z-10 p-10 flex flex-col gap-9">
            {/* white card isi popup */}
            <div 
              className="bg-white rounded-lg p-3 flex flex-col items-center gap-3 h-56"
              style={{
                boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
              }}
            >
              {/* Status icon */}
              <div className="w-36 h-36 flex items-center justify-center">
                <img src="/assets/berhasil.svg" alt="berhasil icon" className="w-full h-full object-contain" />
              </div>
              
              {/* Confirmation text */}
              <h2 
                className="text-slate-800 text-xl font-normal text-center"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '20px',
                  lineHeight: '128%',
                  letterSpacing: '0.005em',
                  color: '#244850'
                }}
              >
                Kegiatan Berhasil Ditambahkan
              </h2>
            </div>
            
            {/* Button */}
            <div className="flex gap-2">
              <button
                onClick={onKembali}
                className="flex-1 h-12 px-8 py-4 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(90deg, rgba(72, 145, 161, 1) 0%, rgba(102, 163, 176, 1) 100%)'
                }}
              >
                <span 
                  className="text-white font-semibold"
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '14px',
                    lineHeight: '128%',
                    letterSpacing: '0.005em',
                    fontWeight: 600
                  }}
                >
                  Kembali
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

//Popup Kegiatan Berhasil Dihapus
export const PopupKegiatanBerhasilDihapus = ({ onClose, onKembali }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-lg">
        <div 
          className="relative bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200 rounded-3xl h-96 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(194, 218, 223, 1) 0%, rgba(224, 236, 239, 1) 20%, rgba(224, 236, 239, 1) 80%, rgba(194, 218, 223, 1) 100%)',
            boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
          }}
        >
          {/* Decorative background patterns */}
          <div className="absolute -left-28 top-0 flex items-center gap-2 w-full h-full opacity-50">
            <img src="/assets/batik1.svg" alt="batik pattern 1" className="w-96 h-full object-cover" />
            <img src="/assets/batik2.svg" alt="batik pattern 2" className="w-96 h-full object-cover" />
          </div>
          
          {/* Content container */}
          <div className="relative z-10 p-10 flex flex-col gap-9">
            {/* White card with icon and text */}
            <div 
              className="bg-white rounded-lg p-3 flex flex-col items-center gap-3 h-56"
              style={{
                boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)'
              }}
            >
              {/* Status icon */}
              <div className="w-36 h-36 flex items-center justify-center">
                <img src="/assets/berhasil.svg" alt="berhasil icon" className="w-full h-full object-contain" />
              </div>
              
              {/* Confirmation text */}
              <h2 
                className="text-slate-800 text-xl font-normal text-center"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontSize: '20px',
                  lineHeight: '128%',
                  letterSpacing: '0.005em',
                  color: '#244850'
                }}
              >
                Kegiatan Berhasil Dihapus
              </h2>
            </div>
            
            {/* Button */}
            <div className="flex gap-2">
              <button
                onClick={onKembali}
                className="flex-1 h-12 px-8 py-4 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(90deg, rgba(72, 145, 161, 1) 0%, rgba(102, 163, 176, 1) 100%)'
                }}
              >
                <span 
                  className="text-white font-semibold"
                  style={{
                    fontFamily: 'Sora, sans-serif',
                    fontSize: '14px',
                    lineHeight: '128%',
                    letterSpacing: '0.005em',
                    fontWeight: 600
                  }}
                >
                  Kembali
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo Component hanya untuk testing
const PopupDemo = () => {
  const [currentPopup, setCurrentPopup] = React.useState(null);

  const popups = [
    { id: 1, name: 'Perubahan Berhasil Disimpan', component: PopupPerubahanBerhasilDisimpan },
    { id: 2, name: 'Kegiatan Gagal Dihapus', component: PopupKegiatanGagalDihapus },
    { id: 3, name: 'Konfirmasi Hapus Kegiatan', component: PopupKonfirmasiHapusKegiatan },
    { id: 4, name: 'Kegiatan Berhasil Ditambahkan', component: PopupKegiatanBerhasilDitambahkan },
    { id: 5, name: 'Kegiatan Berhasil Dihapus', component: PopupKegiatanBerhasilDihapus }
  ];

  const renderPopup = () => {
    const popup = popups.find(p => p.id === currentPopup);
    if (!popup) return null;

    const PopupComponent = popup.component;
    return (
      <PopupComponent
        onClose={() => setCurrentPopup(null)}
        onKembali={() => setCurrentPopup(null)}
        onHapus={() => {
          console.log('Item dihapus');
          setCurrentPopup(null);
        }}
      />
    );
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Demo 5 Popup Components</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {popups.map(popup => (
          <button
            key={popup.id}
            onClick={() => setCurrentPopup(popup.id)}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border"
          >
            <h3 className="font-semibold text-gray-800">{popup.name}</h3>
          </button>
        ))}
      </div>
      {renderPopup()}
    </div>
  );
};

export default PopupDemo;