import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Trash2, Edit, Check, XCircle, AlertCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  created_by: string;
}

export default function QuestionsManagementPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A'
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    if (!supabase) {
      setQuestions([
        { id: '1', question: 'Berikut ini manakah yang merupakan framework React untuk SSR?', option_a: 'Vue.js', option_b: 'Next.js', option_c: 'Angular', option_d: 'Svelte', correct_answer: 'B', created_by: 'mock' },
        { id: '2', question: 'Apa kepanjangan dari CPU?', option_a: 'Central Processing Unit', option_b: 'Computer Personal Unit', option_c: 'Central Program Unit', option_d: 'Center Process Unit', correct_answer: 'A', created_by: 'mock' },
      ]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      // Jika role guru, hanya tampilkan soal yang dibuat oleh guru tersebut
      if (user?.role === 'guru') {
         query = query.eq('created_by', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setQuestions(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    if (!supabase) {
      setFormError("Hanya tersedia jika database Supabase terhubung.");
      setFormLoading(false);
      return;
    }

    // Validasi frontend (meskipun required sudah ada di input HTML)
    if (!formData.question.trim() || !formData.option_a.trim() || !formData.option_b.trim() || !formData.option_c.trim() || !formData.option_d.trim()) {
        setFormError("Semua field teks harus diisi tidak boleh kosong.");
        setFormLoading(false);
        return;
    }

    try {
      const { error } = await supabase.from('questions').insert({
        question: formData.question,
        option_a: formData.option_a,
        option_b: formData.option_b,
        option_c: formData.option_c,
        option_d: formData.option_d,
        correct_answer: formData.correct_answer,
        created_by: user?.id
      });

      if (error) throw error;

      // Sukses
      setShowModal(false);
      setFormData({
        question: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_answer: 'A'
      });
      fetchQuestions();

    } catch (e: any) {
      setFormError('Gagal menyimpan bank soal: ' + e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;
    
    if(!supabase) {
        setQuestions(questions.filter(q => q.id !== id));
        return;
    }

    try {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) throw error;
        fetchQuestions();
    } catch (e: any) {
        alert("Gagal menghapus soal: " + e.message);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 mx-auto w-full max-w-[1200px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 leading-tight">Bank Soal</h1>
          <p className="text-gray-500 mt-1 text-[14px]">
            {user?.role === 'admin' ? "Kelola keseluruhan soal ujian sistem." : "Kelola daftar soal ujian yang telah Anda buat."}
          </p>
        </div>
        <button 
           onClick={() => setShowModal(true)}
           className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-[8px] font-semibold transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Tambah Soal</span>
        </button>
      </div>

      <div className="bg-white rounded-[12px] shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari soal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-[8px] text-[14px] w-64 md:w-80 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
            />
          </div>
        </div>
        
        <div className="p-0">
           {loading ? (
             <div className="p-10 text-center text-gray-500 text-[14px]">Memuat data...</div>
           ) : filteredQuestions.length === 0 ? (
             <div className="p-10 text-center text-gray-500 text-[14px]">Tidak ada soal ditemukan. Klik "Tambah Soal" untuk membuat.</div>
           ) : (
             <ul className="divide-y divide-gray-100">
                {filteredQuestions.map((q, index) => (
                   <li key={q.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                         <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-4 text-[16px] leading-[1.6]">
                               <span className="font-bold mr-2 text-gray-400">{index + 1}.</span> 
                               {q.question}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[14px]">
                               <OptionItem label="A" text={q.option_a} isCorrect={q.correct_answer === 'A'} />
                               <OptionItem label="B" text={q.option_b} isCorrect={q.correct_answer === 'B'} />
                               <OptionItem label="C" text={q.option_c} isCorrect={q.correct_answer === 'C'} />
                               <OptionItem label="D" text={q.option_d} isCorrect={q.correct_answer === 'D'} />
                            </div>
                         </div>
                         {(user?.role === 'admin' || user?.id === q.created_by) && (
                           <div className="flex space-x-2">
                               <button 
                                 onClick={() => handleDelete(q.id)}
                                 className="p-2 text-gray-400 hover:text-red-600 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-[8px] transition-colors"
                                 title="Hapus Soal"
                               >
                                  <Trash2 size={16} />
                               </button>
                           </div>
                         )}
                      </div>
                   </li>
                ))}
             </ul>
           )}
        </div>
      </div>

      {/* Modal / Form Tambah Soal */}
      {showModal && (
         <div className="fixed inset-0 bg-gray-900/50 flex flex-col justify-center items-center z-50 p-4">
            <div className="bg-white rounded-[12px] w-full max-w-[600px] max-h-[90vh] overflow-hidden shadow-lg border border-gray-200 flex flex-col">
               <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-900 text-[18px]">Tambah Soal Pilihan Ganda</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                     <XCircle size={24} />
                  </button>
               </div>
               
               <form onSubmit={handleCreate} className="overflow-y-auto p-6 flex flex-col gap-5 flex-1">
                  {formError && (
                     <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[8px] text-[13px] flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{formError}</span>
                     </div>
                  )}

                  <div>
                     <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Pertanyaan</label>
                     <textarea 
                        required
                        rows={3}
                        value={formData.question}
                        onChange={e => setFormData({...formData, question: e.target.value})}
                        className="w-full border border-gray-300 px-4 py-3 rounded-[8px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-[14px]"
                        placeholder="Tuliskan pertanyaan di sini..."
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Pilihan A</label>
                        <input 
                           required 
                           type="text"
                           value={formData.option_a}
                           onChange={e => setFormData({...formData, option_a: e.target.value})}
                           className="w-full border border-gray-300 px-4 py-2.5 rounded-[8px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-[14px]"
                        />
                     </div>
                     <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Pilihan B</label>
                        <input 
                           required 
                           type="text"
                           value={formData.option_b}
                           onChange={e => setFormData({...formData, option_b: e.target.value})}
                           className="w-full border border-gray-300 px-4 py-2.5 rounded-[8px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-[14px]"
                        />
                     </div>
                     <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Pilihan C</label>
                        <input 
                           required 
                           type="text"
                           value={formData.option_c}
                           onChange={e => setFormData({...formData, option_c: e.target.value})}
                           className="w-full border border-gray-300 px-4 py-2.5 rounded-[8px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-[14px]"
                        />
                     </div>
                     <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Pilihan D</label>
                        <input 
                           required 
                           type="text"
                           value={formData.option_d}
                           onChange={e => setFormData({...formData, option_d: e.target.value})}
                           className="w-full border border-gray-300 px-4 py-2.5 rounded-[8px] outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-[14px]"
                        />
                     </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                     <label className="block text-[13px] font-semibold text-gray-700 mb-2">Jawaban Benar</label>
                     <div className="flex gap-4">
                        {['A', 'B', 'C', 'D'].map(opt => (
                           <label key={opt} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                 type="radio" 
                                 name="correct_answer" 
                                 value={opt}
                                 checked={formData.correct_answer === opt}
                                 onChange={e => setFormData({...formData, correct_answer: e.target.value})}
                                 className="w-4 h-4 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-[14px] font-medium text-gray-800">Pilihan {opt}</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  <div className="mt-8 flex gap-3 pt-4 border-t border-gray-100 pb-2">
                     <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-[8px] font-semibold hover:bg-gray-50 transition-colors text-[14px]"
                     >
                        Batal
                     </button>
                     <button 
                        type="submit" 
                        disabled={formLoading}
                        className="flex-1 bg-red-600 text-white py-3 rounded-[8px] font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 text-[14px] flex justify-center items-center gap-2"
                     >
                        {formLoading ? 'Menyimpan...' : 'Simpan Soal'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

function OptionItem({ label, text, isCorrect }: { label: string, text: string, isCorrect: boolean }) {
  return (
     <div className={`p-3 rounded-[8px] border flex items-start flex-1 ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-600'}`}>
        <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded-[4px] border text-[11px] font-bold mr-3 ${isCorrect ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300'}`}>
           {label}
        </div>
        <span className="flex-1">{text}</span>
        {isCorrect && <Check size={16} className="text-emerald-600 flex-shrink-0 ml-2 mt-0.5" />}
     </div>
  );
}
