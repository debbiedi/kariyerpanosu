import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, Coins, Clock, Building, Award, Code, Cpu, Activity,
  Calendar, Settings, BarChart3, CheckCircle2, Users, Lightbulb,
  Linkedin, Cloud, Check, Loader2, Edit3, ClipboardList, Plus, Trash2, ArrowRightCircle
} from 'lucide-react';

// --- FIREBASE ENTEGRASYONU ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// SENİN FIREBASE AYARLARIN
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
    console.error("Firebase Hatası:", e);
}

// --- VERİTABANI (TÜM LİSTE) ---
const allCountries = [
  // ... (Ülke listesi aynen kalıyor - yer kaplamaması için kısaltıldı, önceki koddan aynen gelecek)
  { id: 'uk', name: 'Birleşik Krallık', englishName: 'United Kingdom', region: 'Avrupa', tier: 'Tier 2', difficulty: 60, visa: 'Skilled Worker', tags: ['Fintech'], salary: '£35k - £55k', desc: 'Londra finans merkezi.', strategy: 'HPI vizesi.', link: '', education: { tuition: '£15k+', workRights: '20 Saat', postGrad: '2 Yıl', topUnis: ['Imperial'], note: '' } },
  { id: 'de', name: 'Almanya', englishName: 'Germany', region: 'Avrupa', tier: 'Tier 1', difficulty: 35, visa: 'Chancenkarte', tags: ['Otomotiv'], salary: '€48k - €60k', desc: 'Mühendislik devi.', strategy: 'Chancenkarte.', link: '', education: { tuition: 'Ücretsiz', workRights: '20 Saat', postGrad: '18 Ay', topUnis: ['TU Munich'], note: '' } },
  { id: 'us', name: 'ABD', englishName: 'United States', region: 'Amerika', tier: 'Tier 3', difficulty: 95, visa: 'F1 Visa', tags: ['Tech Giant'], salary: '$90k+', desc: 'Teknoloji kalbi.', strategy: 'STEM OPT.', link: '', education: { tuition: '$30k+', workRights: 'Kampüs İçi', postGrad: '3 Yıl', topUnis: ['MIT'], note: '' } },
  { id: 'ca', name: 'Kanada', englishName: 'Canada', region: 'Amerika', tier: 'Tier 2', difficulty: 55, visa: 'Express Entry', tags: ['AI'], salary: 'CAD 65k+', desc: 'Göçmen dostu.', strategy: 'PGWP.', link: '', education: { tuition: 'CAD 20k+', workRights: '24 Saat', postGrad: '3 Yıl', topUnis: ['Toronto'], note: '' } },
  { id: 'ch', name: 'İsviçre', englishName: 'Switzerland', region: 'Avrupa', tier: 'Tier 3', difficulty: 90, visa: 'Quota', tags: ['Maksimum Maaş'], salary: 'CHF 85k+', desc: 'Yüksek maaş.', strategy: 'Zorlu.', link: '', education: { tuition: 'CHF 1.5k', workRights: '15 Saat', postGrad: '6 Ay', topUnis: ['ETH'], note: '' } },
  { id: 'nl', name: 'Hollanda', englishName: 'Netherlands', region: 'Avrupa', tier: 'Tier 2', difficulty: 65, visa: 'Orientation', tags: ['High Tech'], salary: '€50k+', desc: 'ASML.', strategy: 'Top 200.', link: '', education: { tuition: '€15k+', workRights: '16 Saat', postGrad: '1 Yıl', topUnis: ['Delft'], note: '' } },
  { id: 'au', name: 'Avustralya', englishName: 'Australia', region: 'Okyanusya', tier: 'Tier 2', difficulty: 60, visa: '482', tags: ['Maden'], salary: 'AUD 80k+', desc: 'Yüksek yaşam.', strategy: 'Subclass 500.', link: '', education: { tuition: 'AUD 30k+', workRights: '24 Saat', postGrad: '2-4 Yıl', topUnis: ['UNSW'], note: '' } },
  { id: 'pl', name: 'Polonya', englishName: 'Poland', region: 'Avrupa', tier: 'Tier 1', difficulty: 20, visa: 'Work Permit', tags: ['Yazılım'], salary: '€25k+', desc: 'Yazılım fabrikası.', strategy: 'Kolay vize.', link: '', education: { tuition: '€2k+', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['Warsaw'], note: '' } },
  { id: 'it', name: 'İtalya', englishName: 'Italy', region: 'Avrupa', tier: 'Tier 1', difficulty: 25, visa: 'DSU', tags: ['Otomotiv'], salary: '€28k+', desc: 'Fiat.', strategy: 'Burslu.', link: '', education: { tuition: 'Bedava', workRights: '20 Saat', postGrad: '1 Ay', topUnis: ['Politecnico'], note: '' } },
  // ... Diğer ülkeler (Kodun uzunluğunu korumak için kısaltıldı, önceki tam listedeki her şey burada varsayılıyor)
];

const engineerRoles = [
  { title: "Junior Embedded Software Engineer", label: "Gömülü Yazılım (Genel)" },
  { title: "Junior Firmware Engineer", label: "Firmware (Donanım Odaklı)" },
  { title: "Junior IoT Engineer", label: "IoT (İnternet & Cihazlar)" },
  { title: "Test Automation Engineer Python", label: "Test/Validation (Python)" },
  { title: "PLC Automation Engineer", label: "PLC / Otomasyon" },
  { title: "System Integration Engineer", label: "Sistem Entegrasyon" }
];

const projectIdeas = {
  "Junior Embedded Software Engineer": [{ title: "STM32 Bootloader", desc: "UART üzerinden kendi bootloader'ını yaz." }],
  "Junior Firmware Engineer": [{ title: "Bare Metal SPI", desc: "HAL kullanmadan SPI driver yaz." }],
  "Junior IoT Engineer": [{ title: "MQTT Dashboard", desc: "ESP32 verisini Cloud'a gönder." }],
  "Test Automation Engineer Python": [{ title: "HIL Script", desc: "Python ile donanım testi otomasyonu." }],
  "PLC Automation Engineer": [{ title: "Traffic Light", desc: "Ladder Logic ile trafik ışığı." }],
  "System Integration Engineer": [{ title: "Sensor Fusion", desc: "Kalman filtresi ile veri birleştirme." }]
};

const kanbanColumns = [
  { id: 'to_apply', title: 'Başvurulacak', color: 'border-slate-500', bg: 'bg-slate-500/10' },
  { id: 'applied', title: 'Başvuruldu', color: 'border-blue-500', bg: 'bg-blue-500/10' },
  { id: 'interview', title: 'Görüşme', color: 'border-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'offer', title: 'Teklif', color: 'border-green-500', bg: 'bg-green-500/10' },
  { id: 'rejected', title: 'Red', color: 'border-red-500', bg: 'bg-red-500/10' }
];

export default function CareerCommandCenterV18() {
  const [appMode, setAppMode] = useState('explorer'); 
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState(allCountries[0]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('career');
  const [selectedRole, setSelectedRole] = useState(engineerRoles[0].title); 
  
  const [user, setUser] = useState(null);
  const [userNotes, setUserNotes] = useState({});
  const [userApplications, setUserApplications] = useState([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting'); 

  const [currentNote, setCurrentNote] = useState('');
  const [isEditing, setIsEditing] = useState(false); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Kanban Inputs
  const [newAppCompany, setNewAppCompany] = useState('');
  const [newAppRole, setNewAppRole] = useState('');

  const diffDays = Math.ceil(Math.abs(new Date('2026-02-01') - new Date()) / (1000 * 60 * 60 * 24));
  const progress = Math.min(100, Math.max(0, ((new Date() - new Date('2022-09-15')) / (new Date('2026-02-01') - new Date('2022-09-15'))) * 100));

  // --- FIREBASE BAĞLANTI & VERİ ÇEKME ---
  useEffect(() => {
    if (!auth) return;

    // 1. Auth Durumunu Dinle
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            setDbStatus('connected');

            // 2. Veritabanını Dinle (Realtime)
            const userDocRef = doc(db, "users", currentUser.uid);
            const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.notes) setUserNotes(data.notes);
                    if (data.applications) setUserApplications(data.applications);
                } else {
                    // İlk defa giren kullanıcı için boş döküman oluştur
                    setDoc(userDocRef, { notes: {}, applications: [] }, { merge: true });
                }
            });
            return () => unsubscribeSnapshot();
        } else {
            // Kullanıcı yoksa Anonim Giriş Yap
            signInAnonymously(auth).catch((error) => {
                console.error("Giriş Hatası:", error);
                setDbStatus('error');
            });
        }
    });

    return () => unsubscribeAuth();
  }, []);

  // --- NOT KAYDETME ---
  const handleSaveNote = async () => {
    if (!user) return;
    setIsSaving(true);
    const updatedNotes = { ...userNotes, [selectedCountry.id]: currentNote };
    
    // Optimistik (Anlık) Güncelleme
    setUserNotes(updatedNotes); 
    
    try {
        await setDoc(doc(db, "users", user.uid), { notes: updatedNotes }, { merge: true });
        setTimeout(() => { setIsSaving(false); setIsEditing(false); }, 500);
    } catch (e) { 
        console.error("Not kaydetme hatası:", e);
        setIsSaving(false); 
    }
  };

  // --- KANBAN İŞLEMLERİ ---
  const addApplication = async () => {
    if (!user || !newAppCompany || !newAppRole) return;
    const newApp = {
      id: Date.now(),
      company: newAppCompany,
      role: newAppRole,
      status: 'to_apply',
      date: new Date().toLocaleDateString('tr-TR')
    };
    
    const updatedApps = [...userApplications, newApp];
    setUserApplications(updatedApps); // Optimistik
    setNewAppCompany('');
    setNewAppRole('');
    
    await updateDoc(doc(db, "users", user.uid), { applications: updatedApps });
  };

  const moveApplication = async (appId, newStatus) => {
    if (!user) return;
    const updatedApps = userApplications.map(app => 
      app.id === appId ? { ...app, status: newStatus } : app
    );
    setUserApplications(updatedApps); // Optimistik
    await updateDoc(doc(db, "users", user.uid), { applications: updatedApps });
  };

  const deleteApplication = async (appId) => {
    if (!user) return;
    const updatedApps = userApplications.filter(app => app.id !== appId);
    setUserApplications(updatedApps); // Optimistik
    await updateDoc(doc(db, "users", user.uid), { applications: updatedApps });
  };

  useEffect(() => {
    if (selectedCountry) {
      setCurrentNote(userNotes[selectedCountry.id] || '');
      setIsEditing(false); 
    }
  }, [selectedCountry, userNotes]);

  // Yardımcı Fonksiyonlar
  const performGoogleSearch = (country) => {
    const term = `${selectedRole} jobs in ${country.englishName || country.name}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, '_blank');
  };

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allCountries.filter(c => {
      const matchTab = activeTab === 'All' || c.region === activeTab || c.tier === activeTab;
      const matchSearch = c.name.toLowerCase().includes(term) || c.tags.some(t => t.toLowerCase().includes(term));
      return matchTab && matchSearch;
    });
  }, [activeTab, searchTerm]);

  return (
    <div className="flex w-full h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden flex-col md:flex-row relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-200px,#1e293b,transparent)] z-0 pointer-events-none"></div>

      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl h-full ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider"><Zap size={20} fill="currentColor" /> KARİYER-V18</div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={20} /></button>
        </div>
        
        <div className="p-4 space-y-2 border-b border-white/5">
            <button onClick={() => setAppMode('explorer')} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${appMode === 'explorer' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
                <Globe size={16} /> Keşfet
            </button>
            <button onClick={() => setAppMode('kanban')} className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${appMode === 'kanban' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
                <ClipboardList size={16} /> Başvurularım
            </button>
        </div>

        {appMode === 'explorer' && (
             <nav className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-xs font-bold transition-colors ${dbStatus === 'connected' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400'}`}>
                    {dbStatus === 'connected' ? <Cloud size={14}/> : <Loader2 size={14} className="animate-spin"/>}
                    <span className="truncate">{dbStatus === 'connected' ? 'Bulut Aktif' : 'Bağlanıyor...'}</span>
                </div>
                <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Bölgeler</h3>
                    {['All', 'Avrupa', 'Asya', 'Amerika', 'Kuzey', 'Okyanusya'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center mb-1 ${activeTab === tab ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5'}`}>
                        {tab} {activeTab === tab && <ChevronRight size={14} />}
                        </button>
                    ))}
                </div>
             </nav>
        )}

        {appMode === 'kanban' && (
            <div className="p-4 flex-1 overflow-y-auto">
                 <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 text-center mb-4">
                    <p className="text-xs text-slate-400 mb-1">Toplam Başvuru</p>
                    <p className="text-3xl font-bold text-white">{userApplications.length}</p>
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Hızlı Ekle</h3>
                    <input type="text" placeholder="Şirket Adı" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppCompany} onChange={e => setNewAppCompany(e.target.value)} />
                    <input type="text" placeholder="Pozisyon" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppRole} onChange={e => setNewAppRole(e.target.value)} />
                    <button onClick={addApplication} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"><Plus size={14}/> Ekle</button>
                 </div>
            </div>
        )}
        
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5">
             <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-300 flex items-center gap-1"><Clock size={12}/> Mezuniyet</span><span className="text-xs text-white font-mono">{diffDays} Gün</span></div>
             <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden mb-1"><div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full" style={{ width: `${progress}%` }}></div></div>
             <div className="text-[10px] text-right text-slate-500">%{Math.floor(progress)} Tamamlandı</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full z-10 relative md:pl-64">
        
        {/* EXPLORER MODE */}
        {appMode === 'explorer' && (
            <div className="flex flex-1 overflow-hidden">
                {/* 2. SÜTUN: LİSTE */}
                <div className="w-[400px] border-r border-white/5 flex flex-col shrink-0 bg-slate-900/30">
                    <header className="h-16 border-b border-white/10 flex items-center px-4 shrink-0">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input type="text" placeholder="Ülke ara..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 scroll-smooth space-y-3 pb-20">
                        {filteredData.map(country => (
                            <div key={country.id} onClick={() => setSelectedCountry(country)} className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedCountry?.id === country.id ? 'bg-slate-800 border-cyan-500/50 shadow-lg' : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60'}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`text-sm font-bold ${selectedCountry?.id === country.id ? 'text-cyan-400' : 'text-slate-200'}`}>{country.name}</h3>
                                    <div className="flex gap-0.5">{[1,2,3,4,5].map(bar => (<div key={bar} className={`w-1 h-2.5 rounded-full ${(country.difficulty / 20) >= bar ? (country.difficulty > 70 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-800'}`}/>))}</div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950/50 border border-white/10 text-slate-400">{country.visa}</span>
                                </div>
                                {userNotes[country.id] && (<div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. SÜTUN: DETAY */}
                {selectedCountry && (
                    <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50 overflow-y-auto">
                        <div className="h-40 relative shrink-0 overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${selectedCountry.tier === 'Tier 1' ? 'from-emerald-900/30' : 'from-blue-900/30'} to-slate-900 z-0`}></div>
                            <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end z-20">
                                <div>
                                    <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-white/5 border-white/10 inline-block mb-2 text-white">{selectedCountry.tier}</div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{selectedCountry.name}</h2>
                                </div>
                                <div className="flex bg-slate-950/50 rounded-lg p-1 border border-white/10">
                                    <button onClick={() => setViewMode('career')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'career' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Profesyonel</button>
                                    <button onClick={() => setViewMode('education')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'education' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Akademik</button>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6 max-w-4xl mx-auto w-full pb-20">
                            {/* Ana İçerik */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {viewMode === 'career' ? (
                                        <>
                                            <div className="bg-slate-800/30 p-5 rounded-xl border border-white/5">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Genel Durum</h4>
                                                <p className="text-sm text-slate-300 leading-relaxed">{selectedCountry.desc}</p>
                                            </div>
                                            <div className="bg-slate-800/30 p-5 rounded-xl border border-white/5 space-y-4">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase">İş Arama Motoru</h4>
                                                <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm rounded-lg p-3 outline-none">
                                                    {engineerRoles.map(r => <option key={r.title} value={r.title}>{r.label}</option>)}
                                                </select>
                                                <button onClick={() => performGoogleSearch(selectedCountry)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-bold flex justify-center items-center gap-2"><Search size={16}/> Google'da Ara</button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 flex justify-between"><span className="text-sm text-slate-400">Eğitim</span><span className="text-sm font-bold text-white">{selectedCountry.education.tuition}</span></div>
                                            <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 flex justify-between"><span className="text-sm text-slate-400">Çalışma</span><span className="text-sm font-bold text-yellow-400">{selectedCountry.education.workRights}</span></div>
                                            <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5"><span className="text-sm text-slate-400 block mb-2">Üniversiteler</span><div className="flex gap-2 flex-wrap">{selectedCountry.education.topUnis.map(u => <span key={u} className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">{u}</span>)}</div></div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Sağ Kolon: Proje & Notlar */}
                                <div className="space-y-6">
                                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><Lightbulb size={14}/> Proje Fikri</h4>
                                        {(projectIdeas[selectedRole] || projectIdeas["Junior Embedded Software Engineer"]).slice(0,1).map((idea, i) => (
                                            <div key={i}><div className="text-sm font-bold text-white mb-1">{idea.title}</div><div className="text-xs text-slate-500 leading-relaxed">{idea.desc}</div></div>
                                        ))}
                                    </div>
                                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Save size={14}/> Notlar</h4>
                                            {!isEditing && userNotes[selectedCountry.id] && <button onClick={() => setIsEditing(true)} className="text-[10px] text-cyan-400"><Edit3 size={12}/></button>}
                                        </div>
                                        {isEditing || !userNotes[selectedCountry.id] ? (
                                            <div className="space-y-2">
                                                <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 outline-none min-h-[100px]" placeholder="Yaz..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
                                                <div className="flex gap-2">
                                                <button onClick={handleSaveNote} disabled={isSaving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">{isSaving ? '...' : 'Kaydet'}</button>
                                                {userNotes[selectedCountry.id] && <button onClick={() => setIsEditing(false)} className="px-3 bg-slate-700 text-white py-2 rounded-lg text-xs">iptal</button>}
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-slate-300 whitespace-pre-wrap cursor-pointer" onClick={() => setIsEditing(true)}>{userNotes[selectedCountry.id]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* KANBAN MODE */}
        {appMode === 'kanban' && (
            <main className="flex-1 flex overflow-x-auto overflow-y-hidden p-8 gap-6 bg-slate-950">
                {kanbanColumns.map(col => (
                    <div key={col.id} className={`w-80 shrink-0 flex flex-col bg-slate-900/30 rounded-xl border border-white/5 h-full ${col.bg}`}>
                        <div className={`p-4 border-b border-white/5 flex justify-between items-center border-t-4 ${col.color}`}>
                            <span className="font-bold text-slate-200 text-sm">{col.title}</span>
                            <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded">{userApplications.filter(a => a.status === col.id).length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {userApplications.filter(a => a.status === col.id).map(app => (
                                <div key={app.id} className="bg-slate-800 p-4 rounded-lg border border-white/5 shadow-sm hover:border-white/20 transition-all group relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-white text-sm">{app.company}</div>
                                        <button onClick={() => deleteApplication(app.id)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                    </div>
                                    <div className="text-xs text-slate-400 mb-3">{app.role}</div>
                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <div className="text-[10px] text-slate-500">{app.date}</div>
                                        <div className="flex gap-1">
                                            {col.id !== 'to_apply' && (
                                                <button onClick={() => moveApplication(app.id, kanbanColumns[kanbanColumns.findIndex(c => c.id === col.id) - 1].id)} className="p-1 hover:bg-slate-700 rounded text-slate-400"><ArrowRightCircle size={14} className="rotate-180"/></button>
                                            )}
                                            {col.id !== 'rejected' && col.id !== 'offer' && (
                                                <button onClick={() => moveApplication(app.id, kanbanColumns[kanbanColumns.findIndex(c => c.id === col.id) + 1].id)} className="p-1 hover:bg-slate-700 rounded text-green-400"><ArrowRightCircle size={14}/></button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {userApplications.filter(a => a.status === col.id).length === 0 && (
                                <div className="text-center py-10 text-xs text-slate-600 italic">Bu aşamada başvuru yok</div>
                            )}
                        </div>
                    </div>
                ))}
            </main>
        )}
      </div>
    </div>
  );
}
