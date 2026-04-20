import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
}

export default function TakeExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExamData();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0 && exam && !loading && !submitting) {
      handleSubmit();
      return;
    }

    if (exam && !loading && !submitting) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, exam, loading, submitting]);

  const fetchExamData = async () => {
    try {
      if (!supabase) {
        // Mock data
        const mockQuestions = [
          { id: 'q1', question: 'Berikut ini manakah yang merupakan framework React untuk SSR?', option_a: 'Vue.js', option_b: 'Next.js', option_c: 'Angular', option_d: 'Svelte' },
          { id: 'q2', question: 'Apa kepanjangan dari CPU?', option_a: 'Central Processing Unit', option_b: 'Computer Personal Unit', option_c: 'Central Program Unit', option_d: 'Center Process Unit' },
          { id: 'q3', question: 'Database NoSQL dari Firebase disebut?', option_a: 'MySQL', option_b: 'PostgreSQL', option_c: 'Firestore', option_d: 'SQLite' },
        ];
        setExam({ id, title: 'Ujian Mock', duration: 10 }); // 10 minutes
        setQuestions(mockQuestions);
        setTimeLeft(10 * 60);
        setLoading(false);
        return;
      }

      // Fetch Exam details
      const { data: examData } = await supabase.from('exams').select('*').eq('id', id).single();
      if (!examData) throw new Error("Ujian tidak ditemukan");
      setExam(examData);
      setTimeLeft(examData.duration * 60);

      // Fetch Questions
      const { data: examQs } = await supabase.from('exam_questions').select('question_id').eq('exam_id', id);
      if (examQs && examQs.length > 0) {
        const qIds = examQs.map(q => q.question_id);
        const { data: qs } = await supabase.from('questions').select('id, question, option_a, option_b, option_c, option_d').in('id', qIds);
        setQuestions(qs || []);
      }
      
    } catch (e: any) {
      alert(e.message);
      navigate('/app/siswa/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (val: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentIndex].id]: val
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    // Auto calculate if using Mock
    if (!supabase) {
      alert('Ujian berhasil disubmit (Mode Demo)!');
      navigate('/app/siswa/results');
      return;
    }

    try {
      // Note: A real app should score on server side or secure edge function.
      // For this demo, we'll quickly submit answers.
      const answerInserts = Object.entries(answers).map(([qId, ans]) => ({
        user_id: user?.id,
        exam_id: id,
        question_id: qId,
        answer: ans
      }));

      if (answerInserts.length > 0) {
        await supabase.from('answers').upsert(answerInserts, { onConflict: 'user_id,exam_id,question_id' });
      }

      // We should calculate the score here.
      // Fetch correct answers
      const { data: qs } = await supabase.from('questions').select('id, correct_answer').in('id', questions.map(q => q.id));
      let score = 0;
      if (qs && qs.length > 0) {
          const correctCount = qs.filter(q => answers[q.id] === q.correct_answer).length;
          score = (correctCount / qs.length) * 100;
      }

      await supabase.from('results').insert({
        user_id: user?.id,
        exam_id: id,
        score: score
      });

      alert('Berhasil mensubmit ujian!');
      navigate('/app/siswa/results');

    } catch (e: any) {
      alert("Gagal submit: " + e.message);
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="text-center py-10">Mempersiapkan ujian...</div>;
  if (!questions.length) return <div className="text-center py-10 text-red-600">Tidak ada soal untuk ujian ini.</div>;

  const q = questions[currentIndex];

  return (
    <div className="mx-auto w-full max-w-[1200px] h-full flex flex-col md:flex-row gap-6">
        {/* Question Card */}
        <div className="bg-white rounded-[12px] border border-gray-200 p-6 sm:p-8 flex flex-col flex-1 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-gray-100 px-3 py-1 rounded-[20px] text-xs font-semibold text-gray-500">
              Pertanyaan {currentIndex + 1} dari {questions.length}
            </span>
            <span className="text-gray-500 text-sm font-medium">Poin: 2.5</span>
          </div>
          
          <div className="text-[18px] leading-[1.6] font-medium text-gray-900 mb-8">
            {q.question}
          </div>
          
          <div className="flex flex-col gap-3">
            {[
              { id: 'A', text: q.option_a },
              { id: 'B', text: q.option_b },
              { id: 'C', text: q.option_c },
              { id: 'D', text: q.option_d },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleAnswer(opt.id)}
                className={`p-4 border rounded-[10px] cursor-pointer flex items-center gap-3 transition-colors ${
                  answers[q.id] === opt.id 
                  ? 'border-red-600 bg-red-50 text-red-900' 
                  : 'border-gray-200 hover:border-red-600 text-gray-700'
                }`}
              >
                <div className={`w-7 h-7 border rounded-[5px] flex items-center justify-center text-sm font-semibold transition-colors flex-shrink-0 ${
                   answers[q.id] === opt.id ? 'bg-red-600 border-red-600 text-white' : 'border-gray-200 text-gray-500'
                }`}>
                  {opt.id}
                </div>
                <span className="text-left leading-tight">{opt.text}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between pt-6 border-t border-gray-200">
             <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="bg-white border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-colors hover:bg-gray-50"
             >
                &larr; Sebelumnya
             </button>
             <button
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentIndex === questions.length - 1}
                className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-colors hover:bg-red-700"
             >
                Selanjutnya &rarr;
             </button>
          </div>
        </div>

        {/* Panel Card */}
        <div className="bg-white rounded-[12px] border border-gray-200 p-6 flex flex-col w-full md:w-[300px] shadow-sm h-fit">
          <div className="text-center p-4 bg-gray-900 text-white rounded-[10px] mb-6 shadow-sm">
            <div className="text-[12px] opacity-70 uppercase tracking-widest mb-1 font-medium">Sisa Waktu</div>
            <div className="text-[24px] font-bold tabular-nums">{formatTime(timeLeft)}</div>
          </div>
          
          <div className="text-[13px] font-semibold text-gray-900 mb-3">Navigasi Soal</div>
          
          <div className="grid grid-cols-5 gap-2 mb-auto">
             {questions.map((_, i) => (
               <button
                 key={i}
                 onClick={() => setCurrentIndex(i)}
                 className={`h-10 rounded-[6px] border flex items-center justify-center text-sm font-semibold cursor-pointer transition-all ${
                   currentIndex === i 
                   ? 'border-red-600 border-2 text-red-600 bg-white shadow-sm' 
                   : answers[questions[i].id] 
                     ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
                     : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                 }`}
               >
                 {i + 1}
               </button>
             ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
             <button 
                onClick={() => {
                   if(window.confirm('Apakah Anda yakin ingin menyelesaikan ujian ini?')) handleSubmit();
                }}
                disabled={submitting}
                className="w-full bg-gray-900 text-white font-semibold px-6 py-3 rounded-[8px] hover:bg-black transition-all shadow-sm flex items-center justify-center gap-2"
             >
                {submitting ? 'Menyimpan...' : 'Selesaikan Ujian'}
             </button>
          </div>
        </div>
    </div>
  );
}
