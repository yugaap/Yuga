import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BookOpen, MonitorPlay, PenTool, Calculator, Camera, Headset, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/app" replace />;
  }

  const majors = [
    { id: 'TKJ', name: 'Teknik Komputer dan Jaringan', icon: MonitorPlay },
    { id: 'DKV', name: 'Desain Komunikasi Visual', icon: PenTool },
    { id: 'AK', name: 'Akuntansi', icon: Calculator },
    { id: 'BC', name: 'Broadcasting', icon: Camera },
    { id: 'MPLB', name: 'Manajemen Perkantoran', icon: BookOpen },
    { id: 'BD', name: 'Bisnis Digital', icon: Headset },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <header className="w-full bg-white shadow-sm py-4 px-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-red-600 p-2 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <span className="font-bold text-xl text-slate-800">SMK Prima Unggul</span>
        </div>
        <Link 
          to="/login"
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          Login CBT
        </Link>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center text-center">
        <div className="max-w-3xl mt-12 mb-16 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Portal Ujian Online
            <span className="block text-red-600">SMK Prima Unggul</span>
          </h1>
          <p className="text-lg text-slate-600 pb-4">
            Platform Computer Based Test (CBT) modern terintegrasi untuk mendukung proses evaluasi belajar mengajar yang efektif, transparan, dan terpercaya.
          </p>
          <Link 
            to="/login"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium text-lg transition-colors shadow-lg shadow-red-600/30"
          >
            <span>Mulai Ujian Sekarang</span>
          </Link>
        </div>

        <div className="w-full mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Program Keahlian Kami</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {majors.map((major) => (
              <div key={major.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center hover:shadow-md transition-shadow">
                <div className="bg-red-50 p-4 rounded-full text-red-600 mb-4">
                  <major.icon size={28} />
                </div>
                <h3 className="font-semibold text-slate-800 text-center">{major.name}</h3>
                <span className="text-sm font-bold text-slate-400 mt-1">{major.id}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 grid sm:grid-cols-3 gap-8 w-full max-w-4xl text-left">
           <div className="flex flex-col items-start space-y-3 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
              <CheckCircle2 className="text-green-500" size={32} />
              <h3 className="font-bold text-slate-800">Cepat & Responsif</h3>
              <p className="text-sm text-slate-600">Aplikasi dirancang untuk bekerja dengan cepat, bahkan dengan ratusan siswa bersamaan.</p>
           </div>
           <div className="flex flex-col items-start space-y-3 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
              <CheckCircle2 className="text-green-500" size={32} />
              <h3 className="font-bold text-slate-800">Aman & Terpercaya</h3>
              <p className="text-sm text-slate-600">Terintegrasi dengan sistem cloud modern untuk menjamin keamanan data ujian.</p>
           </div>
           <div className="flex flex-col items-start space-y-3 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
              <CheckCircle2 className="text-green-500" size={32} />
              <h3 className="font-bold text-slate-800">Realtime Report</h3>
              <p className="text-sm text-slate-600">Hasil ujian dapat dilihat secara realtime oleh guru persis setelah siswa selesai.</p>
           </div>
        </div>
      </main>

      <footer className="w-full bg-slate-900 text-slate-400 py-8 text-center text-sm mt-auto">
        &copy; {new Date().getFullYear()} SMK Prima Unggul - Computer Based Test
      </footer>
    </div>
  );
}
