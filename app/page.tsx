'use client';
// Single-file Next.js page: public site, applications, admin UI, and setup SQL below.
import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  MapPin, 
  Mail, 
  Clock, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ChevronUp,
  Send, 
  CheckCircle2, 
  Sparkles, 
  BookOpen,
  Code2,
  Cpu,
  Palette,
  Database,
  ArrowRight,
  Loader2,
  Terminal
} from 'lucide-react';

interface Toast {
  type: string;
  title: string;
  message: string;
}

type Course = { id: string; title: string; category: string; description: string; duration: string; icon: string; published: boolean };
type NewsItem = { id: string; title: string; body: string; published: boolean; created_at: string };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
  || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  || '';
const supabaseConfigured = (() => {
  try {
    const url = new URL(supabaseUrl);
    return url.protocol === 'https:' && !!supabaseKey && !/(tvoj-projekat|your-project|placeholder|example)/i.test(url.hostname);
  } catch {
    return false;
  }
})();
const supabase = createClient(
  supabaseConfigured ? supabaseUrl : 'https://missing-project.supabase.co',
  supabaseConfigured ? supabaseKey : 'missing-supabase-key',
);
const requireSupabaseConfig = () => {
  if (!supabaseConfigured) {
    throw new Error('Supabase nije podešen. Provjerite NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY u .env.local, pa ponovo pokrenite aplikaciju.');
  }
};
const courseIcons: Record<string, React.ComponentType<{ className?: string }>> = { Code2, Database, Cpu, Palette };

// Javni sadržaj (kursevi i novosti); greške se ispisuju u konzolu umjesto da nestanu neprimijećeno.
async function fetchPublicContent() {
  if (!supabaseConfigured) return null;
  const [courses, news] = await Promise.all([
    supabase.from('courses').select('*').order('created_at', { ascending: false }),
    supabase.from('news').select('*').order('created_at', { ascending: false }),
  ]);
  if (courses.error) console.error('Učitavanje kurseva nije uspjelo:', courses.error.message);
  if (news.error) console.error('Učitavanje novosti nije uspjelo:', news.error.message);
  return { courseRows: courses.data, newsRows: news.data };
}

// Svi redovi iz tabele za admin pogled (RLS vraća i neobjavljene samo administratoru).
async function fetchAdminRows(section: 'courses' | 'news') {
  requireSupabaseConfig();
  const { data, error } = await supabase.from(section).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState('pocetna');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramName, setSelectedProgramName] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminSection, setAdminSection] = useState<'courses' | 'news'>('courses');
  const [adminForm, setAdminForm] = useState({ title: '', category: 'Kurs', description: '', duration: '', icon: 'Code2', body: '', published: true });
  const [adminBusy, setAdminBusy] = useState(false);

  const galleryItems = [
    {
      title: 'Glavna sala i radionice',
      desc: 'Prostor opremljen za predavanja, prezentacije i rad u timovima.',
      img: '/2.jpeg'
    },
    {
      title: 'Coworking zona',
      desc: 'Udobna i opremljena radna mjesta sa više monitora za individualni rad.',
      img: '/1.jpeg'
    },
    {
      title: 'Individualno radno mjesto',
      desc: 'Svijetao i moderan prostor opremljen računarom, dodatnim monitorom i štampačem za nesmetan rad.',
      img: '/3.jpeg' 
    },
    {
      title: 'Timski rad i mentorstvo',
      desc: 'Rad na realnim projektima uz podršku mentora.',
      img: '/4.jpeg' 
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    program: 'Opšti upit',
    message: '',
    website: '' // honeypot: ljudi ga ne vide, botovi ga popune
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const refreshContent = async () => {
    const content = await fetchPublicContent();
    if (!content) return;
    if (content.courseRows) setCourses(content.courseRows as Course[]);
    if (content.newsRows) setNewsItems(content.newsRows as NewsItem[]);
  };

  useEffect(() => {
    let cancelled = false;
    void fetchPublicContent().then(content => {
      if (cancelled || !content) return;
      if (content.courseRows) setCourses(content.courseRows as Course[]);
      if (content.newsRows) setNewsItems(content.newsRows as NewsItem[]);
    });
    return () => { cancelled = true; };
  }, []);

  const loadAdminContent = async () => {
    const rows = await fetchAdminRows(adminSection);
    if (adminSection === 'courses') setCourses(rows as Course[]);
    else setNewsItems(rows as NewsItem[]);
  };

  useEffect(() => {
    if (!adminAuthorized) return;
    let cancelled = false;
    fetchAdminRows(adminSection)
      .then(rows => {
        if (cancelled) return;
        if (adminSection === 'courses') setCourses(rows as Course[]);
        else setNewsItems(rows as NewsItem[]);
      })
      .catch(err => {
        if (!cancelled) setToast({ type: 'error', title: 'Greška', message: err instanceof Error ? err.message : 'Učitavanje nije uspjelo.' });
      });
    return () => { cancelled = true; };
  }, [adminAuthorized, adminSection]);

  const adminSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); setAdminBusy(true);
    if (!supabaseConfigured) {
      setToast({ type: 'error', title: 'Supabase nije podešen', message: 'Provjerite URL i Publishable key u .env.local, pa ponovo pokrenite aplikaciju.' });
      setAdminBusy(false); return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPassword });
    if (!error && data.user) {
      const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
      if (admin) {
        setAdminAuthorized(true);
        setToast({ type: 'success', title: 'Prijava uspješna', message: 'Dobro došli u administraciju.' });
        try { await loadAdminContent(); } catch (err) { setToast({ type: 'error', title: 'Greška', message: err instanceof Error ? err.message : 'Učitavanje nije uspjelo.' }); }
      } else {
        await supabase.auth.signOut();
        setToast({ type: 'error', title: 'Nema pristupa', message: 'Ovaj račun nije administrator.' });
      }
    } else setToast({ type: 'error', title: 'Prijava nije uspjela', message: error?.message || 'Provjerite podatke.' });
    setAdminBusy(false);
  };

  const saveAdminItem = async (e: React.FormEvent) => {
    e.preventDefault(); setAdminBusy(true);
    const { error } = adminSection === 'courses'
      ? await supabase.from('courses').insert({ title: adminForm.title.trim(), category: adminForm.category.trim(), description: adminForm.description.trim(), duration: adminForm.duration.trim(), icon: adminForm.icon, published: adminForm.published })
      : await supabase.from('news').insert({ title: adminForm.title.trim(), body: adminForm.body.trim(), published: adminForm.published });
    if (error) setToast({ type: 'error', title: 'Nije sačuvano', message: error.message });
    else {
      setToast({ type: 'success', title: 'Sačuvano', message: 'Sadržaj je sačuvan u Supabase.' });
      setAdminForm({ title: '', category: 'Kurs', description: '', duration: '', icon: 'Code2', body: '', published: true });
      await loadAdminContent(); await refreshContent();
    }
    setAdminBusy(false);
  };

  const updateAdminItem = async (table: 'courses' | 'news', id: string, changes: Record<string, unknown>) => {
    const { error } = await supabase.from(table).update(changes).eq('id', id);
    if (error) setToast({ type: 'error', title: 'Izmjena nije sačuvana', message: error.message });
    else { await loadAdminContent(); await refreshContent(); }
  };

  const deleteAdminItem = async (table: 'courses' | 'news', id: string) => {
    if (!window.confirm('Obrisati ovu stavku? Ovo se ne može poništiti.')) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) setToast({ type: 'error', title: 'Brisanje nije uspjelo', message: error.message });
    else { await loadAdminContent(); await refreshContent(); }
  };

  // Auto hide toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      const sections = ['pocetna', 'programi', 'zajednica', 'kontakt'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openModalWithProgram = (programName: string) => {
    setSelectedProgramName(programName);
    setFormData(prev => ({ ...prev, program: programName || 'Opšti upit' }));
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(() => null);
      if (!response) throw new Error('Nema veze sa serverom. Provjerite internet i pokušajte ponovo.');
      const result: { error?: string } = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Pokušajte ponovo za nekoliko trenutaka.');
      setToast({ type: 'success', title: 'Prijava uspješno zaprimljena!', message: `Hvala vam, ${formData.fullName}. Naš tim će vas kontaktirati uskoro.` });
      setIsModalOpen(false);
      setFormData({ fullName: '', email: '', phone: '', program: 'Opšti upit', message: '', website: '' });
    } catch (err) {
      console.error('Greška pri slanju prijave:', err);
      setToast({ type: 'error', title: 'Slanje nije uspjelo', message: err instanceof Error ? err.message : 'Pokušajte ponovo za nekoliko trenutaka.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white flex flex-col justify-between relative">
      
      {/* Scroll to top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Povratak na vrh"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 animate-bounce transition-all duration-300 max-w-md bg-white rounded-2xl shadow-xl p-4 flex items-start gap-3 ${toast.type === 'error' ? 'border border-rose-200' : 'border border-emerald-200'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h5 className="font-bold text-slate-900 text-sm">{toast.title}</h5>
            <p className="text-slate-600 text-xs mt-0.5">{toast.message}</p>
          </div>
          <button 
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <button 
            onClick={() => scrollToSection('pocetna')} 
            className="flex items-center group focus:outline-none"
          >
            <Image
              src="/NextGen.png"
              alt="NextGen HUB"
              width={1536}
              height={1024}
              sizes="72px"
              priority
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </button>

          {/* Navigacija */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              { id: 'pocetna', label: 'Početna' },
              { id: 'programi', label: 'Programi & Edukacija' },
              { id: 'zajednica', label: 'Zajednica' },
              { id: 'kontakt', label: 'Kontakt' }
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-sky-50 text-sky-600 shadow-sm border border-sky-100/60' 
                      : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => openModalWithProgram('Opšti upit')}
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm px-5 py-2.5 rounded-full transition-all duration-200 shadow-md shadow-sky-600/20 active:scale-95 flex items-center gap-2"
            >
              <span>Prijavi se</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-2 shadow-lg">
            {[
              { id: 'pocetna', label: 'Početna' },
              { id: 'programi', label: 'Programi & Edukacija' },
              { id: 'zajednica', label: 'Zajednica' },
              { id: 'kontakt', label: 'Kontakt' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold flex items-center justify-between transition ${
                  activeSection === item.id 
                    ? 'bg-sky-50 text-sky-600' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>
            ))}
            <div className="pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openModalWithProgram('Opšti upit');
                }}
                className="w-full bg-sky-600 text-white font-medium py-3 rounded-xl text-center shadow-md shadow-sky-600/20 active:scale-98 transition flex items-center justify-center gap-2"
              >
                <span>Prijavi se odmah</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Početna (Hero) sekcija */}
        <section id="pocetna" className="relative pt-16 pb-20 md:py-28 bg-gradient-to-b from-white via-slate-50/60 to-slate-50 overflow-hidden text-center">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-[0.14] pointer-events-none mix-blend-multiply" 
            style={{ backgroundImage: "url('/hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-slate-50 pointer-events-none"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-sky-100/40 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-sky-100 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
              <span>Dobrodošli u NextGen HUB Kakanj</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Mjesto gdje IT zajednica <br />
              <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-sky-500 bg-clip-text text-transparent">
                raste i sarađuje
              </span>
            </h1>

            <p className="mt-6 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              NextGen Hub zajednica okuplja početnike, iskusne developere i mentore. Obratite nam se, pošaljite svoje podatke i ubrzo ćemo vas kontaktirati sa pozivnicom za naše grupe.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => scrollToSection('programi')}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-medium px-8 py-3.5 rounded-full shadow-lg shadow-sky-600/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                <span>Istraži programe</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => scrollToSection('kontakt')}
                className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium px-8 py-3.5 rounded-full shadow-xs transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5 text-sky-600" />
                <span>Posjeti nas u Kaknju</span>
              </button>
            </div>

            {/* Statistika */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-200/60">
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-100 shadow-xs text-center">
                <p className="text-3xl font-black text-sky-600">20+</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Polaznika radionica</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-100 shadow-xs text-center">
                <p className="text-3xl font-black text-sky-600">15+</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Održanih modula</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-100 shadow-xs text-center">
                <p className="text-3xl font-black text-sky-600">5+</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Ključnih partnera</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-xs border border-slate-100 shadow-xs text-center">
                <p className="text-3xl font-black text-sky-600">100%</p>
                <p className="text-xs text-slate-500 font-medium mt-1">Besplatna edukacija</p>
              </div>
            </div>
          </div>
        </section>

        {/* Programi Section */}
        <section id="programi" className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold tracking-widest text-sky-600 uppercase bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
                KURSEVI I RADIONICE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">
                Naši programi edukacije
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2">
                Steknite savremene IT vještine kroz praktičan rad na realnim projektima uz podršku mentora.
              </p>
            </div>

            {/* Grid za 4 kursa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              
              {/* Kurs 1 */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-6 shadow-md shadow-sky-600/20 group-hover:scale-110 transition-transform">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Frontend Development</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">HTML, CSS, JS & React</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                    Naučite osnove izrade modernih, responzivnih web stranica i aplikacija koristeći najpopularnije tehnologije.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Trajanje: 8 sedmica</span>
                  <button
                    onClick={() => openModalWithProgram('Frontend Web Development')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Prijavi se</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Kurs 2 */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                    <Database className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Backend Development</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Node.js & Baze Podataka</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                    Savladajte izradu REST API-ja, arhitekturu servera i rad sa SQL i PostgreSQL bazama podataka.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Trajanje: 8 sedmica</span>
                  <button
                    onClick={() => openModalWithProgram('Backend Development & Baze Podataka')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Prijavi se</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Kurs 3 */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mb-6 shadow-md shadow-cyan-600/20 group-hover:scale-110 transition-transform">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-cyan-600 uppercase tracking-wider">Osnove Programiranja</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Python & Algoritmi</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                    Savršena polazna tačka za početnike. Savladajte logiku programiranja, strukture podataka i skripte.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Trajanje: 6 sedmica</span>
                  <button
                    onClick={() => openModalWithProgram('Python & Osnove Programiranja')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Prijavi se</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Kurs 4 */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center mb-6 shadow-md shadow-slate-800/20 group-hover:scale-110 transition-transform">
                    <Palette className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dizajn & UX/UI</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">Figma & Digitalni Dizajn</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">
                    Naučite dizajnerske principe, kreiranje prototipa i grafičkih elemenata za moderne korisničke interfejse.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Trajanje: 4 sedmice</span>
                  <button
                    onClick={() => openModalWithProgram('Figma & UI/UX Dizajn')}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Prijavi se</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {courses.filter(course => course.published).map(course => {
                const Icon = courseIcons[course.icon] || Code2;
                return <div key={course.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-sky-200 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group">
                  <div><div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mb-6 shadow-md shadow-sky-600/20 group-hover:scale-110 transition-transform"><Icon className="w-6 h-6" /></div>
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">{course.category}</span><h3 className="text-lg font-bold text-slate-900 mt-1">{course.title}</h3><p className="text-slate-500 text-xs sm:text-sm mt-3 leading-relaxed">{course.description}</p></div>
                  <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{course.duration ? `Trajanje: ${course.duration}` : ''}</span><button onClick={() => openModalWithProgram(course.title)} className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"><span>Prijavi se</span><ChevronRight className="w-4 h-4" /></button></div>
                </div>;
              })}

            </div>
            {newsItems.some(item => item.published) && <div className="mt-16"><div className="text-center"><span className="text-xs font-bold tracking-widest text-sky-600 uppercase bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">NOVOSTI</span><h3 className="text-2xl font-extrabold text-slate-900 mt-4">Aktuelnosti iz NextGen HUB-a</h3></div><div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">{newsItems.filter(item => item.published).map(item => <article key={item.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left"><p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString('bs-BA')}</p><h4 className="font-bold text-slate-900 mt-2">{item.title}</h4><p className="text-sm text-slate-600 mt-2 whitespace-pre-wrap">{item.body}</p></article>)}</div></div>}
          </div>
        </section>

        {/* Zajednica Section */}
        <section id="zajednica" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto text-center border-t border-slate-100">
          
          {/* GALERIJA I ATMOSFERA */}
          <div className="mb-24">
            <span className="text-xs font-bold tracking-widest text-sky-600 uppercase bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
              GALERIJA I ATMOSFERA
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">
              Kako izgleda naš prostor i zajednica
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto mt-3 text-sm sm:text-base leading-relaxed">
              Upoznajte ambijent u kojem učimo, sarađujemo i stvaramo nove mogućnosti za buduće IT stručnjake.
            </p>

            <div className="relative mt-12 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {galleryItems.map((item, idx) => (
                  <div key={idx} className="relative h-64 sm:h-72 rounded-3xl overflow-hidden group shadow-md border border-slate-100">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1024px) 512px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent flex flex-col justify-end p-6 text-left">
                      <h3 className="text-lg font-bold text-white">{item.title}</h3>
                      <p className="text-slate-300 text-xs sm:text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-8">
                <button 
                  onClick={prevSlide}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition shadow-sm active:scale-95 flex items-center justify-center"
                  aria-label="Prethodna slika"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-semibold text-slate-500">Navigacija galerije</span>
                <button 
                  onClick={nextSlide}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition shadow-sm active:scale-95 flex items-center justify-center"
                  aria-label="Sljedeća slika"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* SPONZORI I PARTNERI */}
          <div>
            <span className="text-xs font-bold tracking-widest text-sky-600 uppercase bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-100">
              PODRŠKA I PARTNERSTVO
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">
              Naši <span className="text-sky-600">sponzori i partneri</span>
            </h2>
            
            <p className="text-slate-500 max-w-2xl mx-auto mt-3 text-sm sm:text-base leading-relaxed">
              Zahvaljujemo se partnerima i institucijama koje podržavaju naš rad i razvoj lokalne IT zajednice.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6 mt-12 max-w-5xl mx-auto items-center">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <div className="relative h-16 w-full">
                  <Image
                    src="/REZ.jpg"
                    alt="REZ Regionalna razvojna agencija"
                    fill
                    sizes="(min-width: 768px) 200px, 45vw"
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <div className="relative h-16 w-full">
                  <Image
                    src="/vlada federacije.png"
                    alt="Vlada FBiH"
                    fill
                    sizes="(min-width: 768px) 200px, 45vw"
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <div className="relative h-14 w-full">
                  <Image
                    src="/caritas.jpg"
                    alt="Caritas Switzerland"
                    fill
                    sizes="(min-width: 768px) 200px, 45vw"
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <div className="relative h-16 w-full">
                  <Image
                    src="/ZDK.png"
                    alt="Zeničko-dobojski kanton"
                    fill
                    sizes="(min-width: 768px) 200px, 45vw"
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <div className="relative h-16 w-full">
                  <Image
                    src="/opcina kakanj.png"
                    alt="Općina Kakanj"
                    fill
                    sizes="(min-width: 768px) 200px, 45vw"
                    className="object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>
            </div>

            {/* SPECIJALNA CTA SEKCIJA SA TERMINAL/KOD PROZORČIĆEM */}
            <div className="mt-16 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-5xl mx-auto shadow-2xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                
                {/* Poziv na akciju */}
                <div className="lg:col-span-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pridruži se timu</span>
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                    Želiš postati dio naše IT priče?
                  </h3>
                  
                  <p className="text-slate-400 mt-3 text-sm sm:text-base leading-relaxed">
                    Pošalji nam svoje podatke i ubrzo ćemo ti se javiti sa svim detaljima o novim grupama, radionicama i projektima.
                  </p>

                  <div className="mt-6">
                    <button
                      onClick={() => openModalWithProgram('Generalna Prijava')}
                      className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-sm sm:text-base px-8 py-3.5 rounded-full shadow-lg shadow-sky-600/30 transition-all duration-200 active:scale-95"
                    >
                      <span>Obrati nam se</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Code/Terminal prozorčić */}
                <div className="lg:col-span-6">
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs sm:text-sm text-slate-300 overflow-hidden shadow-xl">
                    
                    {/* Header prozorčića */}
                    <div className="bg-slate-900/90 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold tracking-wide">
                        <Terminal className="w-3.5 h-3.5 text-sky-400" />
                        <span>nextgen-hub.config.ts</span>
                      </div>
                      <div className="w-8"></div>
                    </div>

                    {/* Sadržaj koda */}
                    <div className="p-4 space-y-2.5 leading-relaxed text-[12px] sm:text-[13px]">
                      <p className="text-slate-500">{'// NextGen HUB Kakanj'}</p>
                      <div className="text-sky-400">
                        <span className="text-purple-400">const</span> hubConfig = {'{'}
                      </div>
                      <div className="pl-4 space-y-1">
                        <div><span className="text-slate-400">location:</span> <span className="text-emerald-400">&apos;Kakanj, BiH&apos;</span>,</div>
                        <div><span className="text-slate-400">community:</span> <span className="text-emerald-400">&apos;NextGen HUB&apos;</span>,</div>
                        <div><span className="text-slate-400">status:</span> <span className="text-amber-300">&apos;Open for enrollment&apos;</span></div>
                      </div>
                      <div className="text-sky-400">{'}'};</div>
                      <div className="pt-2 text-emerald-400 flex items-center gap-2">
                        <span className="animate-pulse">❯</span>
                        <span className="text-slate-300">npm run join-community</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Kontakt Section - Svijetla pozadina s karticama i mapom */}
        <section id="kontakt" className="py-20 bg-slate-50 text-slate-800 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            
            {/* Header kontakt sekcije */}
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold tracking-widest text-sky-600 uppercase bg-sky-100/70 px-4 py-1.5 rounded-full border border-sky-200">
                STUPITE U KONTAKT
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4">
                Posjetite nas ili pošaljite upit
              </h2>
              <p className="text-slate-500 text-sm sm:text-base mt-2">
                Nalazimo se u Kaknju i otvoreni smo za sva pitanja, saradnju i prijave.
              </p>
            </div>

            {/* Info kartice (3 kartice u redu) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10">
              
              {/* Lokacija */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition duration-200">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Lokacija</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Kakanj, Bosna i Hercegovina</p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition duration-200">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Email</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">nextgenhubb26@gmail.com</p>
                </div>
              </div>

              {/* Radno vrijeme */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition duration-200">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Radno vrijeme</h3>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Ponedjeljak - Petak: 08:00 - 15:30</p>
                </div>
              </div>

            </div>

            {/* Mapa i Forma u mrežastom rasporedu */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto mt-10">
              
              {/* Interaktivna Karta */}
              <div className="lg:col-span-6 bg-white p-2 rounded-3xl border border-slate-200/80 shadow-sm min-h-[380px] flex">
                <iframe
                  title="NextGen HUB Kakanj Mapa"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d11488.22019409893!2d18.115833!3d44.130833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475ee7072558661d%3A0x6b7725904d9b4b0!2sKakanj!5e0!3m2!1sbs!2sba!4v1700000000000!5m2!1sbs!2sba"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '360px' }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full rounded-2xl"
                ></iframe>
              </div>

              {/* Kontakt Forma */}
              <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Pošaljite nam poruku</h3>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, opacity: 0 }} />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ime i prezime *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Unesite vaše ime i prezime"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email adresa *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="vas@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Broj telefona</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+387 6X XXX XXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Program / Razlog upita</label>
                    <select
                      value={formData.program}
                      onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                    >
                      <option value="Opšti upit">Opšti upit</option>
                      <option value="Frontend Web Development">Frontend Web Development</option>
                      <option value="Backend Development & Baze Podataka">Backend Development & Baze Podataka</option>
                      <option value="Python & Osnove Programiranja">Python & Osnove Programiranja</option>
                      <option value="Figma & UI/UX Dizajn">Figma & UI/UX Dizajn</option>
                      <option value="Generalna Prijava">Generalna Prijava u zajednicu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Poruka *</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Napišite vaše pitanje..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3.5 rounded-xl shadow-md shadow-sky-600/20 transition duration-200 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Slanje...</span>
                      </>
                    ) : (
                      <>
                        <span>Pošalji poruku</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

            </div>

          </div>
        </section>

        {/* Modal za prijavu */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
              
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                  PRIJAVA NA PROGRAM
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
                  {selectedProgramName || 'Prijava'}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Popunite formu ispod kako biste osigurali svoje mjesto.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, opacity: 0 }} />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ime i prezime *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Unesite ime i prezime"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email adresa *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="vas@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Broj telefona *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+387 6X XXX XXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Napomena / Iskustvo (opcionalno)</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Napišite kratko o vašem dosadašnjem iskustvu ili očekivanjima..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition resize-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition text-sm"
                  >
                    Odustani
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-1/2 bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-xl shadow-md shadow-sky-600/20 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Potvrdi prijavu</span>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>

      {adminOpen && <section id="admin-panel" className="bg-slate-100 border-t border-slate-200 px-4 py-12"><div className="max-w-5xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold tracking-widest text-sky-600 uppercase">ADMINISTRACIJA</p><h2 className="text-2xl font-extrabold text-slate-900 mt-1">Upravljanje sadržajem</h2></div><button onClick={() => setAdminOpen(false)} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200" aria-label="Zatvori administraciju"><X className="w-5 h-5"/></button></div>
        {!adminAuthorized ? <form onSubmit={adminSignIn} className="mt-6 max-w-md space-y-3"><label className="block text-sm font-semibold">Email administratora<input type="email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3"/></label><label className="block text-sm font-semibold">Lozinka<input type="password" required value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-3"/></label><button disabled={adminBusy} className="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{adminBusy ? 'Prijava…' : 'Prijavi se'}</button></form>
        : <>
          <div className="mt-6 flex flex-wrap gap-3"><button onClick={() => setAdminSection('courses')} className={`rounded-xl px-4 py-2 ${adminSection === 'courses' ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}>Kursevi</button><button onClick={() => setAdminSection('news')} className={`rounded-xl px-4 py-2 ${adminSection === 'news' ? 'bg-sky-600 text-white' : 'bg-slate-100'}`}>Novosti</button><button onClick={async () => { await supabase.auth.signOut(); setAdminAuthorized(false); }} className="ml-auto rounded-xl bg-slate-100 px-4 py-2">Odjavi se</button></div>
          <form onSubmit={saveAdminItem} className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2"><h3 className="font-bold sm:col-span-2">Dodaj {adminSection === 'courses' ? 'kurs' : 'novost'}</h3><input required maxLength={160} value={adminForm.title} onChange={e => setAdminForm({ ...adminForm, title: e.target.value })} placeholder="Naslov" className="rounded-xl border p-3 sm:col-span-2"/>
            {adminSection === 'courses' ? <><input value={adminForm.category} onChange={e => setAdminForm({ ...adminForm, category: e.target.value })} placeholder="Kategorija" className="rounded-xl border p-3"/><input value={adminForm.duration} onChange={e => setAdminForm({ ...adminForm, duration: e.target.value })} placeholder="Trajanje, npr. 8 sedmica" className="rounded-xl border p-3"/><select value={adminForm.icon} onChange={e => setAdminForm({ ...adminForm, icon: e.target.value })} className="rounded-xl border p-3 sm:col-span-2"><option>Code2</option><option>Database</option><option>Cpu</option><option>Palette</option></select><textarea value={adminForm.description} onChange={e => setAdminForm({ ...adminForm, description: e.target.value })} placeholder="Opis kursa" className="rounded-xl border p-3 sm:col-span-2"/></>
            : <textarea required value={adminForm.body} onChange={e => setAdminForm({ ...adminForm, body: e.target.value })} placeholder="Tekst novosti" className="min-h-28 rounded-xl border p-3 sm:col-span-2"/>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={adminForm.published} onChange={e => setAdminForm({ ...adminForm, published: e.target.checked })}/> Objavi odmah</label><button disabled={adminBusy} className="rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white disabled:opacity-50">Sačuvaj</button></form>
          <div className="mt-6 divide-y">{(adminSection === 'courses' ? courses : newsItems).map(item => <div key={item.id} className="flex flex-wrap items-center gap-3 py-4"><div className="min-w-0 flex-1"><p className="font-bold text-slate-900">{item.title}</p><p className="text-sm text-slate-500">{item.published ? 'Objavljeno' : 'Skriveno'}</p></div><button onClick={() => void updateAdminItem(adminSection, item.id, { published: !item.published })} className="rounded-lg bg-slate-100 px-3 py-2 text-sm">{item.published ? 'Sakrij' : 'Objavi'}</button><button onClick={() => void deleteAdminItem(adminSection, item.id)} className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">Obriši</button></div>)}</div>
        </>}
      </div></section>}

      {/* Footer - Svijetla pozadina, centriran tekst */}
      <footer className="bg-white border-t border-slate-200/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center gap-2 text-center">
          <p className="font-medium text-slate-600">
            &copy; {new Date().getFullYear()} NextGen HUB Kakanj. Sva prava zadržana.
          </p>
          <button type="button" onClick={() => { setAdminOpen(value => !value); if (!adminOpen) window.setTimeout(() => document.getElementById('admin-panel')?.scrollIntoView({ behavior: 'smooth' }), 0); }} className="text-[11px] text-slate-400 hover:text-sky-600">Administracija</button>
        </div>
      </footer>

    </div>
  );
}

/*
ONE-FILE SETUP NOTES
====================
Save this file as app/page.tsx. Required packages: @supabase/supabase-js and lucide-react.
Set these public environment variables in your Next.js project:
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
The code also accepts NEXT_PUBLIC_SUPABASE_ANON_KEY for older Supabase projects.
Copy the real Project URL and Publishable key from Supabase > Connect (or Settings > API Keys).
After editing .env.local, stop and restart the Next.js development server.

Run the following SQL once in Supabase SQL Editor. For email alerts, first add three
secrets in Supabase Dashboard > Project Settings > Vault, named resend_api_key,
resend_from_email and notification_email. Use a verified Resend sender address.
The email trigger runs inside the database; no Resend key is exposed in this page.

create extension if not exists pgcrypto;
create schema if not exists extensions;
create extension if not exists pg_net with schema extensions;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(), full_name text not null,
  email text not null, phone text, program text not null default 'Opšti upit',
  message text, created_at timestamptz not null default now()
);
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(), title text not null,
  category text not null default 'Kurs', description text not null default '',
  duration text not null default '', icon text not null default 'Code2',
  published boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(), title text not null,
  body text not null default '', published boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.admins where user_id = (select auth.uid())) $$;

alter table public.contacts enable row level security;
alter table public.admins enable row level security;
alter table public.courses enable row level security;
alter table public.news enable row level security;
drop policy if exists contacts_public_insert on public.contacts;
create policy contacts_public_insert on public.contacts for insert to anon, authenticated
  with check (char_length(full_name) between 2 and 120 and char_length(email) <= 254);
drop policy if exists admins_read_self on public.admins;
create policy admins_read_self on public.admins for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists courses_read_published on public.courses;
create policy courses_read_published on public.courses for select to anon, authenticated using (published or public.is_admin());
drop policy if exists courses_admin_all on public.courses;
create policy courses_admin_all on public.courses for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists news_read_published on public.news;
create policy news_read_published on public.news for select to anon, authenticated using (published or public.is_admin());
drop policy if exists news_admin_all on public.news;
create policy news_admin_all on public.news for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant insert on public.contacts to anon, authenticated;
grant select on public.courses, public.news to anon, authenticated;
grant select on public.admins to authenticated;
grant insert, update, delete on public.courses, public.news to authenticated;

create or replace function public.email_new_contact()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_key text; v_from text; v_to text;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'resend_api_key' limit 1;
  select decrypted_secret into v_from from vault.decrypted_secrets where name = 'resend_from_email' limit 1;
  select decrypted_secret into v_to from vault.decrypted_secrets where name = 'notification_email' limit 1;
  if v_key is not null and v_from is not null and v_to is not null then
    perform net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object('Authorization', 'Bearer ' || v_key, 'Content-Type', 'application/json'),
      body := jsonb_build_object('from', v_from, 'to', jsonb_build_array(v_to),
        'reply_to', new.email, 'subject', 'Nova prijava: ' || new.program,
        'text', 'Ime: ' || new.full_name || E'\nEmail: ' || new.email || E'\nTelefon: ' || coalesce(new.phone, 'nije naveden') || E'\nProgram: ' || new.program || E'\nPoruka: ' || coalesce(new.message, 'nema poruke'))
    );
  end if;
  return new;
end; $$;
drop trigger if exists contacts_email_notification on public.contacts;
create trigger contacts_email_notification after insert on public.contacts
for each row execute function public.email_new_contact();

-- After the setup above finishes, create the Auth user, then add it to public.admins
-- with the separate email-based INSERT shown in the setup instructions.
*/
