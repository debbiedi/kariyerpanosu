import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, Coins, Clock, Building, Award, Code, Cpu, Activity,
  Calendar, Settings, BarChart3, CheckCircle2, Users, Lightbulb,
  Linkedin, Cloud, Check, Loader2, Edit3
} from 'lucide-react';

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

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
    }).catch((error) => {
        console.error("Giriş Hatası:", error);
        setDbStatus('error');
    });
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
        console.error("Yazma hatası:", e);
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
  
  useEffect(() => {
      if (filteredData.length === 0) setSelectedCountry(null);
      else if (selectedCountry && !filteredData.find(c => c.id === selectedCountry.id)) setSelectedCountry(filteredData[0]);
      else if (!selectedCountry && filteredData.length > 0) setSelectedCountry(filteredData[0]);
  }, [filteredData]);

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden flex flex-col md:flex-row relative">
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-200px,#1e293b,transparent)] z-0 pointer-events-none"></div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      
      {/* SIDEBAR */}
      <div className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 flex flex-col shrink-0 h-screen md:h-full`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Zap size={20} fill="currentColor" />
            <span className="text-sm">KARİYER-V9</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-xs font-bold ${dbStatus === 'connected' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400'}`}>
             {dbStatus === 'connected' ? <Cloud size={14}/> : <Loader2 size={14} className="animate-spin"/>}
             <span className="truncate">{dbStatus === 'connected' ? 'Veritabanı Aktif' : 'Bağlanıyor...'}</span>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Bölgeler</h3>
            <div className="space-y-1">
              {['All', 'Avrupa', 'Asya', 'Amerika', 'Kuzey'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5'}`}>
                  {tab === 'All' ? 'Tüm Dünyalar' : tab}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Tier</h3>
            <div className="space-y-1">
               {['Tier 1', 'Tier 2', 'Tier 3'].map(tier => (
                <button key={tier} onClick={() => { setActiveTab(tier); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex gap-2 items-center ${activeTab === tier ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-white/5'}`}>
                   <div className={`w-2 h-2 rounded-full ${tier === 'Tier 1' ? 'bg-green-500' : tier === 'Tier 2' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10 bg-slate-900/50 shrink-0">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Clock size={12} className="text-cyan-400" /> Gün
                </span>
                <span className="text-xs font-bold text-white">{diffDays}</span>
             </div>
             <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full" style={{ width: '75%' }}></div>
             </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full z-10">
        
        {/* HEADER */}
        <header className="h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center px-4 gap-4 shrink-0">
          <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400">
            <Menu size={24} />
          </button>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input type="text" placeholder="Ülke ara..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 flex overflow-hidden min-h-0">
          
          {/* LIST COLUMN - MOBILE: full width when no selection, MD+: fixed width */}
          <div className={`${selectedCountry && 'hidden md:flex'} flex-col w-full md:w-[400px] md:flex-none overflow-y-auto p-3 md:p-4 border-r border-white/5 bg-slate-900/30 scroll-smooth`}>
            <div className="space-y-3">
              {filteredData.map(country => (
                <div key={country.id} onClick={() => { setSelectedCountry(country); setMobileMenuOpen(false); }} className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedCountry?.id === country.id ? 'bg-slate-800/80 border-cyan-500/50' : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`text-sm font-bold ${selectedCountry?.id === country.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {country.name}
                      </h3>
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
                  
                  <div className="flex flex-wrap gap-1">
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

          {/* DETAIL COLUMN - MOBILE: fixed overlay, MD+: normal */}
          {selectedCountry && (
            <div className="fixed inset-0 md:static md:inset-auto w-full md:w-[500px] md:flex-none bg-slate-900/95 backdrop-blur-xl flex flex-col z-50 md:z-auto border-l border-white/10">
              
              <div className="h-40 md:h-48 shrink-0 bg-gradient-to-br from-blue-900/40 to-slate-900 relative">
                <button onClick={() => setSelectedCountry(null)} className="absolute top-4 left-4 md:hidden bg-black/50 p-2 rounded-full text-white">
                  <ArrowRight size={18} className="rotate-180" />
                </button>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${selectedCountry.tier === 'Tier 1' ? 'bg-emerald-500/20 text-emerald-400' : selectedCountry.tier === 'Tier 2' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedCountry.tier}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedCountry.name}</h2>
                  
                  <div className="flex gap-1 mt-3">
                    <button onClick={() => setViewMode('career')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'career' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      Prof.
                    </button>
                    <button onClick={() => setViewMode('education')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'education' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      Akad.
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-20 md:pb-6">
                
                {viewMode === 'career' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-white/5">
                        <div className="text-[9px] text-slate-500 mb-0.5 font-bold">MAAŞ</div>
                        <div className="text-xs font-bold text-emerald-400">{selectedCountry.salary}</div>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-white/5">
                        <div className="text-[9px] text-slate-500 mb-0.5 font-bold">ZORLUK</div>
                        <div className="text-xs font-bold text-yellow-400">{selectedCountry.difficulty > 60 ? 'Yüksek' : 'Orta'}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Durum</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedCountry.desc}</p>
                    </div>

                    <div className="bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-lg">
                      <h4 className="text-xs font-bold text-cyan-400 mb-1">Strateji</h4>
                      <p className="text-[10px] text-slate-300">{selectedCountry.strategy}</p>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                       <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Pozisyon</label>
                       <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs rounded-lg p-2 mb-2">
                         {engineerRoles.map((role) => (
                           <option key={role.title} value={role.title}>{role.label}</option>
                         ))}
                       </select>

                       <button onClick={() => performGoogleSearch(selectedCountry)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2">
                        <Search size={12} />
                        İş Ara
                       </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 p-2 rounded-lg border border-white/5 flex justify-between">
                      <span className="text-[9px] font-bold text-slate-400">ÜCRET</span>
                      <span className="text-xs font-bold text-white">{selectedCountry.education.tuition}</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 rounded-lg border border-white/5 flex justify-between">
                      <span className="text-[9px] font-bold text-slate-400">ÇALIŞMA</span>
                      <span className="text-xs font-bold text-yellow-400">{selectedCountry.education.workRights}</span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">OKULLAR</h4>
                      <div className="space-y-1">
                        {selectedCountry.education.topUnis.map(u => (
                          <div key={u} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-1 rounded border border-white/10">{u}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">NOTLAR</h4>

                  {showNoteInput ? (
                    <div className="space-y-2">
                      <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 min-h-[60px]" placeholder="Not ekle..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={handleSaveNote} disabled={isSaving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-1.5 rounded text-xs font-bold">
                            {isSaving ? <Loader2 size={12} className="animate-spin inline" /> : 'Kaydet'}
                        </button>
                        <button onClick={() => setShowNoteInput(false)} className="flex-1 bg-slate-800 text-white py-1.5 rounded text-xs">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setShowNoteInput(true)} className="bg-slate-800/30 border border-dashed border-slate-600 rounded-lg p-2 text-xs text-slate-400 text-center cursor-pointer min-h-[50px] flex items-center justify-center">
                      {userNotes[selectedCountry.id] ? (
                          <p className="text-left text-slate-300">{userNotes[selectedCountry.id]}</p>
                      ) : (
                          <span>Not ekle</span>
                      )}
                    </div>
                  )}

                  <a href={selectedCountry.link} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 w-full bg-white text-slate-900 py-2 rounded-lg font-bold text-xs">
                    Kaynak <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
