// PopupKonfirmasiLogout.tsx
import React from 'react';

interface PopupKonfirmasiLogoutProps {
  onClose: () => void;
  onLogout: () => void;
}

export const PopupKonfirmasiLogout = ({ onClose, onLogout }: PopupKonfirmasiLogoutProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-lg">
        <div
          className="relative bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200 rounded-3xl h-96 overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(194, 218, 223, 1) 0%, rgba(224, 236, 239, 1) 20%, rgba(224, 236, 239, 1) 80%, rgba(194, 218, 223, 1) 100%)',
            boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)',
          }}
        >
          {/* Background Batik */}
          <div className="absolute -left-28 top-0 flex items-center gap-2 w-full h-full opacity-50">
            <img src="/assets/batik1.svg" alt="batik pattern 1" className="w-96 h-full object-cover" />
            <img src="/assets/batik2.svg" alt="batik pattern 2" className="w-96 h-full object-cover" />
          </div>

          {/* Content Container */}
          <div className="relative z-10 p-10 flex flex-col gap-9">
            {/* White Card Isi Pop-Up */}
            <div
              className="bg-white rounded-lg p-3 flex flex-col items-center gap-3 h-56"
              style={{
                boxShadow: '0px 16px 32px -12px rgba(88, 92, 95, 0.1)',
              }}
            >
              {/* Status Icon */}
              <div className="w-36 h-36 flex items-center justify-center">
                <img src="/assets/status1.svg" alt="status icon" className="w-full h-full object-contain" />
              </div>

              {/* Confirmation Text */}
              <h2 className="text-slate-800 text-xl font-normal text-center">
                Yakin untuk Logout Sekarang?
              </h2>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 h-12 px-8 py-4 rounded-lg flex items-center justify-center transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(90deg, rgba(72, 145, 161, 1) 0%, rgba(102, 163, 176, 1) 100%)',
                }}
              >
                <span className="text-white font-semibold">Kembali</span>
              </button>

              <button
                onClick={onLogout}
                className="flex-1 h-12 px-8 py-4 bg-white rounded-lg border border-teal-700 flex items-center justify-center transition-all duration-200 hover:bg-gray-50"
              >
                <span className="font-semibold text-teal-700">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupKonfirmasiLogout;
