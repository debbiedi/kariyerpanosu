import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, Coins, Clock, Building, Award
} from 'lucide-react';

// --- VERİTABANI (Aynı Veriler) ---
const allCountries = [
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
      tuition: 'Ücretsiz (~300€ Harç)',
      workRights: 'Haftada 20 Saat',
      postGrad: '18 Ay İzin',
      topUnis: ['TU Munich', 'RWTH Aachen', 'TU Berlin'],
      note: 'Öğrenciyken "Werkstudent" olarak çalışmak çok yaygındır.'
    }
  },
  {
    id: 'pl', name: 'Polonya', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 20, 
    visa: 'Work Permit', 
    tags: ['Ucuz Yaşam', 'Full-Time Work'],
    salary: '€25k - €40k',
    desc: 'Eğitim alırken çalışma iznine ihtiyaç duymadan FULL-TIME çalışabilen nadir ülkelerden.',
    strategy: 'Master yaparken tam zamanlı yazılımcı olarak çalışabilirsin. Okul ücretleri uygundur.',
    link: 'https://study.gov.pl/',
    education: {
      tuition: '€2k - €4k / Yıl',
      workRights: 'Limitsiz (Full-Time)',
      postGrad: '9 Ay İzin',
      topUnis: ['Warsaw Tech', 'AGH UST'],
      note: 'Tam zamanlı öğrenciysen çalışma izni almana gerek yok.'
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
      tuition: 'Burs ile Bedava',
      workRights: 'Haftada 20 Saat',
      postGrad: '12 Ay İzin',
      topUnis: ['Politecnico di Milano', 'Politecnico di Torino'],
      note: 'Mezuniyet sonrası iş bulursan vize dönüşümü kolaydır.'
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
      postGrad: '1 Yıl (Orientation)',
      topUnis: ['TU Delft', 'TU Eindhoven'],
      note: 'Part-time iş bulmak bürokratik olabilir (TWV gerekir).'
    }
  },
  {
    id: 'se', name: 'İsveç', region: 'Kuzey', tier: 'Tier 2', difficulty: 45, visa: 'Job Seeker', tags: ['İnovasyon', 'Pahalı'], salary: '40k SEK', desc: 'Eğitim kalitesi muazzam ama ücretli. Eşin varsa o tam zamanlı çalışabilir.', strategy: 'Paran varsa Master en iyi yoldur.', link: 'https://studyinsweden.se/', education: { tuition: '€10k - €15k / Yıl', workRights: 'Limitsiz', postGrad: '12 Ay İzin', topUnis: ['KTH', 'Chalmers'], note: 'Öğrenciyken saat sınırı yoktur.' } },
  {
    id: 'jp', name: 'Japonya', region: 'Asya', tier: 'Tier 2', difficulty: 60, visa: 'Engineer', tags: ['MEXT Bursu', 'Disiplin'], salary: '¥4M+', desc: 'MEXT bursu ile gidersen her şey devletten.', strategy: 'Konsolosluk bursunu takip et.', link: 'https://www.studyinjapan.go.jp/en/', education: { tuition: 'MEXT ile Bedava', workRights: 'Haftada 28 Saat', postGrad: 'İş bulana kadar', topUnis: ['Univ. of Tokyo', 'Tokyo Tech'], note: 'Özel izinle (shikakugai) çalışabilirsin.' }
  },
  {
    id: 'ee', name: 'Estonya', region: 'Avrupa', tier: 'Tier 2', difficulty: 25, visa: 'Startup Visa', tags: ['Dijital', 'Yazılım'], salary: '€35k', desc: 'Yazılım odaklıysan 1 numara. Master sırasında full-time çalışmak serbest.', strategy: 'TalTech başvurularını kaçırma.', link: 'https://www.studyinestonia.ee/', education: { tuition: '€3k / Yıl (Bazıları ücretsiz)', workRights: 'Limitsiz (Full-Time)', postGrad: '9 Ay', topUnis: ['TalTech', 'Univ. of Tartu'], note: 'Dersleri geçmen şartıyla sınırsız çalışma.' }
  },
  {
    id: 'us', name: 'ABD', region: 'Amerika', tier: 'Tier 3', difficulty: 95, visa: 'F1 Visa', tags: ['Pahalı', 'STEM OPT'], salary: '$90k+', desc: 'En pahalı ama en yüksek maaşlı rota.', strategy: 'STEM bölümü okuyup 3 yıl OPT al.', link: 'https://educationusa.state.gov/', education: { tuition: '$30k - $60k / Yıl', workRights: 'Kampüs İçi 20 Saat', postGrad: '3 Yıl (STEM OPT)', topUnis: ['Georgia Tech', 'MIT'], note: 'Kampüs dışı çalışma ilk yıl yasak.' }
  },
  {
    id: 'cz', name: 'Çekya', region: 'Avrupa', tier: 'Tier 1', difficulty: 30, visa: 'Student Visa', tags: ['Teknik', 'Merkezi'], salary: '€35k', desc: 'Çekçe okursan bedava. İngilizce makul.', strategy: 'CVUT Prag Teknik çok iyidir.', link: 'https://www.studyin.cz/', education: { tuition: '€3k - €5k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['CTU Prague', 'Brno Tech'], note: 'Akredite programda izin gerekmez.' }
  },
  {
    id: 'pt', name: 'Portekiz', region: 'Avrupa', tier: 'Tier 1', difficulty: 10, visa: 'Job Seeker', tags: ['Ucuz', 'Kolay'], salary: '€20k', desc: 'Avrupa\'ya en kolay giriş.', strategy: 'Job Seeker vizesiyle git, oradan Almanya\'ya başvur.', link: 'https://vistos.mne.gov.pt/', education: { tuition: '€1k - €3k', workRights: 'Haftada 20 Saat', postGrad: 'Kolay Geçiş', topUnis: ['Porto Univ', 'Lisbon IST'], note: 'SEF bildirimi gerekli.' }
  }
];

export default function CareerCommandCenterFixed() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState(null); // Başlangıçta hiçbiri seçili değil
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('career');
  const [userNotes, setUserNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('careerNotesV4');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [currentNote, setCurrentNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ülke değiştiğinde notları yükle
  useEffect(() => {
    if (selectedCountry) {
      setCurrentNote(userNotes[selectedCountry.id] || '');
      setShowNoteInput(false);
    }
  }, [selectedCountry, userNotes]);

  const handleSaveNote = () => {
    const updatedNotes = { ...userNotes, [selectedCountry.id]: currentNote };
    setUserNotes(updatedNotes);
    localStorage.setItem('careerNotesV4', JSON.stringify(updatedNotes));
    setShowNoteInput(false);
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
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* --- SIDEBAR (Desktop: Fixed Left, Mobile: Overlay) --- */}
      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 md:relative md:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Zap size={20} fill="currentColor" />
            <span>KARİYER-V4</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100%-80px)]">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Bölgeler</h3>
            <div className="space-y-1">
              {['All', 'Avrupa', 'Asya', 'Amerika', 'Kuzey'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); setSelectedCountry(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center
                    ${activeTab === tab ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                  {tab === 'All' ? 'Tüm Dünyalar' : tab}
                  {activeTab === tab && <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>
           <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">Öncelik</h3>
            <div className="space-y-1">
               {['Tier 1', 'Tier 2', 'Tier 3'].map(tier => (
                <button
                  key={tier}
                  onClick={() => { setActiveTab(tier); setMobileMenuOpen(false); setSelectedCountry(null); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex gap-2 items-center
                    ${activeTab === tier ? 'bg-purple-900/30 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                >
                   <div className={`w-2 h-2 rounded-full ${tier === 'Tier 1' ? 'bg-green-500' : tier === 'Tier 2' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  {tier}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center gap-3 w-full max-w-md">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 p-1 rounded hover:bg-slate-800">
              <Menu size={24} />
            </button>
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Ülke ara..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
               <GraduationCap size={16} className="text-cyan-400"/>
               <span className="text-xs font-bold text-slate-300">OCAK 2026</span>
             </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 flex overflow-hidden relative">
          
          {/* LIST VIEW (Left Side) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="text-cyan-500" size={18} />
                Sonuçlar ({filteredData.length})
              </h2>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-24 md:pb-0">
              {filteredData.map(country => (
                <div 
                  key={country.id}
                  onClick={() => setSelectedCountry(country)}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]
                    ${selectedCountry?.id === country.id 
                      ? 'bg-slate-800 border-cyan-500 shadow-lg shadow-cyan-900/20 ring-1 ring-cyan-500/50' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{country.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={10} /> {country.region}
                      </div>
                    </div>
                     <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(bar => (
                          <div key={bar} className={`w-1 h-3 rounded-sm ${(country.difficulty / 20) >= bar ? (country.difficulty > 70 ? 'bg-red-500' : country.difficulty > 40 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-slate-800'}`}/>
                        ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                     <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300">
                      {country.visa}
                    </span>
                    {country.education.workRights.includes('Limitsiz') && (
                       <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-900/30 text-green-400 border border-green-500/30">
                        Full-Work
                      </span>
                    )}
                  </div>
                  
                  {userNotes[country.id] && (
                     <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* DETAIL VIEW (Right Side - Desktop: Static / Mobile: Overlay) */}
          {selectedCountry && (
            <div className="fixed inset-0 z-40 md:static md:z-auto md:w-[450px] md:border-l md:border-slate-800 bg-slate-950 md:bg-slate-900 flex flex-col transition-all duration-300">
              
              {/* Header */}
              <div className="relative h-48 bg-slate-800 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10" />
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-600 via-slate-900 to-slate-900"></div>
                
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setSelectedCountry(null)}
                  className="absolute top-4 left-4 z-20 md:hidden bg-black/50 p-2 rounded-full text-white backdrop-blur-md hover:bg-black/70"
                >
                  <ArrowRight size={20} className="rotate-180" />
                </button>

                <div className="absolute bottom-4 left-6 z-20 right-6">
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedCountry.name}</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewMode('career')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors
                        ${viewMode === 'career' ? 'bg-cyan-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                      <Briefcase size={12} /> İş & Vize
                    </button>
                    <button 
                      onClick={() => setViewMode('education')}
                      className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors
                        ${viewMode === 'education' ? 'bg-purple-600 text-white' : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'}`}
                    >
                      <GraduationCap size={12} /> Yüksek Lisans
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900">
                
                {viewMode === 'career' ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                     <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">Maaş</div>
                          <div className="text-sm font-bold text-green-400">{selectedCountry.salary}</div>
                        </div>
                        <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                          <div className="text-xs text-slate-500 mb-1">Zorluk</div>
                           <div className={`text-sm font-bold ${selectedCountry.difficulty > 50 ? 'text-red-400' : 'text-green-400'}`}>
                             {selectedCountry.difficulty > 60 ? 'Yüksek' : 'Orta/Düşük'}
                           </div>
                        </div>
                     </div>
                     
                     <div>
                       <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Layout size={12}/> Genel Durum</h4>
                       <p className="text-sm text-slate-300 leading-relaxed pl-3 border-l-2 border-slate-700">{selectedCountry.desc}</p>
                     </div>

                     <div className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl">
                        <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2"><Terminal size={14}/> Strateji</h4>
                        <p className="text-xs text-slate-300 font-mono">{selectedCountry.strategy}</p>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                     <div className="space-y-3">
                        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex justify-between">
                           <div className="text-xs text-slate-500 flex items-center gap-1"><Coins size={12}/> Eğitim Ücreti</div>
                           <div className="text-sm font-bold text-white text-right">{selectedCountry.education.tuition}</div>
                        </div>
                        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex justify-between">
                           <div className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> Çalışma Hakkı</div>
                           <div className="text-sm font-bold text-yellow-400 text-right">{selectedCountry.education.workRights}</div>
                        </div>
                     </div>

                     <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2"><Building size={12}/> İyi Okullar</h4>
                        <div className="flex flex-wrap gap-2">
                           {selectedCountry.education.topUnis.map(u => (
                             <span key={u} className="text-xs bg-purple-900/20 text-purple-300 px-2 py-1 rounded border border-purple-500/20">{u}</span>
                           ))}
                        </div>
                     </div>
                     
                     <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-2"><Award size={12}/> Mezuniyet Sonrası</h4>
                        <p className="text-sm text-green-400 font-bold">{selectedCountry.education.postGrad} <span className="text-slate-400 font-normal text-xs">oturma izni</span></p>
                        <p className="text-xs text-slate-500 mt-2 italic">"{selectedCountry.education.note}"</p>
                     </div>
                  </div>
                )}

                {/* Notes Section */}
                <div className="pt-6 mt-2 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                      <Save size={12} /> Özel Notlar
                    </h4>
                    {!showNoteInput && userNotes[selectedCountry.id] && (
                       <button onClick={() => setShowNoteInput(true)} className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">Düzenle</button>
                    )}
                  </div>

                  {showNoteInput ? (
                    <div className="space-y-2">
                      <textarea 
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-cyan-500 outline-none min-h-[80px]"
                        placeholder="Hedefler..."
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveNote} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-1.5 rounded text-xs font-bold">Kaydet</button>
                        <button onClick={() => setShowNoteInput(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-1.5 rounded text-xs">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setShowNoteInput(true)}
                      className="bg-slate-800/50 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-lg p-3 text-sm text-slate-400 cursor-pointer transition-colors"
                    >
                      {userNotes[selectedCountry.id] || "Henüz not eklemedin. Tıkla ve plan yap."}
                    </div>
                  )}

                  <a 
                    href={selectedCountry.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 w-full bg-slate-100 hover:bg-white text-slate-900 py-3 rounded-lg font-bold text-sm transition-colors"
                  >
                    Resmi Kaynağa Git <ExternalLink size={14} />
                  </a>
                </div>

              </div>
            </div>
          )}

          {/* Desktop Empty State */}
          <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-slate-900 border-l border-slate-800 text-slate-600">
             {!selectedCountry && (
               <>
                 <Globe size={64} className="mb-4 opacity-10" />
                 <p className="text-sm">Detayları görmek için soldan bir ülke seçin.</p>
               </>
             )}
          </div>

        </main>
      </div>
    </div>
  );
}
