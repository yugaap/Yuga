import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FileSignature, Clock, PlayCircle } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  duration: number;
}

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      if (!supabase) {
        // Mock data
        setExams([
          { id: '1', title: 'Ujian Akhir Semester - Basis Data', duration: 120 },
          { id: '2', title: 'Penilaian Harian - Pemrograman Web', duration: 60 }
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">Memuat data ujian...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daftar Ujian Tersedia</h1>
        <p className="text-slate-500 mt-1">Pilih ujian yang akan Anda kerjakan hari ini.</p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-100">
          <FileSignature className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-slate-900">Belum Ada Ujian</h3>
          <p className="text-slate-500 mt-1">Saat ini tidak ada ujian yang aktif untuk Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="bg-red-50 p-3 rounded-lg text-red-600 mb-4">
                  <FileSignature size={24} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2">{exam.title}</h3>
              <div className="flex items-center text-slate-500 text-sm mb-6 mt-auto">
                <Clock size={16} className="mr-1.5" />
                <span>{exam.duration} Menit</span>
              </div>
              <Link
                to={`/app/siswa/take-exam/${exam.id}`}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors font-medium"
              >
                <PlayCircle size={18} />
                <span>Mulai Kerjakan</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
