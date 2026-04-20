import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Trash2, Edit, FileSignature, CheckCircle2, XCircle } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  duration: number;
  is_active: boolean;
  created_at: string;
}

export default function ExamsManagementPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', duration: 60 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    if (!supabase) {
      setExams([
         { id: '1', title: 'Ujian Akhir Semester - Basis Data', duration: 120, is_active: true, created_at: new Date().toISOString() },
         { id: '2', title: 'Ujian Tengah Semester - Jaringan', duration: 90, is_active: false, created_at: new Date().toISOString() }
      ]);
      setLoading(false);
      return;
    }

    try {
      // Admin could potentially see all exams, guru only theirs. 
      // Based on our RLS, admin can update any, guru can update theirs.
      // For fetch, RLS allows everyone to view exams.
      let query = supabase.from('exams').select('*').order('created_at', { ascending: false });
      
      if (user?.role === 'guru') {
          query = query.eq('created_by', user.id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setExams(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
        alert('Mode Demo: Tidak dapat terhubung ke database. Formulir diabaikan.');
        setShowModal(false);
        return;
    }
    
    setSubmitting(true);
    try {
        const { error } = await supabase.from('exams').insert({
           title: newExam.title,
           duration: newExam.duration,
           created_by: user?.id,
           is_active: false
        });
        
        if (error) throw error;
        setShowModal(false);
        setNewExam({ title: '', duration: 60 });
        fetchExams();
    } catch (e: any) {
        alert('Gagal membuat ujian: ' + e.message);
    } finally {
        setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
     if (!supabase) {
        setExams(exams.map(ex => ex.id === id ? { ...ex, is_active: !currentStatus } : ex));
        return;
     }
     
     try {
        const { error } = await supabase.from('exams').update({ is_active: !currentStatus }).eq('id', id);
        if (error) throw error;
        fetchExams();
     } catch (e: any) {
        console.error(e);
        alert('Gagal merubah status ujian');
     }
  };

  const deleteExam = async (id: string) => {
     if (!window.confirm("Apakah Anda yakin ingin menghapus ujian ini? Semua data jawaban terkait akan ikut terhapus.")) return;
     if (!supabase) {
        setExams(exams.filter(ex => ex.id !== id));
        return;
     }

     try {
        const { error } = await supabase.from('exams').delete().eq('id', id);
        if (error) throw error;
        fetchExams();
     } catch (e: any) {
        console.error(e);
        alert('Gagal menghapus ujian');
     }
  };

  return (
    <div className="space-y-6 mx-auto w-full max-w-[1200px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 leading-tight">Manajemen Ujian</h1>
          <p className="text-gray-500 mt-1 text-[14px]">Buat ujian baru, atur durasi, dan kelola status aktif ujian.</p>
        </div>
        <button 
           onClick={() => setShowModal(true)}
           className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-[8px] font-semibold transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Buat Ujian Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden text-[14px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[12px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Nama Ujian</th>
                <th className="px-6 py-4">Durasi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">Tidak ada ujian yang ditemukan. Silakan buat baru.</td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="font-semibold text-gray-900">{exam.title}</div>
                       <div className="text-[12px] text-gray-400 mt-0.5">ID: {exam.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 font-medium">{exam.duration} Menit</td>
                    <td className="px-6 py-4">
                       <button
                         onClick={() => toggleActive(exam.id, exam.is_active)}
                         className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                            exam.is_active 
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                         }`}
                       >
                          {exam.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                          {exam.is_active ? 'Aktif' : 'Draft'}
                       </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                           {/* A dedicated configure questions page could be added in the future */}
                           <button className="p-2 text-gray-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-[8px] transition-colors" title="Edit Soal (Belum Tersedia)">
                              <FileSignature size={16} />
                           </button>
                           <button 
                             onClick={() => deleteExam(exam.id)}
                             className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-[8px] transition-colors" title="Hapus Ujian"
                           >
                              <Trash2 size={16} />
                           </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Buat Ujian */}
      {showModal && (
         <div className="fixed inset-0 bg-gray-900/50 flex flex-col justify-center items-center z-50 p-4">
            <div className="bg-white rounded-[12px] w-full max-w-[500px] shadow-lg border border-gray-200 flex flex-col">
               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-[12px]">
                  <h3 className="font-bold text-gray-900">Buat Ujian Baru</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                     <XCircle size={20} />
                  </button>
               </div>
               <form onSubmit={handleCreateExam} className="p-6 flex flex-col gap-4">
                  <div>
                     <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Judul Ujian</label>
                     <input 
                        required
                        type="text"
                        value={newExam.title}
                        onChange={e => setNewExam({...newExam, title: e.target.value})}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-[8px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                        placeholder="Contoh: Ujian Tengah Semester TKJ"
                     />
                  </div>
                  <div>
                     <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Durasi (Menit)</label>
                     <input 
                        required
                        type="number"
                        min="1"
                        value={newExam.duration}
                        onChange={e => setNewExam({...newExam, duration: parseInt(e.target.value) || 0})}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-[8px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                     />
                  </div>
                  <div className="mt-4 flex gap-3">
                     <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-[8px] font-semibold hover:bg-gray-50 transition-colors"
                     >
                        Batal
                     </button>
                     <button 
                        type="submit" 
                        disabled={submitting}
                        className="flex-1 bg-red-600 text-white py-2.5 rounded-[8px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                     >
                        {submitting ? 'Menyimpan...' : 'Simpan Ujian'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
