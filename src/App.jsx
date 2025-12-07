import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, BookOpen, Clock, Coins, Building, Award
} from 'lucide-react';

// --- GELİŞMİŞ VERİTABANI (EĞİTİM & ÇALIŞMA HAKLARI EKLENDİ) ---
const allCountries = [
  // --- TIER 1 ---
  {
    id: 'de', name: 'Almanya', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 35, 
    visa: 'Chancenkarte', 
    tags: ['Otomotiv', 'Ücretsiz Okul'],
    salary: '€48k - €60k',
    desc: 'Mühendislik için dünyanın 1 numarası. Devlet üniversiteleri (TU9) neredeyse ücretsizdir.',
    strategy: 'İş: Chancenkarte ile git. Master: Not ortalaman 2.7 üzeriyse TU\'lara başvur. ZAB belgesi şart.',
    link: 'https://www.daad.de/en/',
    education: {
      tuition: 'Ücretsiz (Sadece dönem harcı ~300€)',
      workRights: 'Haftada 20 Saat (Yarı Zamanlı)',
      postGrad: '18 Ay (İş Arama İzni)',
      topUnis: ['TU Munich', 'RWTH Aachen', 'TU Berlin'],
      note: 'Öğrenciyken yıllık 120 tam gün veya 240 yarım gün çalışma hakkın var. Mühendislik öğrencileri genelde "Werkstudent" olarak sektörde çalışır.'
    }
  },
  {
    id: 'pl', name: 'Polonya', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 20, 
    visa: 'Work Permit', 
    tags: ['Ucuz Yaşam', 'Full-Time Çalışma'],
    salary: '€25k - €40k',
    desc: 'Eğitim alırken çalışma iznine ihtiyaç duymadan FULL-TIME çalışabilen nadir ülkelerden.',
    strategy: 'Master yaparken tam zamanlı yazılımcı olarak çalışabilirsin. Okul ücretleri uygundur.',
    link: 'https://study.gov.pl/',
    education: {
      tuition: '€2.000 - €4.000 / Yıl',
      workRights: 'Limitsiz / Tam Zamanlı',
      postGrad: '9 Ay (İş Arama İzni)',
      topUnis: ['Warsaw Univ. of Tech', 'AGH UST'],
      note: 'Tam zamanlı öğrenciysen çalışma izni almana gerek yok, doğrudan çalışabilirsin.'
    }
  },
  {
    id: 'it', name: 'İtalya', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 25, 
    visa: 'DSU Bursu', 
    tags: ['Burslu Master', 'Otomotiv'],
    salary: '€28k - €35k',
    desc: 'DSU Bursu (İhtiyaç bursu) ile okul ücreti ödemezsin, üste para ve yurt alırsın.',
    strategy: 'Eylül\'de burs başvurusu, Ocak-Mart arası okul başvurusu. Torino mühendislik için ideal.',
    link: 'https://www.universitaly.it/',
    education: {
      tuition: 'Burs ile Bedava (Yoksa €1k-3k)',
      workRights: 'Haftada 20 Saat',
      postGrad: '12 Ay (İş Arama İzni)',
      topUnis: ['Politecnico di Milano', 'Politecnico di Torino'],
      note: 'Mezun olduktan sonra iş bulursan öğrenci vizesini çalışma vizesine çevirmek kotaya takılmaz.'
    }
  },

  // --- TIER 2 ---
  {
    id: 'se', name: 'İsveç', region: 'Kuzey', 
    tier: 'Tier 2', difficulty: 45, 
    visa: 'Job Seeker', 
    tags: ['İnovasyon', 'Pahalı Okul'],
    salary: '40k SEK/Ay',
    desc: 'Eğitim kalitesi muazzam ama AB dışı vatandaşlara ücretli. Burs bulmak zor.',
    strategy: 'Paran varsa Master en iyi giriş yoludur. Eşin varsa o da tam zamanlı çalışabilir.',
    link: 'https://studyinsweden.se/',
    education: {
      tuition: '€10k - €15k / Yıl',
      workRights: 'Limitsiz (Dersleri aksatmadıkça)',
      postGrad: '12 Ay (İş Arama İzni)',
      topUnis: ['KTH Royal Institute', 'Chalmers'],
      note: 'İsveç\'te öğrenciler için saat sınırı yoktur ancak okuldan atılmamak için dersleri geçmelisin.'
    }
  },
  {
    id: 'nl', name: 'Hollanda', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 65, 
    visa: 'Orientation Year', 
    tags: ['High Tech', 'Pahalı'],
    salary: '€50k - €70k',
    desc: 'Okullar çok pahalı ama eğitim sonrası "Zoekjaar" vizesi çok değerlidir.',
    strategy: 'Hollanda burslarına (Orange Tulip) bak yoksa maliyeti yüksektir.',
    link: 'https://www.studyinnl.org/',
    education: {
      tuition: '€15k - €20k / Yıl',
      workRights: 'Haftada 16 Saat',
      postGrad: '1 Yıl (Orientation Year)',
      topUnis: ['TU Delft', 'TU Eindhoven'],
      note: 'Çalışma izni (TWV) işveren tarafından alınmalı, bu yüzden part-time iş bulmak biraz bürokratiktir.'
    }
  },
  {
    id: 'jp', name: 'Japonya', region: 'Asya', 
    tier: 'Tier 2', difficulty: 60, 
    visa: 'Engineer Visa', 
    tags: ['MEXT Bursu', 'Disiplin'],
    salary: '¥4M - ¥6M',
    desc: 'MEXT bursu ile gidersen her şey (Uçak, Okul, Cep harçlığı) devletten.',
    strategy: 'Konsolosluk veya Üniversite üzerinden MEXT bursuna başvur. Japonca öğrenmek için harika fırsat.',
    link: 'https://www.studyinjapan.go.jp/en/',
    education: {
      tuition: 'MEXT ile Bedava (Yoksa ¥500k/Yıl)',
      workRights: 'Haftada 28 Saat',
      postGrad: 'İş bulana kadar (Designated Activities)',
      topUnis: ['Univ. of Tokyo', 'Tokyo Tech'],
      note: 'Çalışmak için "Permission to Engage in Activity other than that Permitted" izni almalısın (Havaalanında alınır).'
    }
  },
  {
    id: 'kr', name: 'Güney Kore', region: 'Asya', 
    tier: 'Tier 2', difficulty: 55, 
    visa: 'D-2 Visa', 
    tags: ['GKS Bursu', 'Lab Ortamı'],
    salary: '₩40M - ₩60M',
    desc: 'Profesörler lablarında çalışacak öğrenci arar. GKS bursu çok prestijlidir.',
    strategy: 'Profesörlere doğrudan mail atarak "Lab Student" olmak istediğini söyle.',
    link: 'https://www.studyinkorea.go.kr/',
    education: {
      tuition: 'GKS ile Bedava (Yoksa $3k-5k/Dönem)',
      workRights: 'Haftada 20-25 Saat (Not Ort. Bağlı)',
      postGrad: '2 Yıl (D-10 Job Seeker)',
      topUnis: ['KAIST', 'SNU', 'POSTECH'],
      note: 'İlk 6 ay çalışma izni verilmez. 6 aydan sonra ve belirli bir Korece seviyesiyle izin alabilirsin.'
    }
  },
  {
    id: 'ee', name: 'Estonya', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 25, 
    visa: 'TRP for Study', 
    tags: ['Dijital', 'Startup'],
    salary: '€30k - €45k',
    desc: 'Doktora yapanlara devlet maaş verir. Master sırasında full-time çalışmak serbesttir.',
    strategy: 'Yazılım alanında ilerleyeceksen en iyi F/P (Fiyat/Performans) ülkesidir.',
    link: 'https://www.studyinestonia.ee/',
    education: {
      tuition: 'Bazı bölümler ücretsiz (Genelde €3k)',
      workRights: 'Limitsiz / Tam Zamanlı',
      postGrad: '9 Ay',
      topUnis: ['TalTech', 'University of Tartu'],
      note: 'Derslerini aksatmadığın sürece çalışma saati sınırlaması yoktur.'
    }
  },
  {
    id: 'hu', name: 'Macaristan', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 30, 
    visa: 'Stipendium Hungaricum', 
    tags: ['Tam Burs', 'Kolay Kabul'],
    salary: '€20k - €30k',
    desc: 'Devlet bursu (Stipendium) okul + yurt + harçlık verir.',
    strategy: 'Ocak ayında bursa başvur. Kabul almak Almanya\'dan çok daha kolaydır.',
    link: 'https://stipendiumhungaricum.hu/',
    education: {
      tuition: 'Bursla Bedava',
      workRights: 'Haftada 24 Saat (Dönem içi)',
      postGrad: '9 Ay (Study-to-Work)',
      topUnis: ['BME', 'Obuda University'],
      note: 'Yaz tatillerinde tam zamanlı (Full-time) çalışabilirsin.'
    }
  },

  // --- TIER 3 ---
  {
    id: 'us', name: 'ABD', region: 'Amerika', 
    tier: 'Tier 3', difficulty: 95, 
    visa: 'F1 Visa', 
    tags: ['Pahalı', 'STEM OPT'],
    salary: '$80k - $120k',
    desc: 'Dünyanın en pahalı eğitimi ama geri dönüşü (ROI) en yüksek olan.',
    strategy: 'STEM (Fen/Müh) bölümü okursan mezuniyet sonrası 3 yıl (OPT) çalışma izni alırsın.',
    link: 'https://educationusa.state.gov/',
    education: {
      tuition: '$30k - $60k / Yıl',
      workRights: 'Sadece Kampüs İçi (20 Saat)',
      postGrad: '1 Yıl + 2 Yıl (STEM Uzatması)',
      topUnis: ['Georgia Tech', 'UIUC', 'Purdue'],
      note: 'İlk yıl kampüs dışında çalışmak YASAK. Sonrasında CPT ile staj yapabilirsin.'
    }
  },
  {
    id: 'au', name: 'Avustralya', region: 'Global', 
    tier: 'Tier 3', difficulty: 85, 
    visa: 'Subclass 500', 
    tags: ['Yüksek Saat Ücreti', 'Pahalı'],
    salary: 'AUD 80k+',
    desc: 'Öğrenciyken çalışarak yaşam masraflarını çıkarmak en kolay olan ülkedir.',
    strategy: 'Regional (Kırsal) bölgelerdeki üniversiteleri seçersen mezuniyet sonrası vizen uzar.',
    link: 'https://www.studyaustralia.gov.au/',
    education: {
      tuition: 'AUD 30k - 45k / Yıl',
      workRights: 'Haftada 24 Saat (48/2 Hafta)',
      postGrad: '2 - 4 Yıl (Bölgeye göre)',
      topUnis: ['UNSW', 'Uni of Melbourne'],
      note: 'Tatillerde full-time çalışma izni var. Saatlik asgari ücret dünyanın en yükseğidir.'
    }
  },
  {
    id: 'cz', name: 'Çekya', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 30, 
    visa: 'Student Visa', 
    tags: ['Teknik Eğitim', 'Merkezi'],
    salary: '€30k - €45k',
    desc: 'Çekçe okursan eğitim BEDAVA. İngilizce ücretli ama makul.',
    strategy: 'CVUT (Prag Teknik) çok iyidir. Mezun olunca serbest piyasaya erişimin olur.',
    link: 'https://www.studyin.cz/',
    education: {
      tuition: '€3k - €5k (İngilizce)',
      workRights: 'Limitsiz (Öğrenciyken)',
      postGrad: '9 Ay',
      topUnis: ['CTU Prague', 'Brno Univ. of Tech'],
      note: 'Akredite bir programda öğrenciysen çalışma iznine gerek duymadan çalışabilirsin.'
    }
  },
  {
    id: 'fi', name: 'Finlandiya', region: 'Kuzey',
    tier: 'Tier 2', difficulty: 50,
    visa: 'Student Residence',
    tags: ['Nokia', 'Mutluluk'],
    salary: '€45k',
    desc: 'Mezun olduktan sonra iş aramak için 2 yıl veriyorlar (En cömert sürelerden biri).',
    strategy: 'Finlandiya bursları %50 veya %100 harç indirimi sağlayabilir.',
    link: 'https://www.studyinfinland.fi/',
    education: {
      tuition: '€10k - €12k / Yıl',
      workRights: 'Haftada 30 Saat',
      postGrad: '2 Yıl',
      topUnis: ['Aalto University', 'Tampere Univ'],
      note: 'Çalışma saati limiti yakın zamanda 25\'ten 30\'a çıkarıldı.'
    }
  },
  {
    id: 'ca', name: 'Kanada', region: 'Amerika', 
    tier: 'Tier 3', difficulty: 75, 
    visa: 'Study Permit', 
    tags: ['Göçmenlik', 'PGWP'],
    salary: 'CAD 70k+',
    desc: 'Eğitim sonrası PGWP (Çalışma izni) almak vatandaşlığa giden en net yoldur.',
    strategy: '1 yıllık Master yerine 2 yıllık program seçersen 3 yıl çalışma izni alırsın.',
    link: 'https://www.educanada.ca/',
    education: {
      tuition: 'CAD 20k - 40k / Yıl',
      workRights: 'Haftada 24 Saat (Kampüs Dışı)',
      postGrad: 'Eğitim süresi kadar (Max 3 Yıl)',
      topUnis: ['U of Toronto', 'Waterloo'],
      note: 'Son düzenlemelerle kolej mezunlarına izin zorlaştı ama Master mezunları hala avantajlı.'
    }
  },
  {
    id: 'pt', name: 'Portekiz', region: 'Avrupa', tier: 'Tier 1', difficulty: 10, visa: 'Student Visa', tags: ['Uygun Fiyat'], salary: '€20k', desc: 'Okul ücretleri AB standartlarına göre çok düşüktür.', strategy: 'Porto veya Lizbon teknik üniversiteleri.', link: 'https://www.study-research.pt/', education: { tuition: '€1k - €3k / Yıl', workRights: 'Haftada 20 Saat', postGrad: 'Job Seeker Visa geçişi kolay', topUnis: ['Univ. of Porto', 'IST Lisbon'], note: 'Çalışmak için SEF\'e bildirimde bulunmak gerekir.' } },
  { id: 'es', name: 'İspanya', region: 'Avrupa', tier: 'Tier 2', difficulty: 40, visa: 'Student Visa', tags: ['Keyif'], salary: '€25k', desc: 'Devlet üniversiteleri nispeten uygundur.', strategy: 'UPC Barcelona mühendislikte iyidir.', link: 'https://www.spain.info/', education: { tuition: '€2k - €5k / Yıl', workRights: 'Haftada 30 Saat', postGrad: '1 Yıl (Job Search)', topUnis: ['UPC', 'Politecnica de Madrid'], note: 'Çalışma izni işveren tarafından başvurulur, süreç bazen yavaştır.' } },
];

export default function CareerCommandCenter() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState(allCountries[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('career'); // 'career' | 'education'
  const [userNotes, setUserNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('careerNotesV3');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [currentNote, setCurrentNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (selectedCountry) {
      setCurrentNote(userNotes[selectedCountry.id] || '');
      setShowNoteInput(false);
      // Ülke değiştiğinde varsayılan olarak Career moduna dön veya mevcut modda kal
      // Kullanıcı deneyimi için mevcut modda kalması daha iyi olabilir
    }
  }, [selectedCountry, userNotes]);

  const handleSaveNote = () => {
    const updatedNotes = {
      ...userNotes,
      [selectedCountry.id]: currentNote
    };
    setUserNotes(updatedNotes);
    localStorage.setItem('careerNotesV3', JSON.stringify(updatedNotes));
    setShowNoteInput(false);
  };

  const openGuide = () => {
    if (selectedCountry?.link) {
      window.open(selectedCountry.link, '_blank');
    }
  };

  const filteredData = useMemo(() => {
    return allCountries.filter(c => {
      const matchTab = activeTab === 'All' || c.region === activeTab || c.tier === activeTab;
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchTab && matchSearch;
    });
  }, [activeTab, searchTerm]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-cyan-500 selection:text-white">
      
      {/* --- MOBILE MENU --- */}
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-slate-800 p-2 rounded text-cyan-400 border border-slate-700 shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* --- SIDEBAR --- */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Zap size={20} fill="currentColor" />
            <span>ELEKTRO-KARİYER</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">v3.0 Education Pack</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Kategoriler</h3>
            <div className="space-y-1">
              {['All', 'Avrupa', 'Asya', 'Amerika', 'Kuzey'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between
                    ${activeTab === tab 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  {tab === 'All' ? 'Tüm Dünyalar' : tab}
                  {activeTab === tab && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Strateji</h3>
            <div className="space-y-1">
               {['Tier 1', 'Tier 2', 'Tier 3'].map(tier => (
                <button
                  key={tier}
                  onClick={() => { setActiveTab(tier); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2
                    ${activeTab === tier 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  <div className={`w-2 h-2 rounded-full 
                    ${tier === 'Tier 1' ? 'bg-green-500' : tier === 'Tier 2' ? 'bg-yellow-500' : 'bg-red-500'}`} 
                  />
                  {tier === 'Tier 1' ? 'Öncelikli Hedef' : tier === 'Tier 2' ? 'Güçlü Alternatif' : 'Zorlu Hedef'}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <GraduationCap size={14} />
              <span className="text-xs font-bold">Akademik Tüyo</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Polonya ve Estonya'da öğrenciyken full-time çalışma iznin olduğunu biliyor muydun?
            </p>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-900/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 w-full max-w-sm mr-4">
            <Search size={16} className="mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Ülke, üniversite veya vize ara..." 
              className="bg-transparent border-none outline-none text-sm text-slate-200 w-full placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hidden md:flex items-center gap-4 shrink-0">
             <div className="text-right">
               <div className="text-xs text-slate-500 uppercase font-bold">Mezuniyet</div>
               <div className="text-sm text-cyan-400 font-mono">OCAK 2026</div>
             </div>
             <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
               <Briefcase size={14} className="text-white" />
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
          
          {/* LEFT: Country List */}
          <div className={`flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth ${selectedCountry ? 'hidden md:block' : 'block'}`}>
            <h2 className="text-xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
              <Globe className="text-cyan-500" size={20} />
              <span>Global Fırsatlar</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded ml-2 font-normal">
                {filteredData.length}
              </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-20 md:pb-0">
              {filteredData.map(country => (
                <div 
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-300
                    ${selectedCountry?.id === country.id 
                      ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {country.name}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {country.region}
                      </div>
                    </div>
                    {/* Work Rights Indicator (Mini) */}
                    <div className="flex flex-col items-end">
                      {country.education.workRights.includes('Limitsiz') || country.education.workRights.includes('30') ? (
                        <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-500/30 mb-1">
                          Full Work
                        </span>
                      ) : null}
                      {country.tier === 'Tier 1' && (
                        <span className="text-[10px] bg-cyan-900/30 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                          Önerilen
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {country.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-400">
                        {tag}
                      </span>
                    ))}
                  </div>

                   {/* Difficulty Bars */}
                   <div className="mt-3 flex gap-0.5 opacity-50">
                        {[1,2,3,4,5].map(bar => (
                          <div 
                            key={bar} 
                            className={`w-full h-1 rounded-full ${
                              (country.difficulty / 20) >= bar 
                                ? (country.difficulty > 70 ? 'bg-red-500' : country.difficulty > 40 ? 'bg-yellow-500' : 'bg-green-500') 
                                : 'bg-slate-800'
                            }`}
                          />
                        ))}
                   </div>
                  
                  {selectedCountry?.id === country.id && (
                     <div className="absolute right-4 bottom-4 text-cyan-500 animate-pulse hidden md:block">
                        <ChevronRight size={20} />
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Detail Panel */}
          <aside className={`
            w-full md:w-[450px] bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl 
            absolute md:relative right-0 h-full z-20 overflow-hidden
            transform transition-transform duration-300
            ${selectedCountry ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            ${!selectedCountry ? 'hidden md:flex' : 'flex'}
          `}>
            
            {selectedCountry ? (
              <>
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="md:hidden absolute top-4 left-4 z-30 bg-black/50 p-2 rounded-full text-white backdrop-blur-sm"
                >
                  <ChevronRight size={24} className="rotate-180" />
                </button>

                {/* Panel Header */}
                <div className="h-40 relative overflow-hidden bg-slate-800 shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 z-10" />
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500 via-slate-900 to-slate-900"></div>
                  
                  <div className="absolute bottom-4 left-6 z-20 w-full pr-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedCountry.name}</h2>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setViewMode('career')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'career' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                       >
                         <Briefcase size={12} /> İş & Vize
                       </button>
                       <button 
                        onClick={() => setViewMode('education')}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'education' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                       >
                         <GraduationCap size={12} /> Yüksek Lisans
                       </button>
                    </div>
                  </div>
                </div>

                {/* Panel Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* --- CAREER MODE --- */}
                  {viewMode === 'career' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">Maaş Skalası</div>
                          <div className="text-sm font-bold text-green-400">{selectedCountry.salary}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">Vize Türü</div>
                          <div className="text-sm font-bold text-white">{selectedCountry.visa}</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Layout size={12} /> Genel Bakış
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-slate-700 pl-3">
                          {selectedCountry.desc}
                        </p>
                      </div>

                      <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-4 rounded-xl border border-cyan-500/20">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
                          <Terminal size={14} /> İş Arama Stratejisi
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-mono">
                          {selectedCountry.strategy}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* --- EDUCATION MODE --- */}
                  {viewMode === 'education' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                      
                      {/* Tuition & Work Grid */}
                      <div className="grid grid-cols-1 gap-3">
                         <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-start justify-between">
                            <div>
                              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Coins size={12}/> Eğitim Ücreti</div>
                              <div className="text-sm font-bold text-white">{selectedCountry.education.tuition}</div>
                            </div>
                         </div>
                         <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex items-start justify-between">
                            <div>
                              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock size={12}/> Öğrenciyken Çalışma Hakkı</div>
                              <div className="text-sm font-bold text-yellow-400">{selectedCountry.education.workRights}</div>
                            </div>
                         </div>
                      </div>

                      {/* Top Unis */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Building size={12} /> Öne Çıkan Üniversiteler
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCountry.education.topUnis.map(uni => (
                            <span key={uni} className="bg-purple-900/30 text-purple-200 border border-purple-500/30 px-2 py-1 rounded text-xs">
                              {uni}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Post Grad Info */}
                      <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                         <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Award size={12} /> Mezuniyet Sonrası
                        </h4>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-sm text-slate-300">Kalma İzni:</span>
                           <span className="text-sm font-bold text-green-400">{selectedCountry.education.postGrad}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic border-t border-slate-700 pt-2 mt-2">
                           "{selectedCountry.education.note}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shared Notes Section */}
                  <div className="border-t border-slate-800 pt-4 pb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Save size={12} /> Kişisel Notlar
                      </h4>
                      {!showNoteInput && userNotes[selectedCountry.id] && (
                        <button onClick={() => setShowNoteInput(true)} className="text-xs text-cyan-400 hover:text-cyan-300">Düzenle</button>
                      )}
                    </div>

                    {showNoteInput ? (
                      <div className="space-y-2">
                        <textarea
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          placeholder="Başvuru tarihleri, hedef üniversiteler..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <button onClick={handleSaveNote} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-1.5 rounded text-xs font-bold">Kaydet</button>
                          <button onClick={() => setShowNoteInput(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 py-1.5 rounded text-xs">İptal</button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => setShowNoteInput(true)}
                        className="bg-slate-800/50 rounded-lg p-3 text-sm text-slate-400 border border-dashed border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        {userNotes[selectedCountry.id] || "Henüz not yok. Eklemek için tıkla..."}
                      </div>
                    )}

                    <button 
                      onClick={openGuide}
                      className="w-full mt-4 bg-slate-100 hover:bg-white text-slate-900 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2"
                    >
                      Resmi Kaynağa Git <ExternalLink size={16} />
                    </button>
                  </div>

                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center hidden md:flex">
                <Globe size={48} className="mb-4 opacity-20" />
                <p>Detayları görmek için soldan bir ülke seçin.</p>
              </div>
            )}
          </aside>
        </main>
      </div>
    </div>
  );
                    }
