import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, Coins, Clock, Building, Award, Code, Cpu, Activity,
  Calendar, Settings, BarChart3, CheckCircle2, Users, Lightbulb,
  Linkedin, Cloud, Check, Loader2, Edit3
} from 'lucide-react';

// --- FIREBASE ENTEGRASYONU ---
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

// --- VERİTABANI ---
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
    { icon: Cpu, title: 'Embedded C', detail: 'STM32, ESP32, Bare Metal sürücü.' },
    { icon: Code, title: 'RTOS', detail: 'FreeRTOS, Task, Queue yönetimi.' },
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
  const [selectedCountry, setSelectedCountry] = useState(allCountries[0]); 
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
  
  // OTO-SEÇİM
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
            <Zap size={20} fill="currentColor" /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">KARİYER-V12.1</span>
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
          {/* TIER LIST GERİ DÖNDÜ */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">Öncelik</h3>
            <div className="space-y-1">
               {['Tier 1', 'Tier 2', 'Tier 3'].map(tier => (
                <button key={tier} onClick={() => { setActiveTab(tier); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex gap-3 items-center group ${activeTab === tier ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_-5px_rgba(168,85,247,0.3)]' : 'text-slate-400 hover:bg-white/5'}`}>
                   <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${tier === 'Tier 1' ? 'bg-green-500 shadow-green-500' : tier === 'Tier 2' ? 'bg-yellow-500 shadow-yellow-500' : 'bg-red-500 shadow-red-500'}`} />
                  {tier}
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
          <div className="w-[380px] border-r border-white/5 flex flex-col shrink-0 bg-slate-900/30">
             <div className="p-4 border-b border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                <span>Sonuçlar ({filteredData.length})</span>
             </div>
             <div className="flex-1 overflow-y-auto p-4 scroll-smooth space-y-3">
              {filteredData.map(country => (
                <div key={country.id} onClick={() => setSelectedCountry(country)} className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedCountry?.id === country.id ? 'bg-slate-800 border-cyan-500/50 shadow-lg' : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div><h3 className={`text-sm font-bold ${selectedCountry?.id === country.id ? 'text-cyan-400' : 'text-slate-200'}`}>{country.name}</h3><div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {country.region}</div></div>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map(bar => (<div key={bar} className={`w-1 h-2.5 rounded-full ${(country.difficulty / 20) >= bar ? (country.difficulty > 70 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-800'}`}/>))}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950/50 border border-white/10 text-slate-400">{country.visa}</span>
                    {country.education.workRights.includes('Limitsiz') && (<span className="px-2 py-0.5 rounded text-[10px] bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 size={10} /> Full-Work</span>)}
                  </div>
                  {userNotes[country.id] && (<div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />)}
                </div>
              ))}
             </div>
          </div>

          {/* DETAIL */}
          {selectedCountry ? (
            <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50 overflow-y-auto">
              <div className="h-40 relative shrink-0 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedCountry.tier === 'Tier 1' ? 'from-emerald-900/30' : 'from-blue-900/30'} to-slate-900 z-0`}></div>
                <div className="absolute bottom-6 left-8 z-20 right-8 flex justify-between items-end">
                   <div>
                      <div className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-white/5 border-white/10 inline-block mb-2 text-slate-300">{selectedCountry.tier}</div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">{selectedCountry.name}</h2>
                   </div>
                   <div className="flex bg-slate-950/50 rounded-lg p-1 border border-white/10">
                      <button onClick={() => setViewMode('career')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'career' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Profesyonel</button>
                      <button onClick={() => setViewMode('education')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'education' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Akademik</button>
                   </div>
                </div>
              </div>

              <div className="p-8 space-y-8 max-w-4xl mx-auto w-full">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                       <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Maaş Skalası</div>
                       <div className="text-xl font-bold text-emerald-400">{selectedCountry.salary}</div>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5">
                       <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Giriş Zorluğu</div>
                       <div className="text-xl font-bold text-white">{selectedCountry.difficulty}%</div>
                    </div>
                    <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 col-span-2">
                       <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Vize Stratejisi</div>
                       <div className="text-sm text-slate-300">{selectedCountry.strategy}</div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                       {viewMode === 'career' ? (
                          <>
                            <div>
                               <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Layout size={16} className="text-cyan-500"/> Genel Bakış</h4>
                               <p className="text-sm text-slate-400 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-white/5">{selectedCountry.desc}</p>
                            </div>
                            <div>
                               <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Settings size={16} className="text-cyan-500"/> İş Arama Motoru</h4>
                               <div className="bg-slate-800/30 p-5 rounded-xl border border-white/5 space-y-4">
                                  <div>
                                     <label className="text-xs text-slate-500 block mb-2">Hedef Pozisyon</label>
                                     <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm rounded-lg p-3 outline-none">
                                        {engineerRoles.map(r => <option key={r.title} value={r.title}>{r.label}</option>)}
                                     </select>
                                  </div>
                                  <button onClick={() => performGoogleSearch(selectedCountry)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all">
                                     <Search size={16}/> Google'da {selectedCountry.englishName} İlanlarını Ara
                                  </button>
                                  <div className="grid grid-cols-2 gap-3 pt-2">
                                     <button onClick={() => performNetworkSearch('alumni', selectedCountry)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg text-xs flex justify-center items-center gap-2"><Linkedin size={14}/> Türk Mühendisler</button>
                                     <button onClick={() => performNetworkSearch('recruiter', selectedCountry)} className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg text-xs flex justify-center items-center gap-2"><Users size={14}/> İşe Alımcılar</button>
                                  </div>
                               </div>
                            </div>
                          </>
                       ) : (
                          <div className="space-y-4">
                             <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 flex justify-between">
                                <span className="text-sm text-slate-400">Eğitim Ücreti</span>
                                <span className="text-sm font-bold text-white">{selectedCountry.education.tuition}</span>
                             </div>
                             <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 flex justify-between">
                                <span className="text-sm text-slate-400">Çalışma İzni</span>
                                <span className="text-sm font-bold text-yellow-400">{selectedCountry.education.workRights}</span>
                             </div>
                             <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5">
                                <span className="text-sm text-slate-400 block mb-2">Öne Çıkan Üniversiteler</span>
                                <div className="flex gap-2 flex-wrap">
                                   {selectedCountry.education.topUnis.map(u => <span key={u} className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">{u}</span>)}
                                </div>
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="space-y-6">
                       <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5">
                          <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Lightbulb size={14}/> Proje Fikri</h4>
                          {(projectIdeas[selectedRole] || projectIdeas["Junior Embedded Software Engineer"]).slice(0,1).map((idea, i) => (
                             <div key={i}>
                                <div className="text-sm font-bold text-white mb-1">{idea.title}</div>
                                <div className="text-xs text-slate-500 leading-relaxed">{idea.desc}</div>
                             </div>
                          ))}
                       </div>

                       <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5">
                          <div className="flex justify-between items-center mb-3">
                             <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Save size={14}/> Notlar</h4>
                             {!isEditing && userNotes[selectedCountry.id] && <button onClick={() => setIsEditing(true)} className="text-[10px] text-cyan-400"><Edit3 size={12}/></button>}
                          </div>
                          {isEditing || !userNotes[selectedCountry.id] ? (
                             <div className="space-y-2">
                                <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 outline-none min-h-[100px]" placeholder="Hedeflerini yaz..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
                                <div className="flex gap-2">
                                   <button onClick={handleSaveNote} disabled={isSaving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">{isSaving ? '...' : 'Kaydet'}</button>
                                   {userNotes[selectedCountry.id] && <button onClick={() => setIsEditing(false)} className="px-3 bg-slate-700 text-white py-2 rounded-lg text-xs">iptal</button>}
                                </div>
                             </div>
                          ) : (
                             <p className="text-xs text-slate-300 whitespace-pre-wrap cursor-pointer hover:text-white" onClick={() => setIsEditing(true)}>{userNotes[selectedCountry.id]}</p>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-600"><p>Yükleniyor...</p></div>
          )}
        </main>
      </div>
    </div>
  );
}
