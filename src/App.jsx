import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, Coins, Clock, Building, Award, Code, Cpu, Activity,
  Calendar, Settings, BarChart3, CheckCircle2, Users, Lightbulb,
  Linkedin, Cloud, Check, Loader2, Edit3, BrainCircuit, ChevronDown, ChevronUp
} from 'lucide-react';

// --- FIREBASE ENTEGRASYONU ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

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

// --- VERİTABANI (TÜM GELİŞMİŞ ÜLKELER EKLENDİ) ---
const allCountries = [
  // --- ÖNCELİKLİ / POPÜLER (En Üstte) ---
  {
    id: 'uk', name: 'Birleşik Krallık', englishName: 'United Kingdom', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 60, 
    visa: 'Skilled Worker', 
    tags: ['Fintech', 'Savunma'],
    salary: '£35k - £55k',
    desc: 'Londra finans ve teknoloji başkenti. ARM, Rolls-Royce gibi mühendislik devleri burada. "High Potential Individual" vizesi fırsattır.',
    strategy: 'HPI vizesini veya "Graduate Visa" veren bir Master programını hedefle.',
    link: 'https://www.gov.uk/browse/visas-immigration/work-visas',
    education: { tuition: '£15k - £25k / Yıl', workRights: 'Haftada 20 Saat', postGrad: '2 Yıl (Graduate Route)', topUnis: ['Imperial College', 'Manchester Univ'], note: 'Mezuniyet sonrası 2 yıl şartsız çalışma izni.' }
  },
  {
    id: 'de', name: 'Almanya', englishName: 'Germany', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 35, 
    visa: 'Chancenkarte', 
    tags: ['Otomotiv', 'Sanayi 4.0'],
    salary: '€48k - €60k',
    desc: 'Mühendislik için dünyanın 1 numarası. Devlet üniversiteleri (TU9) neredeyse ücretsizdir.',
    strategy: 'İş: Chancenkarte ile git. Master: Not ortalaman 2.7 üzeriyse TU\'lara başvur. ZAB belgesi şart.',
    link: 'https://www.daad.de/en/',
    education: { tuition: 'Ücretsiz (~300€)', workRights: 'Haftada 20 Saat', postGrad: '18 Ay İzin', topUnis: ['TU Munich', 'RWTH Aachen'], note: 'Werkstudent kültürü yaygındır.' }
  },
  {
    id: 'us', name: 'ABD', englishName: 'United States', region: 'Amerika', 
    tier: 'Tier 3', difficulty: 95, 
    visa: 'F1 Visa', 
    tags: ['Tech Giant', 'Maksimum Maaş'],
    salary: '$90k - $120k',
    desc: 'Teknolojinin kalbi. En yüksek maaşlar burada ama rekabet ve vize süreci (Lottery) en zor olanıdır.',
    strategy: 'Tek gerçekçi yol: STEM Master yapıp 3 yıl çalışma izni (OPT) almak.',
    link: 'https://educationusa.state.gov/', 
    education: { tuition: '$30k - $60k / Yıl', workRights: 'Kampüs İçi 20 Saat', postGrad: '3 Yıl (STEM OPT)', topUnis: ['MIT', 'Stanford', 'Georgia Tech'], note: 'Kampüs dışı çalışma izni çok kısıtlıdır.' }
  },
  {
    id: 'ca', name: 'Kanada', englishName: 'Canada', region: 'Amerika', 
    tier: 'Tier 2', difficulty: 55, 
    visa: 'Express Entry', 
    tags: ['Göçmen Dostu', 'AI'],
    salary: 'CAD 65k - 90k',
    desc: 'Toronto ve Vancouver büyük teknoloji merkezleridir. Göçmenlik politikaları şeffaftır.',
    strategy: 'Master sonrası PGWP (Post-Grad Work Permit) almak vatandaşlığa giden en net yoldur.',
    link: 'https://www.canada.ca/', 
    education: { tuition: 'CAD 20k - 40k', workRights: 'Haftada 24 Saat', postGrad: '3 Yıl (PGWP)', topUnis: ['U of Toronto', 'Waterloo'], note: 'Eğitim süresi kadar çalışma izni verilir.' }
  },
  {
    id: 'ch', name: 'İsviçre', englishName: 'Switzerland', region: 'Avrupa', 
    tier: 'Tier 3', difficulty: 90, 
    visa: 'Quota System', 
    tags: ['Maksimum Maaş', 'Robotik'],
    salary: 'CHF 85k+',
    desc: 'Avrupa\'nın en yüksek maaşları. Google, ABB ve Roche burada. AB dışı vatandaşlar için kota sistemi vardır.',
    strategy: 'Doğrudan girmek çok zordur. Önce Almanya\'da deneyim kazanıp sınır ötesi geçiş yap.',
    link: 'https://www.sem.admin.ch/', 
    education: { tuition: 'CHF 1.5k / Yıl', workRights: 'Haftada 15 Saat', postGrad: '6 Ay İzin', topUnis: ['ETH Zurich', 'EPFL'], note: 'Okullar ucuz ama yaşam çok pahalıdır.' }
  },
  {
    id: 'nl', name: 'Hollanda', englishName: 'Netherlands', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 65, 
    visa: 'Orientation Year', 
    tags: ['High Tech', 'ASML'],
    salary: '€50k - €70k',
    desc: 'Eindhoven (Brainport) bölgesi Avrupa\'nın en zeki km²\'si sayılır. ASML ve Philips burada.',
    strategy: 'Hollanda burslarına bak. Top 200 üniversite mezunuysan "Orientation Year" alabilirsin.',
    link: 'https://www.studyinnl.org/',
    education: { tuition: '€15k - €20k', workRights: 'Haftada 16 Saat', postGrad: '1 Yıl İzin', topUnis: ['TU Delft', 'TU Eindhoven'], note: 'Part-time iş bulmak bürokratiktir.' }
  },
  {
    id: 'au', name: 'Avustralya', englishName: 'Australia', region: 'Okyanusya', 
    tier: 'Tier 2', difficulty: 60, 
    visa: 'Subclass 482', 
    tags: ['Yüksek Yaşam', 'Maden'],
    salary: 'AUD 80k+',
    desc: 'Mühendisler için "Skilled Occupation List" her zaman açıktır. Yaşam standartları çok yüksektir.',
    strategy: 'Master (Subclass 500) en iyi giriş yoludur. Yeni mezun vizesi (476) kapandı.',
    link: 'https://immi.homeaffairs.gov.au/', 
    education: { tuition: 'AUD 30k+', workRights: 'Haftada 24 Saat', postGrad: '2-4 Yıl İzin', topUnis: ['UNSW', 'Melbourne'], note: 'Tatillerde full-time çalışma izni.' }
  },

  // --- İSKANDİNAVYA ---
  {
    id: 'no', name: 'Norveç', englishName: 'Norway', region: 'Kuzey', 
    tier: 'Tier 2', difficulty: 65, 
    visa: 'Skilled Worker', 
    tags: ['Enerji', 'Yüksek Yaşam'],
    salary: '€55k - €75k',
    desc: 'Petrol ve yenilenebilir enerji sektörü çok güçlüdür. Mühendis maaşları çok yüksektir.',
    strategy: 'İş teklifi şarttır. Master eğitimi AB dışına ücretlidir.',
    link: 'https://www.udi.no/en/',
    education: { tuition: 'AB dışına Ücretli', workRights: 'Haftada 20 Saat', postGrad: '1 Yıl İzin', topUnis: ['NTNU', 'Univ of Oslo'], note: 'Eskiden ücretsizdi, artık ücretli.' }
  },
  {
    id: 'se', name: 'İsveç', englishName: 'Sweden', region: 'Kuzey', tier: 'Tier 2', difficulty: 45, visa: 'Job Seeker', tags: ['İnovasyon', 'Volvo'], salary: '40k SEK', desc: 'Ericsson ve Volvo burada. İş-yaşam dengesi mükemmel.', strategy: 'İş arama vizesine başvurabilirsin.', link: 'https://studyinsweden.se/', education: { tuition: '€10k - €15k', workRights: 'Limitsiz', postGrad: '12 Ay İzin', topUnis: ['KTH', 'Chalmers'], note: 'Öğrenciyken saat sınırı yoktur.' } 
  },
  {
    id: 'fi', name: 'Finlandiya', englishName: 'Finland', region: 'Kuzey', tier: 'Tier 2', difficulty: 50, visa: 'Specialist Visa', tags: ['Telekom', 'Nokia'], salary: '€40k - €60k', desc: 'Nokia\'nın evi. 5G/6G teknolojileri. "Finland Works" programına bak.', strategy: 'Yazılım ve telekomda açık çok.', link: 'https://migri.fi/', education: { tuition: '€10k - €12k', workRights: 'Haftada 30 Saat', postGrad: '2 Yıl İzin', topUnis: ['Aalto Univ'], note: 'Çalışma saati 30\'a yükseltildi.' }
  },
  {
    id: 'dk', name: 'Danimarka', englishName: 'Denmark', region: 'Kuzey', tier: 'Tier 2', difficulty: 55, visa: 'Positive List', tags: ['Rüzgar Enerjisi', 'Lego'], salary: '€50k - €70k', desc: 'Vestas ve Lego burada. Mühendislik "Positive List" içinde.', strategy: 'Kopenhag çevresine odaklan.', link: 'https://www.nyidanmark.dk/', education: { tuition: '€6k - €16k', workRights: 'Haftada 20 Saat', postGrad: '3 Yıl', topUnis: ['DTU'], note: 'Mezuniyette 3 yıl kalma izni.' }
  },

  // --- BATI & ORTA AVRUPA ---
  {
    id: 'ie', name: 'İrlanda', englishName: 'Ireland', region: 'Avrupa', tier: 'Tier 2', difficulty: 45, visa: 'Critical Skills', tags: ['Big Tech HQ'], salary: '€40k - €60k', desc: 'Google, Meta Avrupa merkezleri. İngilizce konuşulan tek AB ülkesi.', strategy: 'Critical Skills vizesine başvur.', link: 'https://enterprise.gov.ie/', education: { tuition: '€12k - €18k', workRights: 'Haftada 20 Saat', postGrad: '2 Yıl İzin', topUnis: ['Trinity College'], note: 'Mezuniyet sonrası 2 yıl.' }
  },
  {
    id: 'fr', name: 'Fransa', englishName: 'France', region: 'Avrupa', tier: 'Tier 2', difficulty: 50, visa: 'Passeport Talent', tags: ['Havacılık', 'Enerji'], salary: '€40k - €55k', desc: 'Airbus, Thales, Schneider Electric.', strategy: 'Mühendislikte İngilizce rol çok ama sosyal hayat için Fransızca şart.', link: 'https://france-visas.gouv.fr/', education: { tuition: '€243 - €3.7k', workRights: 'Yıllık 964 Saat', postGrad: '1 Yıl', topUnis: ['CentraleSupélec'], note: 'Devlet okulları ucuzdur.' }
  },
  {
    id: 'at', name: 'Avusturya', englishName: 'Austria', region: 'Avrupa', tier: 'Tier 2', difficulty: 50, visa: 'RWR Card', tags: ['Yarı İletken'], salary: '€45k - €65k', desc: 'Infineon gibi çip üreticileri var. Almanya\'ya benzer.', strategy: 'B1 Almanca büyük avantaj.', link: 'https://www.migration.gv.at/', education: { tuition: '€1.5k / Yıl', workRights: 'Haftada 20 Saat', postGrad: '1 Yıl', topUnis: ['TU Wien'], note: 'Eğitim çok makul.' }
  },
  {
    id: 'be', name: 'Belçika', englishName: 'Belgium', region: 'Avrupa', tier: 'Tier 2', difficulty: 45, visa: 'Single Permit', tags: ['Mikroelektronik', 'AB'], salary: '€40k - €55k', desc: 'IMEC (Dünyanın en büyük yarı iletken ar-ge merkezi) Leuven\'dedir.', strategy: 'IMEC stajlarına başvur.', link: 'https://www.international.socialsecurity.be/', education: { tuition: '€1k - €4k / Yıl', workRights: 'Haftada 20 Saat', postGrad: '1 Yıl', topUnis: ['KU Leuven'], note: 'KU Leuven mühendislikte çok iyidir.' }
  },

  // --- GÜNEY AVRUPA & DOĞU BLOKU ---
  {
    id: 'es', name: 'İspanya', englishName: 'Spain', region: 'Avrupa', tier: 'Tier 2', difficulty: 40, visa: 'Highly Qualified', tags: ['Telekom', 'Güneş'], salary: '€30k - €45k', desc: 'Yenilenebilir enerji sektörü güçlüdür.', strategy: 'Barselona ve Madrid teknoloji merkezleridir.', link: 'https://www.exteriores.gob.es/', education: { tuition: '€2k - €5k', workRights: 'Haftada 30 Saat', postGrad: '1 Yıl İzin', topUnis: ['UPC'], note: 'Öğrenciyken çalışma izni almak kolaylaştı.' }
  },
  {
    id: 'it', name: 'İtalya', englishName: 'Italy', region: 'Avrupa', tier: 'Tier 1', difficulty: 25, visa: 'DSU Bursu', tags: ['Burslu Master', 'Otomotiv'], salary: '€28k - €35k', desc: 'DSU Bursu ile okul ücreti ödemezsin, üste para ve yurt alırsın.', strategy: 'Torino mühendislik için ideal.', link: 'https://www.universitaly.it/', education: { tuition: 'Burs ile Bedava', workRights: 'Haftada 20 Saat', postGrad: '12 Ay İzin', topUnis: ['Politecnico di Milano'], note: 'Burs başvuruları Eylülde.' }
  },
  {
    id: 'pl', name: 'Polonya', englishName: 'Poland', region: 'Avrupa', tier: 'Tier 1', difficulty: 20, visa: 'Work Permit', tags: ['Ucuz Yaşam', 'Yazılım'], salary: '€25k - €40k', desc: 'Avrupa\'nın yazılım fabrikası. Vize süreci kolay.', strategy: 'Master yaparken tam zamanlı yazılımcı olarak çalışabilirsin.', link: 'https://study.gov.pl/', education: { tuition: '€2k - €4k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['Warsaw Tech'], note: 'Öğrenciyken izin gerekmez.' }
  },
  {
    id: 'cz', name: 'Çekya', englishName: 'Czechia', region: 'Avrupa', tier: 'Tier 1', difficulty: 30, visa: 'Student Visa', tags: ['Teknik', 'Merkezi'], salary: '€35k', desc: 'Çekçe okursan bedava.', strategy: 'CVUT Prag Teknik çok iyidir.', link: 'https://www.studyin.cz/', education: { tuition: '€3k - €5k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['CTU Prague'], note: 'Akredite programda izin gerekmez.' }
  },
  {
    id: 'pt', name: 'Portekiz', englishName: 'Portugal', region: 'Avrupa', tier: 'Tier 1', difficulty: 10, visa: 'Job Seeker', tags: ['Ucuz', 'Kolay'], salary: '€20k', desc: 'Avrupa\'ya en kolay giriş.', strategy: 'Job Seeker vizesiyle git, oradan Almanya\'ya başvur.', link: 'https://vistos.mne.gov.pt/', education: { tuition: '€1k - €3k', workRights: 'Haftada 20 Saat', postGrad: 'Kolay Geçiş', topUnis: ['Porto Univ'], note: 'SEF bildirimi gerekli.' }
  },
  {
    id: 'ee', name: 'Estonya', englishName: 'Estonia', region: 'Avrupa', tier: 'Tier 2', difficulty: 25, visa: 'Startup Visa', tags: ['Dijital', 'Yazılım'], salary: '€35k', desc: 'Yazılım odaklıysan 1 numara.', strategy: 'TalTech başvurularını kaçırma.', link: 'https://www.studyinestonia.ee/', education: { tuition: '€3k / Yıl', workRights: 'Limitsiz (Full-Time)', postGrad: '9 Ay', topUnis: ['TalTech'], note: 'Dersleri geçmen şartıyla sınırsız çalışma.' }
  },

  // --- ASYA ---
  {
    id: 'jp', name: 'Japonya', englishName: 'Japan', region: 'Asya', tier: 'Tier 2', difficulty: 60, visa: 'Engineer', tags: ['Robotik', 'Disiplin'], salary: '¥4M+', desc: 'Teknoloji devi. MEXT bursu ile gitmek en mantıklısı.', strategy: 'Daijob sitesini kullan.', link: 'https://www.mofa.go.jp/', education: { tuition: 'MEXT ile Bedava', workRights: 'Haftada 28 Saat', postGrad: 'İş bulana kadar', topUnis: ['Tokyo Tech'], note: 'Özel izinle çalışabilirsin.' }
  },
  {
    id: 'kr', name: 'Güney Kore', englishName: 'South Korea', region: 'Asya', tier: 'Tier 2', difficulty: 55, visa: 'E-7 Visa', tags: ['Samsung', 'Batarya'], salary: '₩40M+', desc: 'Samsung, LG, Hyundai. GKS bursu çok popüler.', strategy: 'GKS bursuna başvur.', link: 'https://www.visa.go.kr/', education: { tuition: 'GKS ile Bedava', workRights: 'Haftada 20 Saat', postGrad: '2 Yıl', topUnis: ['KAIST'], note: '6 aydan sonra çalışma izni.' }
  }
];

const engineerRoles = [
  { title: "Junior Embedded Software Engineer", label: "Gömülü Yazılım (Genel)" },
  { title: "Junior Firmware Engineer", label: "Firmware (Donanım Odaklı)" },
  { title: "Junior IoT Engineer", label: "IoT (İnternet & Cihazlar)" },
  { title: "Test Automation Engineer Python", label: "Test/Validation (Python)" },
  { title: "PLC Automation Engineer", label: "PLC / Otomasyon" },
  { title: "System Integration Engineer", label: "Sistem Entegrasyon" }
];

const skillFocusData = [
    { icon: Cpu, title: 'Embedded C / Bare Metal', detail: 'STM32, ESP32 ve HAL kütüphanesi olmadan sürücü yazımı.' },
    { icon: Code, title: 'RTOS (Real-Time OS)', detail: 'FreeRTOS ile Task, Queue, Semaphore kullanımı.' },
    { icon: Activity, title: 'Protokoller', detail: 'CAN Bus, I2C, SPI, UART, MQTT/HTTP.' },
    { icon: AlertTriangle, title: 'Bonus: Yazılım', detail: 'Python (veri analizi) veya JavaScript/React (Full-Stack gömülü sistem arayüzü).' },
];

const projectIdeas = {
  "Junior Embedded Software Engineer": [
    { title: "STM32 Bootloader", desc: "UART üzerinden kendi bootloader'ını yazıp firmware güncellemesi yap." },
    { title: "RTOS Weather Station", desc: "FreeRTOS kullanarak sensör verilerini (I2C) okuyup ekrana basan çoklu task yapısı kur." }
  ],
  "Junior Firmware Engineer": [
    { title: "Bare Metal SPI Driver", desc: "HAL kütüphanesi kullanmadan register seviyesinde SPI driver'ı yaz." },
    { title: "USB HID Device", desc: "Mikrodenetleyiciyi bilgisayara klavye/mouse olarak tanıt." }
  ],
  "Junior IoT Engineer": [
    { title: "MQTT Dashboard", desc: "ESP32 ile sıcaklık verisini AWS/Azure IoT Core'a gönder ve grafiğe dök." },
    { title: "Smart Home Hub", desc: "Home Assistant ile entegre çalışan bir akıllı priz tasarla." }
  ],
  "Test Automation Engineer Python": [
    { title: "HIL Simulation Script", desc: "Python (PySerial) ile mikrodenetleyiciye seri porttan komut gönderip yanıtı doğrulayan script yaz." },
    { title: "Log Analyzer", desc: "Cihaz loglarını parse edip hata raporu oluşturan bir araç geliştir." }
  ],
  "PLC Automation Engineer": [
    { title: "Traffic Light Logic", desc: "Trafik ışığı simülasyonunu Ladder Logic ile tasarla." },
    { title: "Tank Level Control", desc: "PID kontrol ile su tankı seviyesini sabitleyen otomasyon." }
  ],
  "System Integration Engineer": [
    { title: "Sensor Fusion", desc: "İvmeölçer ve Jiroskop verilerini Kalman Filtresi ile birleştir." },
    { title: "CAN Bus Sniffer", desc: "Araç içi haberleşme (CAN) verilerini dinleyen ve analiz eden bir donanım yap." }
  ]
};

export default function CareerCommandCenterV11() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('career');
  const [selectedRole, setSelectedRole] = useState(engineerRoles[0].title); 
  
  const [user, setUser] = useState(null);
  const [userNotes, setUserNotes] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting'); 

  // --- DÜZELTİLEN DEĞİŞKEN İSMİ ---
  const [currentNote, setCurrentNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const diffDays = Math.ceil(Math.abs(new Date('2026-01-31') - new Date()) / (1000 * 60 * 60 * 24));

  useEffect(() => {
    if (!auth) return;
    
    signInAnonymously(auth).then((userCredential) => {
        const currentUser = userCredential.user;
        setUser(currentUser);
        setDbStatus('connected');
        const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnapshot) => {
            if (docSnapshot.exists()) {
                const data = docSnapshot.data();
                if (data && data.notes) setUserNotes(data.notes);
            }
        });
        return () => unsub();
    }).catch((error) => {
        console.error("Giriş Hatası:", error);
        setDbStatus('error');
    });
  }, []);

  const handleSaveNote = async () => {
    if (!user) { alert("Veritabanı bağlantısı yok veya yükleniyor..."); return; }
    setIsSaving(true);
    const updatedNotes = { ...userNotes, [selectedCountry.id]: currentNote };
    setUserNotes(updatedNotes); 
    try {
        await setDoc(doc(db, "users", user.uid), { notes: updatedNotes }, { merge: true });
        setTimeout(() => { setIsSaving(false); setShowNoteInput(false); }, 500);
    } catch (e) {
        console.error("Yazma hatası:", e);
        setIsSaving(false);
        alert("Kaydedilemedi.");
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      setCurrentNote(userNotes[selectedCountry.id] || '');
      setShowNoteInput(false); 
    }
  }, [selectedCountry, userNotes]);

  const performGoogleSearch = (country) => {
    const jobTitle = selectedRole; 
    const location = country.englishName || country.name; 
    const query = `${jobTitle} jobs in ${location}`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const performNetworkSearch = (type, country) => {
    let query = "";
    if (type === 'alumni') {
        query = `site:linkedin.com/in/ "Turkish" AND ("Engineer" OR "Mühendis") AND "Embedded" AND "${country.englishName}"`;
    } else if (type === 'recruiter') {
        query = `site:linkedin.com/in/ "Recruiter" AND ("Tech" OR "Engineering") AND "${country.englishName}"`;
    }
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
  }, [filteredData, selectedCountry]);

  return (
    <div className="flex w-full h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden flex-col md:flex-row relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-200px,#1e293b,transparent)] z-0 pointer-events-none"></div>

      {/* SIDEBAR */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 md:relative md:translate-x-0 shrink-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl h-full`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Zap size={20} fill="currentColor" className="drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">KARİYER-V11</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={20} /></button>
        </div>
        <nav className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-xs font-bold transition-colors ${dbStatus === 'connected' ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : dbStatus === 'error' ? 'bg-red-900/30 border-red-500/30 text-red-400' : 'bg-yellow-900/30 border-yellow-500/30 text-yellow-400'}`}>
             {dbStatus === 'connected' ? <Cloud size={14}/> : dbStatus === 'error' ? <AlertTriangle size={14}/> : <Loader2 size={14} className="animate-spin"/>}
             <span className="truncate">{dbStatus === 'connected' ? 'Veritabanı Aktif' : dbStatus === 'error' ? 'Bağlantı Hatası' : 'Bağlanıyor...'}</span>
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">Bölgeler</h3>
            <div className="space-y-1">
              {['All', 'Avrupa', 'Asya', 'Amerika', 'Kuzey', 'Okyanusya'].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex justify-between items-center group ${activeTab === tab ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                  {tab === 'All' ? 'Tüm Dünyalar' : tab}
                  {activeTab === tab && <ChevronRight size={14} className="animate-pulse" />}
                </button>
              ))}
            </div>
          </div>
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
        <div className="p-4 border-t border-white/10 bg-slate-900/50 shrink-0">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 shadow-lg relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <div className="flex justify-between items-center mb-2 relative z-10">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><Clock size={12} className="text-cyan-400" /> Mezuniyet</span>
                <span className="text-xs text-white font-mono font-bold">{diffDays} Gün</span>
             </div>
             <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden relative z-10"><div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: '75%' }}></div></div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full z-10 relative">
        <header className="h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3 w-full max-w-md">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-slate-400 p-1 rounded hover:bg-white/5"><Menu size={24} /></button>
            <div className="relative w-full group">
              <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={16} />
              <input type="text" placeholder="Ülke ara..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="hidden md:block">
             <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-800/50 rounded-full border border-white/10 shadow-sm">
               <GraduationCap size={16} className="text-cyan-400"/><span className="text-xs font-bold text-slate-300 tracking-wide">OCAK 2026</span>
             </div>
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden relative">
          {/* LIST */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth min-w-0 border-r border-white/5 pb-20">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredData.map(country => (
                <div key={country.id} onClick={() => setSelectedCountry(country)} className={`group relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedCountry?.id === country.id ? 'bg-slate-800/80 border-cyan-500/50 shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/20' : 'bg-slate-900/40 border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/60 hover:shadow-lg hover:-translate-y-1'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className={`text-base font-bold transition-colors ${selectedCountry?.id === country.id ? 'text-cyan-400' : 'text-slate-200 group-hover:text-white'}`}>{country.name}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1"><MapPin size={12} className={selectedCountry?.id === country.id ? 'text-cyan-500' : ''} /> {country.region}</div>
                    </div>
                    <div className="flex gap-1 mt-1">{[1,2,3,4,5].map(bar => (<div key={bar} className={`w-1 h-3 rounded-full transition-all duration-500 ${(country.difficulty / 20) >= bar ? (country.difficulty > 70 ? 'bg-red-500' : country.difficulty > 40 ? 'bg-yellow-500' : 'bg-emerald-500') : 'bg-slate-800'}`}/>))}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950/50 border border-white/10 text-slate-300 group-hover:border-white/20 transition-colors">{country.visa}</span>
                    {country.education.workRights.includes('Limitsiz') && (<span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1"><CheckCircle2 size={10} /> Full-Work</span>)}
                  </div>
                  {userNotes[country.id] && (<div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse" />)}
                </div>
              ))}
            </div>
          </div>
          
          {/* MIDDLE */}
          {selectedCountry && (
             <div className="hidden 2xl:flex w-[320px] flex-col p-4 bg-slate-900/30 backdrop-blur-sm border-l border-white/5 shrink-0 overflow-y-auto">
               <h3 className="text-xs font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2 uppercase tracking-wider sticky top-0 bg-slate-900/90 z-10 py-2 -mt-2"><Activity className="text-yellow-400" size={14} /> Taktiksel Destek</h3>
               <div className="mb-6">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Users size={10} /> Network İstihbaratı</h4>
                 <div className="space-y-2">
                   <button onClick={() => performNetworkSearch('alumni', selectedCountry)} className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 p-2.5 rounded-xl flex items-center gap-3 transition-all group text-left">
                     <div className="p-1.5 bg-blue-900/30 text-blue-400 rounded-lg group-hover:text-white transition-colors"><Linkedin size={14}/></div>
                     <div><div className="text-xs font-bold text-slate-200 group-hover:text-white">Türk Mühendisleri Bul</div><div className="text-[9px] text-slate-500">{selectedCountry.name} konumunda</div></div>
                   </button>
                   <button onClick={() => performNetworkSearch('recruiter', selectedCountry)} className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 p-2.5 rounded-xl flex items-center gap-3 transition-all group text-left">
                     <div className="p-1.5 bg-purple-900/30 text-purple-400 rounded-lg group-hover:text-white transition-colors"><Search size={14}/></div>
                     <div><div className="text-xs font-bold text-slate-200 group-hover:text-white">İşe Alımcıları Bul</div><div className="text-[9px] text-slate-500">Tech Recruiters</div></div>
                   </button>
                 </div>
               </div>
               <div>
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><Lightbulb size={10} /> Önerilen Projeler</h4>
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

          {/* DETAIL */}
          {selectedCountry && (
            <div className="fixed inset-0 z-40 md:static md:z-auto md:w-[480px] md:border-l md:border-white/10 bg-slate-900/95 backdrop-blur-xl flex flex-col transition-all duration-300 shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
              <div className="relative h-48 shrink-0 overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${selectedCountry.tier === 'Tier 1' ? 'from-emerald-900/40 via-slate-900 to-slate-900' : selectedCountry.tier === 'Tier 2' ? 'from-blue-900/40 via-slate-900 to-slate-900' : 'from-red-900/40 via-slate-900 to-slate-900'} z-0`}></div>
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                <button onClick={() => setSelectedCountry(null)} className="absolute top-6 left-6 z-20 md:hidden bg-black/50 p-2 rounded-full text-white backdrop-blur-md"><ArrowRight size={20} className="rotate-180" /></button>
                <div className="absolute bottom-6 left-8 z-20 right-8">
                  <div className="flex items-center gap-3 mb-2">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${selectedCountry.tier === 'Tier 1' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : selectedCountry.tier === 'Tier 2' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>{selectedCountry.tier}</div>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
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
                      <div className="absolute -left-1 top-4 w-1 h-6 bg-cyan-500 rounded-r-full"></div>
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
                    {!showNoteInput && userNotes[selectedCountry.id] && (<button onClick={() => setShowNoteInput(true)} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium bg-cyan-950/30 px-2 py-1 rounded-full border border-cyan-500/20">Düzenle</button>)}
                  </div>
                  {showNoteInput ? (
                    <div className="space-y-2 animate-in zoom-in-95 duration-200">
                      <textarea className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none min-h-[80px] shadow-inner" placeholder="Hedeflerini yaz..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={handleSaveNote} disabled={isSaving} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <><Check size={12}/> Kaydet</>}
                        </button>
                        <button onClick={() => setShowNoteInput(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs transition-all border border-white/10">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => setShowNoteInput(true)} className="bg-slate-800/30 hover:bg-slate-800/60 border border-dashed border-slate-600 hover:border-cyan-500/50 rounded-xl p-3 text-xs text-slate-400 cursor-pointer transition-all flex flex-col items-center justify-center text-center gap-1 min-h-[60px] group">
                      {userNotes[selectedCountry.id] ? (<p className="text-left w-full text-slate-300 whitespace-pre-wrap">{userNotes[selectedCountry.id]}</p>) : (<><div className="p-1.5 bg-slate-800 rounded-full group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors"><Save size={14}/></div><span>Henüz not eklemedin. Plan yapmaya başla.</span></>)}
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
