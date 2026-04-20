import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Trash2, Edit, Check } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

export default function GuruQuestionsPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    if (!supabase) {
      setQuestions([
        { id: '1', question: 'Berikut ini manakah yang merupakan framework React untuk SSR?', option_a: 'Vue.js', option_b: 'Next.js', option_c: 'Angular', option_d: 'Svelte', correct_answer: 'B' },
        { id: '2', question: 'Apa kepanjangan dari html?', option_a: 'Hypertext Markup Language', option_b: 'Hypertext Machine Language', option_c: 'Hyperlink Markup Language', option_d: 'Hypertext Marking Language', correct_answer: 'A' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bank Soal</h1>
          <p className="text-slate-500 mt-1">Kelola daftar soal pilihan ganda yang Anda buat.</p>
        </div>
        <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={18} />
          <span>Tambah Soal</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari soal..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-64 md:w-80 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
        
        <div className="p-0">
           {loading ? (
             <div className="p-10 text-center text-slate-500">Memuat data...</div>
           ) : filteredQuestions.length === 0 ? (
             <div className="p-10 text-center text-slate-500">Tidak ada soal ditemukan.</div>
           ) : (
             <ul className="divide-y divide-slate-100">
                {filteredQuestions.map(q => (
                   <li key={q.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex justify-between items-start">
                         <div className="flex-1 mr-6">
                            <h3 className="font-medium text-slate-800 mb-4">{q.question}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                               <OptionItem label="A" text={q.option_a} isCorrect={q.correct_answer === 'A'} />
                               <OptionItem label="B" text={q.option_b} isCorrect={q.correct_answer === 'B'} />
                               <OptionItem label="C" text={q.option_c} isCorrect={q.correct_answer === 'C'} />
                               <OptionItem label="D" text={q.option_d} isCorrect={q.correct_answer === 'D'} />
                            </div>
                         </div>
                         <div className="flex space-x-2">
                             <button className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors">
                                <Edit size={16} />
                             </button>
                             <button className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors">
                                <Trash2 size={16} />
                             </button>
                         </div>
                      </div>
                   </li>
                ))}
             </ul>
           )}
        </div>
      </div>
    </div>
  );
}

function OptionItem({ label, text, isCorrect }: { label: string, text: string, isCorrect: boolean }) {
  return (
     <div className={`p-3 rounded-lg border flex items-start ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-slate-200 text-slate-600'}`}>
        <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded border text-xs mr-3 ${isCorrect ? 'bg-green-600 border-green-600 text-white' : 'border-slate-300'}`}>
           {label}
        </div>
        <span className="flex-1">{text}</span>
        {isCorrect && <Check size={16} className="text-green-600 ml-2 mt-0.5" />}
     </div>
  );
}
