/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import DashboardPage from './pages/dashboard/DashboardPage';

import StudentExamsPage from './pages/siswa/ExamsPage';
import TakeExamPage from './pages/siswa/TakeExamPage';
import AdminUsersPage from './pages/admin/UsersPage';
import GuruQuestionsPage from './pages/guru/QuestionsPage';

// Placeholders for routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
    <h2 className="text-xl font-bold text-slate-800 mb-4">{title}</h2>
    <p className="text-slate-500">Halaman sedang dalam pengembangan.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            {/* Admin Routes */}
            <Route path="admin/users" element={<AdminUsersPage />} />
            <Route path="admin/questions" element={<Placeholder title="Manajemen Soal" />} />
            <Route path="admin/exams" element={<Placeholder title="Manajemen Ujian" />} />
            <Route path="admin/results" element={<Placeholder title="Rekap Hasil Ujian" />} />
            
            {/* Guru Routes */}
            <Route path="guru/questions" element={<GuruQuestionsPage />} />
            <Route path="guru/exams" element={<Placeholder title="Buat Ujian" />} />
            <Route path="guru/results" element={<Placeholder title="Hasil Ujian Siswa" />} />
            
            {/* Siswa Routes */}
            <Route path="siswa/exams" element={<StudentExamsPage />} />
            <Route path="siswa/take-exam/:id" element={<TakeExamPage />} />
            <Route path="siswa/results" element={<Placeholder title="Hasil Ujian Saya" />} />
            
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
