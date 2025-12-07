import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, Coins, Clock, Building, Award, Code, Cpu, Activity,
  Calendar, Settings, BarChart3, CheckCircle2, Users, Lightbulb,
  Linkedin, Cloud, Check, Loader2, Edit3
} from 'lucide-react';

// --- FIREBASE BAĞLANTISI ---
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
    console.error("Firebase Hatası:", e);
}

// --- VERİTABANI (TÜM LİSTE) ---
const allCountries = [
  // TIER 1 & POPÜLER
  {
    id: 'uk', name: 'Birleşik Krallık', englishName: 'United Kingdom', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 60, visa: 'Skilled Worker', tags: ['Fintech', 'Savunma'], salary: '£35k - £55k',
    desc: 'Londra finans ve teknoloji başkenti. "High Potential Individual" vizesi büyük fırsattır.',
    strategy: 'HPI vizesini veya "Graduate Visa" veren bir Master programını hedefle.',
    link: 'https://www.gov.uk/browse/visas-immigration/work-visas',
    education: { tuition: '£15k - £25k', workRights: '20 Saat', postGrad: '2 Yıl', topUnis: ['Imperial', 'Manchester'], note: 'Mezuniyet sonrası 2 yıl izin.' }
  },
  {
    id: 'de', name: 'Almanya', englishName: 'Germany', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 35, visa: 'Chancenkarte', tags: ['Otomotiv', 'Sanayi 4.0'], salary: '€48k - €60k',
    desc: 'Mühendislik devi. TU9 üniversiteleri ücretsizdir.',
    strategy: 'İş: Chancenkarte. Master: Not ortalaman 2.7 üzeriyse başvur.',
    link: 'https://www.daad.de/en/',
    education: { tuition: 'Ücretsiz', workRights: '20 Saat', postGrad: '18 Ay', topUnis: ['TU Munich', 'RWTH Aachen'], note: 'Werkstudent yaygındır.' }
  },
  {
    id: 'us', name: 'ABD', englishName: 'United States', region: 'Amerika', 
    tier: 'Tier 3', difficulty: 95, visa: 'F1 Visa', tags: ['Tech Giant'], salary: '$90k - $120k',
    desc: 'Teknolojinin kalbi. En yüksek maaşlar burada.',
    strategy: 'STEM Master yapıp 3 yıl çalışma izni (OPT) al.',
    link: 'https://educationusa.state.gov/', 
    education: { tuition: '$30k+', workRights: 'Kampüs İçi', postGrad: '3 Yıl (STEM OPT)', topUnis: ['MIT', 'Stanford'], note: 'OPT hayati önem taşır.' }
  },
  {
    id: 'ca', name: 'Kanada', englishName: 'Canada', region: 'Amerika', 
    tier: 'Tier 2', difficulty: 55, visa: 'Express Entry', tags: ['Göçmen Dostu'], salary: 'CAD 65k - 90k',
    desc: 'Toronto ve Vancouver teknoloji merkezleri. Göçmenlik politikaları şeffaf.',
    strategy: 'Master sonrası PGWP (Çalışma izni) almak vatandaşlığa götürür.',
    link: 'https://www.canada.ca/', 
    education: { tuition: 'CAD 20k+', workRights: '24 Saat', postGrad: '3 Yıl (PGWP)', topUnis: ['U of Toronto', 'Waterloo'], note: 'Eğitim süresi kadar izin.' }
  },
  {
    id: 'ch', name: 'İsviçre', englishName: 'Switzerland', region: 'Avrupa', 
    tier: 'Tier 3', difficulty: 90, visa: 'Quota', tags: ['Maksimum Maaş'], salary: 'CHF 85k+',
    desc: 'Avrupa\'nın en yüksek maaşları. Google, ABB ve Roche burada.',
    strategy: 'Doğrudan girmek zordur. Almanya üzerinden geçiş yap.',
    link: 'https://www.sem.admin.ch/', 
    education: { tuition: 'CHF 1.5k', workRights: '15 Saat', postGrad: '6 Ay', topUnis: ['ETH Zurich', 'EPFL'], note: 'Okul ucuz, yaşam pahalı.' }
  },
  {
    id: 'nl', name: 'Hollanda', englishName: 'Netherlands', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 65, visa: 'Orientation Year', tags: ['High Tech'], salary: '€50k - €70k',
    desc: 'ASML ve Philips burada. Teknoloji çok ileri.',
    strategy: 'Top 200 üniversite mezunuysan "Orientation Year" alabilirsin.',
    link: 'https://www.studyinnl.org/',
    education: { tuition: '€15k+', workRights: '16 Saat', postGrad: '1 Yıl', topUnis: ['TU Delft', 'Eindhoven'], note: 'Part-time iş zordur.' }
  },
  {
    id: 'au', name: 'Avustralya', englishName: 'Australia', region: 'Okyanusya', tier: 'Tier 2', difficulty: 60, visa: 'Subclass 482', tags: ['Yüksek Yaşam'], salary: 'AUD 80k+', desc: 'Mühendisler için "Skilled Occupation List" açık.', strategy: 'Master (Subclass 500) en iyi giriş.', link: 'https://immi.homeaffairs.gov.au/', education: { tuition: 'AUD 30k+', workRights: '24 Saat', postGrad: '2-4 Yıl', topUnis: ['UNSW', 'Melbourne'], note: 'Tatillerde full-time.' }
  },
  // --- DİĞER AVRUPA ---
  {
    id: 'pl', name: 'Polonya', englishName: 'Poland', region: 'Avrupa', tier: 'Tier 1', difficulty: 20, visa: 'Work Permit', tags: ['Yazılım'], salary: '€25k - €40k', desc: 'Avrupa\'nın yazılım fabrikası. Vize kolay.', strategy: 'Master yaparken full-time çalışabilirsin.', link: 'https://study.gov.pl/', education: { tuition: '€2k - €4k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['Warsaw Tech'], note: 'İzin gerekmez.' }
  },
  {
    id: 'it', name: 'İtalya', englishName: 'Italy', region: 'Avrupa', tier: 'Tier 1', difficulty: 25, visa: 'DSU Bursu', tags: ['Burs', 'Otomotiv'], salary: '€28k - €35k', desc: 'DSU Bursu ile bedava okuyup cep harçlığı al.', strategy: 'Torino (Fiat) ideal.', link: 'https://www.universitaly.it/', education: { tuition: 'Bursla Bedava', workRights: '20 Saat', postGrad: '12 Ay', topUnis: ['Politecnico di Milano'], note: 'Burslar Eylülde.' }
  },
  {
    id: 'se', name: 'İsveç', englishName: 'Sweden', region: 'Kuzey', tier: 'Tier 2', difficulty: 45, visa: 'Job Seeker', tags: ['İnovasyon'], salary: '40k SEK', desc: 'Ericsson ve Volvo burada.', strategy: 'İş arama vizesi var.', link: 'https://studyinsweden.se/', education: { tuition: '€10k+', workRights: 'Limitsiz', postGrad: '12 Ay', topUnis: ['KTH'], note: 'Sınır yok.' }
  },
  {
    id: 'no', name: 'Norveç', englishName: 'Norway', region: 'Kuzey', tier: 'Tier 2', difficulty: 65, visa: 'Skilled Worker', tags: ['Enerji'], salary: '€55k+', desc: 'Mühendis maaşları çok yüksek.', strategy: 'İş teklifi şart.', link: 'https://www.udi.no/', education: { tuition: 'Ücretli', workRights: '20 Saat', postGrad: '1 Yıl', topUnis: ['NTNU'], note: 'Yaşam pahalı.' }
  },
  {
    id: 'fi', name: 'Finlandiya', englishName: 'Finland', region: 'Kuzey', tier: 'Tier 2', difficulty: 50, visa: 'Specialist', tags: ['Telekom'], salary: '€40k+', desc: 'Nokia\'nın evi. 5G/6G.', strategy: 'Finland Works programı.', link: 'https://migri.fi/', education: { tuition: '€10k+', workRights: '30 Saat', postGrad: '2 Yıl', topUnis: ['Aalto'], note: 'Çalışma saati arttı.' }
  },
  {
    id: 'dk', name: 'Danimarka', englishName: 'Denmark', region: 'Kuzey', tier: 'Tier 2', difficulty: 55, visa: 'Positive List', tags: ['Rüzgar'], salary: '€50k+', desc: 'Vestas ve Lego burada.', strategy: 'Kopenhag çevresine odaklan.', link: 'https://www.nyidanmark.dk/', education: { tuition: '€6k+', workRights: '20 Saat', postGrad: '3 Yıl', topUnis: ['DTU'], note: 'Mezuniyette 3 yıl izin.' }
  },
  {
    id: 'ie', name: 'İrlanda', englishName: 'Ireland', region: 'Avrupa', tier: 'Tier 2', difficulty: 45, visa: 'Critical Skills', tags: ['Big Tech'], salary: '€40k+', desc: 'Google, Meta Avrupa merkezi.', strategy: 'Critical Skills vizesi.', link: 'https://enterprise.gov.ie/', education: { tuition: '€12k+', workRights: '20 Saat', postGrad: '2 Yıl', topUnis: ['Trinity'], note: 'Mezuniyet sonrası 2 yıl.' }
  },
  {
    id: 'fr', name: 'Fransa', englishName: 'France', region: 'Avrupa', tier: 'Tier 2', difficulty: 50, visa: 'Passeport Talent', tags: ['Havacılık'], salary: '€40k+', desc: 'Airbus, Thales.', strategy: 'B1 Fransızca öğren.', link: 'https://france-visas.gouv.fr/', education: { tuition: '€243+', workRights: '20 Saat', postGrad: '1 Yıl', topUnis: ['CentraleSupélec'], note: 'Devlet okulları ucuz.' }
  },
  {
    id: 'at', name: 'Avusturya', englishName: 'Austria', region: 'Avrupa', tier: 'Tier 2', difficulty: 50, visa: 'RWR Card', tags: ['Yarı İletken'], salary: '€45k+', desc: 'Infineon gibi çip üreticileri.', strategy: 'B1 Almanca avantaj.', link: 'https://www.migration.gv.at/', education: { tuition: '€1.5k', workRights: '20 Saat', postGrad: '1 Yıl', topUnis: ['TU Wien'], note: 'Eğitim makul.' }
  },
  {
    id: 'be', name: 'Belçika', englishName: 'Belgium', region: 'Avrupa', tier: 'Tier 2', difficulty: 45, visa: 'Single Permit', tags: ['Mikroelektronik'], salary: '€40k+', desc: 'IMEC Leuven\'dedir.', strategy: 'IMEC stajlarına başvur.', link: 'https://www.international.socialsecurity.be/', education: { tuition: '€1k-4k', workRights: '20 Saat', postGrad: '1 Yıl', topUnis: ['KU Leuven'], note: 'KU Leuven çok iyi.' }
  },
  {
    id: 'es', name: 'İspanya', englishName: 'Spain', region: 'Avrupa', tier: 'Tier 2', difficulty: 40, visa: 'Highly Qualified', tags: ['Telekom'], salary: '€30k+', desc: 'Yenilenebilir enerji.', strategy: 'Barselona ve Madrid.', link: 'https://www.exteriores.gob.es/', education: { tuition: '€2k-5k', workRights: '30 Saat', postGrad: '1 Yıl', topUnis: ['UPC'], note: 'Çalışma izni kolaylaştı.' }
  },
  {
    id: 'ee', name: 'Estonya', englishName: 'Estonia', region: 'Avrupa', tier: 'Tier 2', difficulty: 25, visa: 'Startup', tags: ['Dijital'], salary: '€35k', desc: 'Yazılım odaklı.', strategy: 'TalTech başvur.', link: 'https://www.studyinestonia.ee/', education: { tuition: '€3k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['TalTech'], note: 'Sınırsız çalışma.' }
  },
  {
    id: 'cz', name: 'Çekya', englishName: 'Czechia', region: 'Avrupa', tier: 'Tier 1', difficulty: 30, visa: 'Student Visa', tags: ['Teknik'], salary: '€35k', desc: 'Otomotiv güçlü.', strategy: 'CVUT Prag.', link: 'https://www.studyin.cz/', education: { tuition: '€3k-5k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['CTU Prague'], note: 'Akredite program.' }
  },
  {
    id: 'pt', name: 'Portekiz', englishName: 'Portugal', region: 'Avrupa', tier: 'Tier 1', difficulty: 10, visa: 'Job Seeker', tags: ['Ucuz'], salary: '€20k', desc: 'Kolay giriş.', strategy: 'Job Seeker vizesi.', link: 'https://vistos.mne.gov.pt/', education: { tuition: '€1k-3k', workRights: '20 Saat', postGrad: 'Kolay', topUnis: ['Porto Univ'], note: 'SEF bildirimi.' }
  },
  {
    id: 'jp', name: 'Japonya', englishName: 'Japan', region: 'Asya', tier: 'Tier 2', difficulty: 60, visa: 'Engineer', tags: ['Robotik'], salary: '¥4M+', desc: 'Teknoloji devi.', strategy: 'MEXT bursu.', link: 'https://www.mofa.go.jp/', education: { tuition: 'MEXT Bedava', workRights: '28 Saat', postGrad: 'İş bulana kadar', topUnis: ['Tokyo Tech'], note: 'Özel izin.' }
  },
  {
    id: 'kr', name: 'Güney Kore', englishName: 'South Korea', region: 'Asya', tier: 'Tier 2', difficulty: 55, visa: 'E-7', tags: ['Samsung'], salary: '₩40M+', desc: 'Samsung, LG.', strategy: 'GKS bursu.', link: 'https://www.visa.go.kr/', education: { tuition: 'GKS Bedava', workRights: '20 Saat', postGrad: '2 Yıl', topUnis: ['KAIST'], note: '6 aydan sonra.' }
  }
];

const engineerRoles = [
  { title: "Junior Embedded Software Engineer", label: "Gömülü Yazılım" },
  { title: "Junior Firmware Engineer", label: "Firmware (Donanım)" },
  { title: "Junior IoT Engineer", label: "IoT (Nesnelerin İnterneti)" },
  { title: "Test Automation Engineer Python", label: "Test/Validation" },
  { title: "PLC Automation Engineer", label: "PLC / Otomasyon" },
  { title: "System Integration Engineer", label: "Sistem Entegrasyon" }
];

const skillFocusData = [
    { icon: Cpu, title: 'Embedded C', detail: 'STM32, ESP32, Bare Metal sürücü yazımı.' },
    { icon: Code, title: 'RTOS', detail: 'FreeRTOS, Task, Queue, Semaphore kullanımı.' },
    { icon: Activity, title: 'Protokoller', detail: 'CAN, I2C, SPI, UART, MQTT.' },
    { icon: AlertTriangle, title: 'Bonus', detail: 'Python (analiz) veya React (arayüz).' },
];

const projectIdeas = {
  "Junior Embedded Software Engineer": [
    { title: "STM32 Bootloader", desc: "UART üzerinden kendi bootloader'ını yaz." },
    { title: "RTOS Weather Station", desc: "FreeRTOS ile çoklu task (okuma/yazma) yapısı kur." }
  ],
  "Junior Firmware Engineer": [
    { title: "Bare Metal SPI Driver", desc: "HAL kütüphanesi kullanmadan SPI driver yaz." },
    { title: "USB HID Device", desc: "Mikrodenetleyiciyi klavye/mouse olarak tanıt." }
  ],
  "Junior IoT Engineer": [
    { title: "MQTT Dashboard", desc: "ESP32 verisini AWS IoT Core'a gönder ve izle." },
    { title: "Smart Home Hub", desc: "Home Assistant ile entegre akıllı priz." }
  ],
  "Test Automation Engineer Python": [
    { title: "HIL Simulation Script", desc: "Python ile donanıma seri porttan komut gönderip test et." },
    { title: "Log Analyzer", desc: "Cihaz loglarını analiz eden araç geliştir." }
  ],
  "PLC Automation Engineer": [
    { title: "Traffic Light Logic", desc: "Trafik ışığı simülasyonunu Ladder Logic ile yap." },
    { title: "Tank Level Control", desc: "PID kontrol ile seviye otomasyonu." }
  ],
  "System Integration Engineer": [
    { title: "Sensor Fusion", desc: "İvmeölçer ve Jiroskop verilerini birleştir." },
    { title: "CAN Bus Sniffer", desc: "Araç içi verileri dinleyen donanım yap." }
  ]
};

export default function CareerCommandCenterV12() {
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
  const [isEditing, setIsEditing] = useState(false); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const diffDays = Math.ceil(Math.abs(new Date('2026-01-31') - new Date()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (!auth) return;
    signInAnonymously(auth).then((userCredential) => {
        setUser(userCredential.user);
        setDbStatus('connected');
        const unsub = onSnapshot(doc(db, "users", userCredential.user.uid), (doc) => {
            if (doc.exists()) setUserNotes(doc.data().notes || {});
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
        setTimeout(() => { setIsSaving(false); setIsEditing(false); }, 500);
    } catch (e) { setIsSaving(false); }
  };

  useEffect(() => {
    if (selectedCountry) {
      setCurrentNote(userNotes[selectedCountry.id] || '');
      setIsEditing(false); 
    }
  }, [selectedCountry, userNotes]);

  const performGoogleSearch = (country) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(`${selectedRole} jobs in ${country.englishName || country.name}`)}`, '_blank');
  };

  const performNetworkSearch = (type, country) => {
    let query = type === 'alumni' 
        ? `site:linkedin.com/in/ "Turkish" AND ("Engineer" OR "Mühendis") AND "Embedded" AND "${country.englishName}"`
        : `site:linkedin.com/in/ "Recruiter" AND ("Tech" OR "Engineering") AND "${country.englishName}"`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allCountries.filter(c => {
      const matchTab = activeTab === 'All' || c.region === activeTab || c.tier === activeTab;
      const matchSearch = c.name.toLowerCase().includes(term) || c.tags.some(t => t.toLowerCase().includes(term));
      return matchTab && matchSearch;
    });
  }, [activeTab, searchTerm]);
  
  // OTO-SEÇİM: Boşluk sorununu çözen kısım
  useEffect(() => {
      if (filteredData.length > 0 && (!selectedCountry || !filteredData.find(c => c.id === selectedCountry.id))) {
          setSelectedCountry(filteredData[0]);
      } else if (filteredData.length === 0) {
          setSelectedCountry(null);
      }
  }, [filteredData, selectedCountry]);

  return (
    <div className="flex w-full h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden flex-col md:flex-row relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-200px,#1e293b,transparent)] z-0 pointer-events-none"></div>

      {/* SIDEBAR */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 md:relative md:translate-x-0 shrink-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl h-full`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Zap size={20} fill="currentColor" /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">KARİYER-V12</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-xs font-bold transition-colors ${dbStatus === 'connected' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400'}`}>
             {dbStatus === 'connected' ? <Cloud size={14}/> : <Loader2 size={14} className="animate-spin"/>}
             <span className="truncate">{dbStatus === 'connected' ? 'Veritabanı Aktif' : 'Bağlanıyor...'}</span>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">Bölgeler</h3>
            <div className="space-y-1">
              {['All', 'Avrupa', 'Asya', 'Amerika', 'Kuzey', 'Okyanusya'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex justify-between items-center group ${activeTab === tab ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-white/5'}`}>
                  {tab === 'All' ? 'Tüm Dünyalar' : tab} {activeTab === tab && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 shadow-lg">
             <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><Clock size={12} className="text-cyan-400" /> Mezuniyet</span><span className="text-xs text-white font-mono font-bold">{diffDays} Gün</span></div>
             <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full rounded-full" style={{ width: '75%' }}></div></div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full z-10 relative">
        <header className="h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 p-1 rounded hover:bg-white/5"><Menu size={24} /></button>
            <div className="relative w-full group">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input type="text" placeholder="Ülke ara..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 rounded-full border border-white/10 shadow-sm"><GraduationCap size={16} className="text-cyan-400"/><span className="text-xs font-bold text-slate-300">OCAK 2026</span></div>
        </header>

        <main className="flex-1 flex overflow-hidden relative">
          {/* LIST */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth min-w-0 border-r border-white/5 pb-20">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredData.map(country => (
                <div key={country.id} onClick={() => setSelectedCountry(country)} className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedCountry?.id === country.id ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]' : 'bg-slate-900/40 border-white/5 hover:border-cyan-500/30'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div><h3 className={`text-base font-bold transition-colors ${selectedCountry?.id === country.id ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>{country.name}</h3><div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><MapPin size={12} className={selectedCountry?.id === country.id ? 'text-cyan-500' : ''} /> {country.region}</div></div>
                    <div className="flex gap-1 mt-1">{[1,2,3,4,5].map(bar => (<div key={bar} className={`w-1 h-3 rounded-full transition-all duration-500 ${(country.difficulty / 20) >= bar ? (country.difficulty > 70 ? 'bg-red-500' : country.difficulty > 40 ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-slate-800'}`}/>))}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950/50 border border-white/10 text-slate-300">{country.visa}</span>
                    {country.education.workRights.includes('Limitsiz') && (<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 size={10} /> Full-Work</span>)}
                  </div>
                  {userNotes[country.id] && (<div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse" />)}
                </div>
              ))}
            </div>
          </div>
          
          {/* MIDDLE - RESPONSIVE HIDDEN ON SMALL SCREENS */}
          {selectedCountry && (
             <div className="hidden 2xl:flex w-[320px] flex-col p-4 bg-slate-900/30 backdrop-blur-sm border-l border-white/5 shrink-0 overflow-y-auto">
               <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2 uppercase tracking-wider sticky top-0 bg-slate-900/90 z-10 py-2 -mt-2"><Activity className="text-yellow-400" size={14} /> Taktiksel Destek</h3>
               <div className="mb-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Users size={10} /> Network</h4>
                 <div className="space-y-2">
                   <button onClick={() => performNetworkSearch('alumni', selectedCountry)} className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 p-2.5 rounded-xl flex items-center gap-3 transition-all group text-left">
                     <div className="p-1.5 bg-blue-900/30 text-blue-400 rounded-lg group-hover:text-white transition-colors"><Linkedin size={14}/></div>
                     <div><div className="text-xs font-bold text-slate-200 group-hover:text-white">Türk Mühendisleri</div><div className="text-[9px] text-slate-500">{selectedCountry.name}</div></div>
                   </button>
                   <button onClick={() => performNetworkSearch('recruiter', selectedCountry)} className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 p-2.5 rounded-xl flex items-center gap-3 transition-all group text-left">
                     <div className="p-1.5 bg-purple-900/30 text-purple-400 rounded-lg group-hover:text-white transition-colors"><Search size={14}/></div>
                     <div><div className="text-xs font-bold text-slate-200 group-hover:text-white">İşe Alımcılar</div><div className="text-[9px] text-slate-500">Recruiters</div></div>
                   </button>
                 </div>
               </div>
               <div>
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Lightbulb size={10} /> Projeler</h4>
                 <div className="bg-slate-950/50 rounded-xl border border-white/10 p-3">
                    <div className="text-[9px] text-cyan-500 font-bold mb-2 uppercase tracking-wide border-b border-white/5 pb-1 truncate">{selectedRole}</div>
                    <div className="space-y-3">
                      {(projectIdeas[selectedRole] || projectIdeas["Junior Embedded Software Engineer"]).map((idea, i) => (
                        <div key={i} className="flex gap-2 items-start">
                           <div className="mt-0.5 p-1 bg-yellow-500/10 rounded text-yellow-500 shrink-0"><Code size={10}/></div>
                           <div><div className="text-[11px] font-bold text-slate-200 leading-tight">{idea.title}</div><div className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{idea.desc}</div></div>
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
             </div>
          )}

          {/* DETAIL - RESPONSIVE WIDTH */}
          {selectedCountry && (
            <div className="fixed inset-0 z-40 md:static md:z-auto w-full md:w-[450px] lg:w-[450px] xl:w-[500px] md:border-l md:border-white/10 bg-slate-900/95 backdrop-blur-xl flex flex-col transition-all duration-300 shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
              <div className="relative h-48 shrink-0 overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedCountry.tier === 'Tier 1' ? 'from-emerald-900/40 via-slate-900 to-slate-900' : selectedCountry.tier === 'Tier 2' ? 'from-blue-900/40 via-slate-900 to-slate-900' : 'from-red-900/40 via-slate-900 to-slate-900'} z-0`}></div>
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                <button onClick={() => setSelectedCountry(null)} className="absolute top-6 left-6 z-20 md:hidden bg-black/50 p-2 rounded-full text-white backdrop-blur-md"><ArrowRight size={20} className="rotate-180" /></button>
                <div className="absolute bottom-6 left-8 z-20 right-8">
                  <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedCountry.tier === 'Tier 1' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : selectedCountry.tier === 'Tier 2' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{selectedCountry.tier}</div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 tracking-tight drop-shadow-lg">{selectedCountry.name}</h2>
                  <div className="flex p-1 bg-slate-950/50 backdrop-blur-md rounded-xl border border-white/10">
                    <button onClick={() => setViewMode('career')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${viewMode === 'career' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><Briefcase size={12} /> Profesyonel</button>
                    <button onClick={() => setViewMode('education')} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 ${viewMode === 'education' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}><GraduationCap size={12} /> Akademik</button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50 pb-20 min-h-0">
                {viewMode === 'career' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><Coins size={32}/></div>
                        <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Yıllık Maaş</div><div className="text-base font-bold text-emerald-400">{selectedCountry.salary}</div>
                        <div className="w-full bg-slate-700/50 h-1 mt-2 rounded-full"><div className="bg-emerald-500 h-full rounded-full" style={{width: '70%'}}></div></div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><BarChart3 size={32}/></div>
                        <div className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Giriş Zorluğu</div><div className={`text-base font-bold ${selectedCountry.difficulty > 50 ? 'text-red-400' : 'text-yellow-400'}`}>{selectedCountry.difficulty > 60 ? 'Yüksek' : 'Orta'}</div>
                        <div className="w-full bg-slate-700/50 h-1 mt-2 rounded-full"><div className={`h-full rounded-full ${selectedCountry.difficulty > 50 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{width: `${selectedCountry.difficulty}%`}}></div></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2 tracking-wider"><Layout size={12}/> Genel Durum</h4>
                      <p className="text-xs text-slate-300 leading-relaxed pl-3 border-l-2 border-cyan-500/30">{selectedCountry.desc}</p>
                    </div>
                    <div className="bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-500/20 p-4 rounded-xl relative">
                      <h4 className="text-xs font-bold text-cyan-400 mb-1 flex items-center gap-2"><Terminal size={14}/> Strateji</h4>
                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed">{selectedCountry.strategy}</p>
                    </div>
                    <div className="border-t border-white/10 pt-6">
                       <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-2 tracking-wider"><Settings size={12}/> Görev Parametreleri</h4>
                       <div className="relative mb-3 group">
                         <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-slate-200 text-xs rounded-xl p-3 appearance-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 cursor-pointer transition-all hover:bg-slate-900">
                           {engineerRoles.map((role) => (<option key={role.title} value={role.title}>{role.label}</option>))}
                         </select>
                         <ChevronRight className="absolute right-3 top-3 text-slate-500 rotate-90 pointer-events-none group-hover:text-cyan-400 transition-colors" size={14} />
                       </div>
                       <button onClick={() => performGoogleSearch(selectedCountry)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-4 rounded-xl text-xs font-bold transition-all transform hover:scale-[1.02] flex items-center justify-between shadow-xl shadow-blue-900/20 group border border-white/10">
                          <span className="flex items-center gap-2"><div className="bg-white/20 p-1 rounded-lg"><Search size={12} /></div><span>Google'da İş Ara</span></span>
                          <span className="text-blue-200 text-[10px] font-normal group-hover:text-white transition-colors">{selectedCountry.englishName}</span>
                       </button>
                    </div>
                  </div>
                )}

                {viewMode === 'education' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="space-y-3">
                      <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2"><div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400"><Coins size={14}/></div><span className="text-[10px] font-bold text-slate-400 uppercase">Eğitim Ücreti</span></div>
                        <div className="text-xs font-bold text-white text-right">{selectedCountry.education.tuition}</div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2"><div className="p-1.5 bg-pink-500/20 rounded-lg text-pink-400"><Clock size={14}/></div><span className="text-[10px] font-bold text-slate-400 uppercase">Çalışma İzni</span></div>
                        <div className="text-xs font-bold text-yellow-400 text-right">{selectedCountry.education.workRights}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Building size={12}/> En İyi Okullar</h4>
                      <div className="flex flex-wrap gap-2">{selectedCountry.education.topUnis.map(u => (<span key={u} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-1.5 rounded-lg border border-white/10 hover:border-purple-500/50 transition-colors cursor-default">{u}</span>))}</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-xl border border-purple-500/20">
                      <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-1 flex items-center gap-2"><Award size={12}/> Mezuniyet Sonrası</h4>
                      <p className="text-sm text-white font-bold mb-1">{selectedCountry.education.postGrad} <span className="text-xs font-normal text-slate-400">oturma izni</span></p>
                      <p className="text-[10px] text-slate-400 italic mt-1 opacity-70">"{selectedCountry.education.note}"</p>
                    </div>
                  </div>
                )}

                <div className="pt-6 mt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider"><Save size={12} /> Kişisel Notlar</h4>
                    {!isEditing && userNotes[selectedCountry.id] && (<button onClick={() => setIsEditing(true)} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium bg-cyan-950/30 px-2 py-1 rounded-full border border-cyan-500/20">Düzenle</button>)}
                  </div>
                  {isEditing || !userNotes[selectedCountry.id] ? (
                    <div className="space-y-2 animate-in zoom-in-95 duration-200">
                      <textarea className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none min-h-[80px] shadow-inner" placeholder="Hedeflerini yaz..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={handleSaveNote} disabled={isSaving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <><Check size={12}/> Kaydet</>}
                        </button>
                        {userNotes[selectedCountry.id] && <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs transition-all border border-white/10">İptal</button>}
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setIsEditing(true)} className="bg-slate-800/30 hover:bg-slate-800/60 border border-dashed border-slate-600 hover:border-cyan-500/50 rounded-xl p-3 text-xs text-slate-400 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1 min-h-[60px] group">
                      <p className="text-left w-full text-slate-300 whitespace-pre-wrap">{userNotes[selectedCountry.id]}</p>
                    </div>
                  )}
                  <a href={selectedCountry.link} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 w-full bg-white hover:bg-slate-200 text-slate-900 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">Resmi Kaynağa Git <ExternalLink size={12} /></a>
                </div>
              </div>
            </div>
          )}

          {!selectedCountry && (
             <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-slate-900/50 border-l border-white/10 text-slate-600 relative z-0">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05),transparent)]"></div>
               <Globe size={80} className="mb-6 opacity-20 animate-pulse" />
               <p className="text-sm font-medium tracking-wide">DETAYLARI GÖRMEK İÇİN BİR HEDEF SEÇİN</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
         }
