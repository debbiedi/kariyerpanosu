import React, { useState, useMemo, useEffect } from 'react';
import { Globe, Search, MapPin, Briefcase, GraduationCap, AlertTriangle, ArrowRight, Layout, TrendingUp, Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, Menu, X, Coins, Clock, Building, Award, Code, Cpu, Activity, Calendar, Settings, BarChart3, CheckCircle2, Users, Lightbulb, Linkedin, Cloud, Check, Loader2 } from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// --- FIREBASE AYARLARI ---
const firebaseConfig = {
  apiKey: "AIzaSyDepkmn5L-OZXdT8mKf9sHDqhBoJNSI90o",
  authDomain: "kariyerpanosu.firebaseapp.com",
  projectId: "kariyerpanosu",
  storageBucket: "kariyerpanosu.firebasestorage.app",
  messagingSenderId: "24937941128",
  appId: "1:24937941128:web:ac7d3d38dccde96c97373d"
};

let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase başlatılamadı:", e);
}

// --- VERİLER ---
const allCountries = [
  { id: 'de', name: 'Almanya', englishName: 'Germany', region: 'Avrupa', tier: 'Tier 1', difficulty: 35, visa: 'Chancenkarte', tags: ['Otomotiv', 'Sanayi 4.0'], salary: '€48k - €60k', desc: 'Mühendislik için dünyanın 1 numarası. Devlet üniversiteleri (TU9) neredeyse ücretsizdir.', strategy: 'İş: Chancenkarte ile git. Master: Not ortalaman 2.7 üzeriyse TU\'lara başvur. ZAB belgesi şart.', link: 'https://www.daad.de/en/', education: { tuition: 'Ücretsiz (~300€ Harç)', workRights: 'Haftada 20 Saat', postGrad: '18 Ay İzin', topUnis: ['TU Munich', 'RWTH Aachen', 'TU Berlin'], note: 'Öğrenciyken "Werkstudent" olarak çalışmak çok yaygındır.' } },
  { id: 'pl', name: 'Polonya', englishName: 'Poland', region: 'Avrupa', tier: 'Tier 1', difficulty: 20, visa: 'Work Permit', tags: ['Ucuz Yaşam', 'Yazılım Hub'], salary: '€25k - €40k', desc: 'Eğitim alırken çalışma iznine ihtiyaç duymadan FULL-TIME çalışabilen nadir ülkelerden.', strategy: 'Master yaparken tam zamanlı yazılımcı olarak çalışabilirsin. Okul ücretleri uygundur.', link: 'https://study.gov.pl/', education: { tuition: '€2k - €4k / Yıl', workRights: 'Limitsiz (Full-Time)', postGrad: '9 Ay İzin', topUnis: ['Warsaw Tech', 'AGH UST'], note: 'Tam zamanlı öğrenciysen çalışma izni almana gerek yok.' } },
  { id: 'it', name: 'İtalya', englishName: 'Italy', region: 'Avrupa', tier: 'Tier 1', difficulty: 25, visa: 'DSU Bursu', tags: ['Burslu Master', 'Otomotiv'], salary: '€28k - €35k', desc: 'DSU Bursu (İhtiyaç bursu) ile okul ücreti ödemezsin, üste para ve yurt alırsın.', strategy: 'Eylül\'de burs başvurusu, Ocak-Mart arası okul başvurusu. Torino mühendislik için ideal.', link: 'https://www.universitaly.it/', education: { tuition: 'Burs ile Bedava', workRights: 'Haftada 20 Saat', postGrad: '12 Ay İzin', topUnis: ['Politecnico di Milano', 'Politecnico di Torino'], note: 'Mezuniyet sonrası iş bulursan vize dönüşümü kolaydır.' } },
  { id: 'nl', name: 'Hollanda', englishName: 'Netherlands', region: 'Avrupa', tier: 'Tier 2', difficulty: 65, visa: 'Orientation Year', tags: ['High Tech', 'ASML'], salary: '€50k - €70k', desc: 'Okullar çok pahalı ama eğitim sonrası "Zoekjaar" vizesi çok değerlidir.', strategy: 'Hollanda burslarına (Orange Tulip) bak yoksa maliyeti yüksektir.', link: 'https://www.studyinnl.org/', education: { tuition: '€15k - €20k / Yıl', workRights: 'Haftada 16 Saat', postGrad: '1 Yıl (Orientation)', topUnis: ['TU Delft', 'TU Eindhoven'], note: 'Part-time iş bulmak bürokratik olabilir (TWV gerekir).' } },
  { id: 'se', name: 'İsveç', englishName: 'Sweden', region: 'Kuzey', tier: 'Tier 2', difficulty: 45, visa: 'Job Seeker', tags: ['İnovasyon', 'Pahalı'], salary: '40k SEK', desc: 'Eğitim kalitesi muazzam ama ücretli. Eşin varsa o tam zamanlı çalışabilir.', strategy: 'Paran varsa Master en iyi yoldur.', link: 'https://studyinsweden.se/', education: { tuition: '€10k - €15k / Yıl', workRights: 'Limitsiz', postGrad: '12 Ay İzin', topUnis: ['KTH', 'Chalmers'], note: 'Öğrenciyken saat sınırı yoktur.' } },
  { id: 'jp', name: 'Japonya', englishName: 'Japan', region: 'Asya', tier: 'Tier 2', difficulty: 60, visa: 'Engineer', tags: ['MEXT Bursu', 'Robotik'], salary: '¥4M+', desc: 'MEXT bursu ile gidersen her şey devletten.', strategy: 'Konsolosluk bursunu takip et.', link: 'https://www.studyinjapan.go.jp/en/', education: { tuition: 'MEXT ile Bedava', workRights: 'Haftada 28 Saat', postGrad: 'İş bulana kadar', topUnis: ['Univ. of Tokyo', 'Tokyo Tech'], note: 'Özel izinle (shikakugai) çalışabilirsin.' } },
  { id: 'ee', name: 'Estonya', englishName: 'Estonia', region: 'Avrupa', tier: 'Tier 2', difficulty: 25, visa: 'Startup Visa', tags: ['Dijital', 'Yazılım'], salary: '€35k', desc: 'Yazılım odaklıysan 1 numara. Master sırasında full-time çalışmak serbest.', strategy: 'TalTech başvurularını kaçırma.', link: 'https://www.studyinestonia.ee/', education: { tuition: '€3k / Yıl (Bazıları ücretsiz)', workRights: 'Limitsiz (Full-Time)', postGrad: '9 Ay', topUnis: ['TalTech', 'Univ. of Tartu'], note: 'Dersleri geçmen şartıyla sınırsız çalışma.' } },
  { id: 'us', name: 'ABD', englishName: 'United States', region: 'Amerika', tier: 'Tier 3', difficulty: 95, visa: 'F1 Visa', tags: ['Pahalı', 'STEM OPT'], salary: '$90k+', desc: 'En pahalı ama en yüksek maaşlı rota.', strategy: 'STEM bölümü okuyup 3 yıl OPT al.', link: 'https://educationusa.state.gov/', education: { tuition: '$30k - $60k / Yıl', workRights: 'Kampüs İçi 20 Saat', postGrad: '3 Yıl (STEM OPT)', topUnis: ['Georgia Tech', 'MIT'], note: 'Kampüs dışı çalışma ilk yıl yasak.' } },
  { id: 'cz', name: 'Çekya', englishName: 'Czechia', region: 'Avrupa', tier: 'Tier 1', difficulty: 30, visa: 'Student Visa', tags: ['Teknik', 'Merkezi'], salary: '€35k', desc: 'Çekçe okursan bedava. İngilizce makul.', strategy: 'CVUT Prag Teknik çok iyidir.', link: 'https://www.studyin.cz/', education: { tuition: '€3k - €5k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['CTU Prague', 'Brno Tech'], note: 'Akredite programda izin gerekmez.' } },
  { id: 'pt', name: 'Portekiz', englishName: 'Portugal', region: 'Avrupa', tier: 'Tier 1', difficulty: 10, visa: 'Job Seeker', tags: ['Ucuz', 'Kolay'], salary: '€20k', desc: 'Avrupa\'ya en kolay giriş.', strategy: 'Job Seeker vizesiyle git, oradan Almanya\'ya başvur.', link: 'https://vistos.mne.gov.pt/', education: { tuition: '€1k - €3k', workRights: 'Haftada 20 Saat', postGrad: 'Kolay Geçiş', topUnis: ['Porto Univ', 'Lisbon IST'], note: 'SEF bildirimi gerekli.' } }
];

const engineerRoles = [
  { title: "Junior Embedded Software Engineer", label: "Gömülü Yazılım" },
  { title: "Junior Firmware Engineer", label: "Firmware" },
  { title: "Junior IoT Engineer", label: "IoT" },
  { title: "Test Automation Engineer Python", label: "Test/Validation" },
  { title: "PLC Automation Engineer", label: "PLC" },
  { title: "System Integration Engineer", label: "Sistem Entegrasyon" }
];

// --- ANA COMPONENT ---
export default function CareerApp() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('career');
  const [selectedRole, setSelectedRole] = useState(engineerRoles[0].title); 
  const [user, setUser] = useState(null);
  const [userNotes, setUserNotes] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting');
  const [currentNote, setCurrentNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const diffDays = Math.ceil(Math.abs(new Date('2026-01-31') - new Date()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (!auth) return;
    signInAnonymously(auth).then((userCredential) => {
        setUser(userCredential.user);
        setDbStatus('connected');
        const unsub = onSnapshot(doc(db, "users", userCredential.user.uid), (docSnapshot) => {
            if (docSnapshot.exists() && docSnapshot.data().notes) {
                setUserNotes(docSnapshot.data().notes);
            }
        });
        return () => unsub();
    }).catch(() => setDbStatus('error'));
  }, []);

  const handleSaveNote = async () => {
    if (!user) return;
    setIsSaving(true);
    const updatedNotes = { ...userNotes, [selectedCountry.id]: currentNote };
    setUserNotes(updatedNotes); 
    try {
        await setDoc(doc(db, "users", user.uid), { notes: updatedNotes }, { merge: true });
        setTimeout(() => setIsSaving(false), 500);
    } catch (e) {
        setIsSaving(false);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      setCurrentNote(userNotes[selectedCountry.id] || '');
    }
  }, [selectedCountry, userNotes]);

  const performGoogleSearch = (country) => {
    const query = `${selectedRole} jobs in ${country.englishName}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const filteredData = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    return allCountries.filter(c => {
      const matchTab = activeTab === 'All' || c.region === activeTab || c.tier === activeTab;
      const countryNameLower = c.name.toLowerCase();
      const tagsMatch = c.tags.some(t => t.toLowerCase().includes(normalizedSearchTerm));
      return matchTab && (countryNameLower.includes(normalizedSearchTerm) || tagsMatch);
    });
  }, [activeTab, searchTerm]);
  
  // İlk yüklemede veya arama sonucunda mobilde seçim yapılı gelmesini engelle, masaüstünde ilkini seç
  useEffect(() => {
      if (filteredData.length === 0) setSelectedCountry(null);
      // Masaüstü kontrolü (window.innerWidth) React'ta bazen hidrasyon hatası verebilir ama basitçe:
      // Burada otomatik seçim yapmıyoruz, kullanıcı tıklasın istiyoruz.
  }, [filteredData]);

  // --- RETURN KISMI (DÜZELTİLMİŞ TASARIM) ---
  return (
    // h-screen yerine h-[100dvh] kullanarak mobildeki tarayıcı çubuğu sorununu çözeriz
    <div className="w-screen h-[100dvh] bg-slate-950 text-slate-200 font-sans overflow-hidden flex relative">
      
      {/* ARKA PLAN EFEKTLERİ */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-200px,#1e293b,transparent)] z-0 pointer-events-none"></div>

      {/* MOBILE OVERLAY (Menü açılınca arkası kararır) */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      
      {/* SIDEBAR */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col shrink-0 h-full`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Zap size={20} fill="currentColor" />
            <span className="text-sm">KARİYER-V9</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400 p-1 hover:bg-white/5 rounded">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-xs font-bold ${dbStatus === 'connected' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400'}`}>
             {dbStatus === 'connected' ? <Cloud size={14}/> : <Loader2 size={14} className="animate-spin"/>}
             <span className="truncate">{dbStatus === 'connected' ? 'Aktif' : 'Bağlanıyor...'}</span>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Bölgeler</h3>
            <div className="space-y-1">
              {['All', 'Avrupa', 'Asya', 'Amerika', 'Kuzey'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeTab === tab ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5'}`}>
                  {tab === 'All' ? 'Tüm' : tab}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Tier</h3>
            <div className="space-y-1">
               {['Tier 1', 'Tier 2', 'Tier 3'].map(tier => (
                <button key={tier} onClick={() => { setActiveTab(tier); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex gap-2 items-center ${activeTab === tier ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-white/5'}`}>
                   <div className={`w-2 h-2 rounded-full ${tier === 'Tier 1' ? 'bg-green-500' : tier === 'Tier 2' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 bg-slate-900/50 shrink-0 pb-8 md:pb-4">
          <div className="bg-slate-800/50 rounded-lg p-2 border border-white/5">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-300">Gün</span>
                <span className="text-xs font-bold text-cyan-400">{diffDays}</span>
             </div>
             <div className="w-full bg-slate-700/50 h-1 rounded-full">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '75%' }}></div>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden z-10 w-full relative">
        
        {/* HEADER */}
        <header className="h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center px-4 gap-4 shrink-0 justify-between md:justify-start">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 p-2 -ml-2">
            <Menu size={24} />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input type="text" placeholder="Ülke ara..." className="w-full bg-slate-950/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-colors" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* LIST VIEW (ÜLKE LİSTESİ) */}
          <div className={`${selectedCountry ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 overflow-y-auto p-3 border-r border-white/5 bg-slate-900/30 custom-scrollbar`}>
            <div className="space-y-2 pb-20 md:pb-0">
              {filteredData.map(country => (
                <div key={country.id} onClick={() => { setSelectedCountry(country); }} className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedCountry?.id === country.id ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/50'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">{country.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {country.region}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(bar => (
                          <div key={bar} className={`w-0.5 h-2 rounded-full ${(country.difficulty / 20) >= bar ? (country.difficulty > 70 ? 'bg-red-500' : country.difficulty > 40 ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-slate-800'}`}/>
                        ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-slate-950/50 border border-white/10 text-slate-300">
                      {country.visa}
                    </span>
                    {country.education.workRights.includes('Limitsiz') && (
                       <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Full-Work
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DETAIL VIEW (DETAY EKRANI) */}
          {selectedCountry && (
            <div className="fixed inset-0 md:static w-full md:flex-1 bg-slate-900 md:bg-transparent z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-200">
              
              {/* Detay Header */}
              <div className="h-40 shrink-0 bg-gradient-to-br from-blue-900/40 to-slate-900 relative flex flex-col justify-end p-6 border-b border-white/5">
                {/* Mobilde Geri Dön Butonu */}
                <button onClick={() => setSelectedCountry(null)} className="absolute top-4 left-4 md:hidden bg-slate-800/80 backdrop-blur border border-white/10 p-2 rounded-full text-white hover:bg-slate-700 transition-colors z-50">
                  <ArrowRight size={18} className="rotate-180" />
                </button>

                <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 w-fit ${selectedCountry.tier === 'Tier 1' ? 'bg-emerald-500/20 text-emerald-400' : selectedCountry.tier === 'Tier 2' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {selectedCountry.tier}
                </div>
                <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">{selectedCountry.name}</h2>
                
                <div className="flex gap-1 bg-slate-950/50 p-1 rounded-lg w-full md:w-auto self-start border border-white/10">
                  <button onClick={() => setViewMode('career')} className={`flex-1 md:flex-none md:w-32 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'career' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    Kariyer
                  </button>
                  <button onClick={() => setViewMode('education')} className={`flex-1 md:flex-none md:w-32 py-1.5 rounded text-xs font-bold transition-all ${viewMode === 'education' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    Akademik
                  </button>
                </div>
              </div>

              {/* Detay İçerik - Scroll Edilebilir Alan */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar pb-20 md:pb-6">
                
                {viewMode === 'career' ? (
                  <div className="max-w-4xl space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-800/30 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-slate-500 mb-1 font-bold tracking-wider">MAAŞ SKALASI</div>
                        <div className="text-sm md:text-base font-bold text-emerald-400">{selectedCountry.salary}</div>
                      </div>
                      <div className="bg-slate-800/30 p-3 rounded-lg border border-white/5">
                        <div className="text-[10px] text-slate-500 mb-1 font-bold tracking-wider">ZORLUK</div>
                        <div className="text-sm md:text-base font-bold text-yellow-400">{selectedCountry.difficulty > 60 ? 'Yüksek' : 'Orta'}</div>
                      </div>
                       <div className="bg-slate-800/30 p-3 rounded-lg border border-white/5 col-span-2">
                        <div className="text-[10px] text-slate-500 mb-1 font-bold tracking-wider">ANA VİZE TÜRÜ</div>
                        <div className="text-sm md:text-base font-bold text-blue-400">{selectedCountry.visa}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <Activity size={14} /> Durum Analizi
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/20 p-4 rounded-lg border border-white/5">{selectedCountry.desc}</p>
                    </div>

                    <div className="bg-gradient-to-r from-cyan-950/30 to-slate-900/30 border border-cyan-500/20 p-4 rounded-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                         <Lightbulb size={60} />
                      </div>
                      <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                        <Zap size={16} /> Önerilen Strateji
                      </h4>
                      <p className="text-xs md:text-sm text-slate-300 leading-relaxed relative z-10">{selectedCountry.strategy}</p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-xs font-bold text-slate-500 uppercase">Pozisyon Araştır</label>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="flex-1 bg-slate-950 border border-white/10 text-slate-200 text-sm rounded-lg p-3 focus:border-cyan-500/50 outline-none">
                            {engineerRoles.map((role) => (
                                <option key={role.title} value={role.title}>{role.label}</option>
                            ))}
                            </select>

                            <button onClick={() => performGoogleSearch(selectedCountry)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20">
                                <Search size={16} />
                                {selectedCountry.name}'da İş Ara
                            </button>
                        </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Yıllık Ücret</span>
                        <span className="text-sm font-bold text-white">{selectedCountry.education.tuition}</span>
                        </div>
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase">Çalışma İzni</span>
                        <span className="text-sm font-bold text-yellow-400">{selectedCountry.education.workRights}</span>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 p-4 rounded-lg">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                         <GraduationCap size={16} /> Top Üniversiteler
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCountry.education.topUnis.map(u => (
                          <div key={u} className="text-xs bg-slate-950 text-slate-300 px-3 py-2 rounded-md border border-white/10 flex items-center gap-2 hover:border-white/20 transition-colors">
                             <Building size={12} className="text-slate-500"/> {u}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTLAR ALANI */}
                <div className="pt-6 border-t border-white/10">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                    <Save size={14} /> Kişisel Notlar
                  </h4>

                  {showNoteInput ? (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 min-h-[100px] focus:border-emerald-500/50 outline-none" placeholder="Bu ülke ile ilgili planlarını yaz..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={handleSaveNote} disabled={isSaving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}
                            {isSaving ? 'Kaydediliyor...' : 'Notu Kaydet'}
                        </button>
                        <button onClick={() => setShowNoteInput(false)} className="px-4 bg-slate-800 text-white py-2 rounded-lg text-sm hover:bg-slate-700">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setShowNoteInput(true)} className="group bg-slate-800/20 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-lg p-4 text-center cursor-pointer min-h-[80px] flex items-center justify-center transition-all">
                      {userNotes[selectedCountry.id] ? (
                          <p className="text-left w-full text-slate-300 text-sm whitespace-pre-wrap">{userNotes[selectedCountry.id]}</p>
                      ) : (
                          <span className="text-slate-500 text-sm group-hover:text-emerald-400 flex items-center gap-2">
                             <Settings size={14} /> Not eklemek için tıkla
                          </span>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    <a href={selectedCountry.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-bold transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                        Resmi Kaynağa Git <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}