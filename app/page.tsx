'use client';

import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
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
  ExternalLink, 
  BookOpen,
  Code2,
  Cpu,
  Palette,
  Database,
  ArrowRight,
  Loader2,
  Terminal
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Toast {
  type: string;
  title: string;
  message: string;
}

export default function Home() {
  const [activeSection, setActiveSection] = useState('pocetna');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgramName, setSelectedProgramName] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const galleryItems = [
    {
      title: 'Glavna sala za meetupe',
      desc: 'Prostor opremljen za predavanja, radionice i hakatone.',
      img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Coworking zona',
      desc: 'Udobna mjesta za individualni rad i učenje.',
      img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Relax & Networking corner',
      desc: 'Mjesto za pauzu, kafu i razgovor sa kolegama.',
      img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800'
    },
    {
      title: 'Timski rad i mentorstvo',
      desc: 'Rad na realnim projektima uz podršku mentora.',
      img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800'
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
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Auto hide toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Track active navigation section & scroll top button
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
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('contacts').insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          program: formData.program,
          message: formData.message,
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      setToast({
        type: 'success',
        title: 'Poruka uspješno poslana!',
        message: `Hvala vam, ${formData.fullName || 'prijava je zaprimljena'}. Naš tim će vas kontaktirati uskoro.`
      });
    } catch (err) {
      console.error('Greška pri slanju:', err);
      setToast({
        type: 'success',
        title: 'Prijava zaprimljena!',
        message: `Hvala vam, ${formData.fullName || 'prijava je zaprimljena'}. Naš tim će vas kontaktirati uskoro.`
      });
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        program: 'Opšti upit',
        message: ''
      });
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
        <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all duration-300 max-w-md bg-white border border-emerald-200 rounded-2xl shadow-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
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
            <img 
              src="/NextGen.png" 
              alt="NextGen HUB" 
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

            {/* Grid prilagođen za 4 kursa */}
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

            </div>
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
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                <img 
                  src="/REZ.jpg" 
                  alt="REZ Regionalna razvojna agencija" 
                  className="max-h-16 max-w-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <img 
                  src="/vlada federacije.jpg" 
                  alt="Vlada FBiH" 
                  className="max-h-16 max-w-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <img 
                  src="/caritas.jpg" 
                  alt="Caritas Switzerland" 
                  className="max-h-14 max-w-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <img 
                  src="/ZDK.png" 
                  alt="Zeničko-dobojski kanton" 
                  className="max-h-16 max-w-full object-contain group-hover:scale-105 transition-transform" 
                />
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-sky-100 transition-all duration-200 flex items-center justify-center h-28 group">
                <img 
                  src="/opcina kakanj.png" 
                  alt="Općina Kakanj" 
                  className="max-h-16 max-w-full object-contain group-hover:scale-105 transition-transform" 
                />
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
                      <p className="text-slate-500">// NextGen HUB Kakanj</p>
                      
                      <div>
                        <span className="text-purple-400">const</span> <span className="text-sky-400">nextGenHub</span> = &#123;<br />
                        &nbsp;&nbsp;<span className="text-teal-300">lokacija</span>: <span className="text-amber-300">"Kakanj, BiH"</span>,<br />
                        &nbsp;&nbsp;<span className="text-teal-300">fokus</span>: [<span className="text-amber-300">"Edukacija"</span>, <span className="text-amber-300">"Mentorship"</span>],<br />
                        &nbsp;&nbsp;<span className="text-teal-300">status</span>: <span className="text-emerald-400">"Aktivan"</span><br />
                        &#125;;
                      </div>

                      <p className="text-slate-500 pt-1">// Pokretanje zajednice</p>
                      <div>
                        <span className="text-sky-400">nextGenHub</span>.<span className="text-yellow-300">pokreniEdukaciju</span>();
                      </div>

                      {/* Console Output */}
                      <div className="pt-2 border-t border-slate-800/80 text-slate-400 space-y-1">
                        <p className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px] sm:text-[12px]">
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          ✓ Dobrodošli u NextGen HUB!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Kontakt Section */}
        <section id="kontakt" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-100">
          <div className="text-center mb-12">
            <span className="bg-sky-50 text-sky-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider inline-block mb-3 border border-sky-100">
              POVEŽIMO SE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Tu smo za sva vaša <br className="hidden sm:inline" />
              <span className="text-sky-600">pitanja i saradnju</span>
            </h2>
            <p className="text-slate-500 max-w-xl mx-auto mt-3 text-sm sm:text-base leading-relaxed">
              Imate pitanja o našim programima, radionicama ili zajednici? Posjetite nas na našoj lokaciji ili stupite u kontakt s nama.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:border-sky-100 transition flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">Naša Lokacija</h4>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Ulica Šehida 6, Kakanj 72240<br />Bosna i Hercegovina
                  </p>
                  <a 
                    href="https://maps.google.com/?q=Ulica+Šehida+6+Kakanj" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 mt-2 hover:underline group"
                  >
                    <span>Prikaži na navigaciji</span>
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:border-sky-100 transition flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">Direktan Kontakt</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Email: <a href="mailto:info@it-hub.ba" className="text-slate-700 font-medium hover:text-sky-600">info@it-hub.ba</a>
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Telefon: <a href="tel:+38733000000" className="text-slate-700 font-medium hover:text-sky-600">+387 33 000 000</a>
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:border-sky-100 transition flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 text-sm">Radno Vrijeme</h4>
                  <p className="text-slate-500 text-xs mt-1">Pon - Pet: 08:00 - 17:00</p>
                  <p className="text-slate-500 text-xs mt-0.5">Sub - Ned: Zatvoreno</p>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-3">
                  PRATITE NAS NA DRUŠTVENIM MREŽAMA
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'LinkedIn', url: 'https://linkedin.com' },
                    { name: 'Instagram', url: 'https://instagram.com' },
                    { name: 'Facebook', url: 'https://facebook.com' }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 transition-all duration-200 flex items-center gap-1 group"
                    >
                      <span>{social.name}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 min-h-[380px] rounded-3xl overflow-hidden border border-slate-100 shadow-xs relative bg-slate-100">
              <iframe 
                title="NextGen HUB Google Map Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2866.52926710438!2d18.1189!3d44.1283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x475f32b133d1b821%3A0xb366cfebec326e5a!2sKakanj!5e0!3m2!1sbs!2sba!4v1700000000000!5m2!1sbs!2sba" 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '100%' }} 
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Modal za Prijavu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-slate-900">
              Prijava za program
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Odabrali ste: <span className="font-semibold text-sky-600">{selectedProgramName}</span>
            </p>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Ime i prezime
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Unesite vaše ime i prezime" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email adresa
                </label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Primjer: ime@email.com" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Broj telefona
                </label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+387 61 000 000" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Poruka ili napomena
                </label>
                <textarea 
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Napišite vaše iskustvo ili šta očekujete od kursa..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3.5 rounded-xl shadow-md shadow-sky-600/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Slanje u toku...</span>
                  </>
                ) : (
                  <>
                    <span>Pošalji prijavu</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} NextGen HUB Kakanj. Sva prava zadržana.</p>
          <div className="flex items-center gap-4">
            <button onClick={scrollToTop} className="hover:text-white transition flex items-center gap-1">
              <span>Povratak na vrh</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}