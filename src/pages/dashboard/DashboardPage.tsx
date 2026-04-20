import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, FileQuestion, FileSignature, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Selamat datang, {user.name}!</h1>
          <p className="text-slate-500 mt-1">Anda login sebagai <span className="font-semibold capitalize text-red-600">{user.role}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Render widgets based on role */}
        {user.role === 'admin' && (
          <>
            <StatCard title="Total Siswa" value="120" icon={Users} color="bg-blue-50 text-blue-600" />
            <StatCard title="Total Guru" value="15" icon={Users} color="bg-emerald-50 text-emerald-600" />
            <StatCard title="Soal di Bank" value="450" icon={FileQuestion} color="bg-purple-50 text-purple-600" />
            <StatCard title="Ujian Aktif" value="3" icon={FileSignature} color="bg-red-50 text-red-600" />
          </>
        )}
        
        {user.role === 'guru' && (
          <>
            <StatCard title="Soal Saya" value="45" icon={FileQuestion} color="bg-blue-50 text-blue-600" />
            <StatCard title="Ujian Dibuat" value="5" icon={FileSignature} color="bg-purple-50 text-purple-600" />
            <StatCard title="Hasil Ujian" value="120" icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
          </>
        )}
        
        {user.role === 'siswa' && (
          <>
            <StatCard title="Ujian Tersedia" value="2" icon={FileSignature} color="bg-red-50 text-red-600" />
            <StatCard title="Ujian Selesai" value="10" icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
          </>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mt-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Informasi Penting</h2>
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="font-semibold text-slate-800">Jadwal Penilaian Akhir Semester</h3>
            <p className="text-sm text-slate-600 mt-1">Pelaksanaan PAS akan dimulai pada 15 Juni 2026. Harap persiapkan diri Anda.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <h3 className="font-semibold text-slate-800">Pembaruan Sistem CBT</h3>
            <p className="text-sm text-slate-600 mt-1">Sistem CBT SMK Prima Unggul versi terbaru telah rilis dengan stabilitas yang lebih baik.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-4 rounded-full ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
