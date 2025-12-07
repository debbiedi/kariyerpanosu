import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, Coins, Clock, Building, Award, Code, Cpu, Activity,
  Calendar, Settings, BarChart3, CheckCircle2, Users, Lightbulb,
  Linkedin, Cloud, Check, Loader2, Edit3, ClipboardList, Plus, Trash2, ArrowRightCircle, LogOut, LogIn, 
  ListTodo, PieChart, FileCheck, Link as LinkIcon
} from 'lucide-react';

// --- FIREBASE ENTEGRASYONU ---
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

// Kullanıcı tarafından sağlanan sabit Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyDepkmn5L-OZXdT8mKf9sHDqhBoJNSI90o",
  authDomain: "kariyerpanosu.firebaseapp.com",
  projectId: "kariyerpanosu",
  storageBucket: "kariyerpanosu.firebasestorage.app",
  messagingSenderId: "24937941128",
  appId: "1:24937941128:web:ac7d3d38dccde96c97373d"
};

// Vercel gibi ortamlarda __app_id tanımlı olmayabilir, bu yüzden sabit bir ID kullanmak daha güvenlidir.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'kariyer-panosu-v1';

let app, db, auth;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
} catch (e) {
    console.error("Firebase Hatası:", e);
}

// --- CHECKLIST ŞABLONLARI ---
const commonChecklist = [
    "Pasaportun geçerlilik süresini kontrol et (en az 1 yıl)",
    "Diploma ve Transkript İngilizce tercümesi",
    "Adli Sicil Kaydı (E-Devlet)",
    "CV'ni o ülkenin formatına göre güncelle",
    "LinkedIn profilini hedef ülkeye göre düzenle"
];

// --- VERİTABANI (TÜM LİSTE) ---
const allCountries = [
  // TIER 1 & POPÜLER
  {
    id: 'uk', name: 'Birleşik Krallık', englishName: 'United Kingdom', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 60, visa: 'Skilled Worker', tags: ['Fintech', 'Savunma'], salary: '£35k - £55k',
    desc: 'Londra finans ve teknoloji başkenti. "High Potential Individual" vizesi büyük fırsattır.',
    strategy: 'HPI vizesini veya "Graduate Visa" veren bir Master programını hedefle.',
    link: 'https://www.gov.uk/browse/visas-immigration/work-visas',
    education: { tuition: '£15k - £25k', workRights: '20 Saat/Hafta', postGrad: '2 Yıl', topUnis: ['Imperial', 'Manchester'], note: 'Mezuniyet sonrası 2 yıl izin.' },
    checklist: [...commonChecklist, "IELTS UKVI sınavına gir", "TB (Verem) Testi yaptır", "Skilled Worker sponsorlu iş bul"]
  },
  {
    id: 'de', name: 'Almanya', englishName: 'Germany', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 35, visa: 'Chancenkarte', tags: ['Otomotiv', 'Sanayi 4.0'], salary: '€48k - €60k',
    desc: 'Mühendislik devi. TU9 üniversiteleri ücretsizdir.',
    strategy: 'İş: Chancenkarte. Master: Not ortalaman 2.7 üzerindeyse başvur.',
    link: 'https://www.daad.de/en/',
    education: { tuition: 'Ücretsiz', workRights: '20 Saat/Hafta', postGrad: '18 Ay', topUnis: ['TU Munich', 'RWTH Aachen'], note: 'Werkstudent yaygındır.' },
    checklist: [...commonChecklist, "Bloke Hesap (Sperrkonto) aç", "Sağlık Sigortası (Krankenkasse)", "ZAB Denklik Belgesi al", "Almanca A1/A2 sertifikası"]
  },
  {
    id: 'us', name: 'ABD', englishName: 'United States', region: 'Amerika', 
    tier: 'Tier 3', difficulty: 95, visa: 'F1 Visa', tags: ['Tech Giant'], salary: '$90k - $120k',
    desc: 'Teknolojinin kalbi. En yüksek maaşlar burada.',
    strategy: 'STEM Master yapıp 3 yıl çalışma izni (OPT) al.',
    link: 'https://educationusa.state.gov/', 
    education: { tuition: '$30k+', workRights: '20 Saat (Kampüs İçi)', postGrad: '3 Yıl (STEM OPT)', topUnis: ['MIT', 'Stanford'], note: 'OPT hayati önem taşır.' },
    checklist: [...commonChecklist, "DS-160 Formunu doldur", "SEVIS ücretini öde", "I-20 belgesini okuldan al", "Banka teminat mektubu hazırla"]
  },
  {
    id: 'ca', name: 'Kanada', englishName: 'Canada', region: 'Amerika', 
    tier: 'Tier 2', difficulty: 55, visa: 'Express Entry', tags: ['Göçmen Dostu'], salary: 'CAD 65k - 90k',
    desc: 'Toronto ve Vancouver teknoloji merkezleri. Göçmenlik politikaları şeffaf.',
    strategy: 'Master sonrası PGWP (Çalışma izni) almak vatandaşlığa götürür.',
    link: 'https://www.canada.ca/', 
    education: { tuition: 'CAD 20k+', workRights: '24 Saat/Hafta', postGrad: '3 Yıl (PGWP)', topUnis: ['U of Toronto', 'Waterloo'], note: 'Eğitim süresi kadar izin.' },
    checklist: [...commonChecklist, "WES Denkliği al", "Express Entry profili oluştur", "Biometrik randevusu al"]
  },
  {
    id: 'ch', name: 'İsviçre', englishName: 'Switzerland', region: 'Avrupa', 
    tier: 'Tier 3', difficulty: 90, visa: 'Quota', tags: ['Maksimum Maaş'], salary: 'CHF 85k+',
    desc: 'Avrupa\'nın en yüksek maaşları. Google, ABB ve Roche burada.',
    strategy: 'Doğrudan girmek zordur. Almanya üzerinden geçiş yap.',
    link: 'https://www.sem.admin.ch/', 
    education: { tuition: 'CHF 1.5k', workRights: '15 Saat/Hafta', postGrad: '6 Ay', topUnis: ['ETH Zurich', 'EPFL'], note: 'Okul ucuz, yaşam pahalı.' },
    checklist: [...commonChecklist, "Kanton göçmenlik ofisi onayı", "Finansal yeterlilik kanıtı", "Konaklama sözleşmesi"]
  },
  {
    id: 'nl', name: 'Hollanda', englishName: 'Netherlands', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 65, visa: 'Orientation Year', tags: ['High Tech'], salary: '€50k - €70k',
    desc: 'ASML ve Philips burada. Teknoloji çok ileri.',
    strategy: 'Top 200 üniversite mezunuysan "Orientation Year" alabilirsin.',
    link: 'https://www.studyinnl.org/',
    education: { tuition: '€15k+', workRights: '16 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['TU Delft', 'Eindhoven'], note: 'Part-time iş zordur.' },
    checklist: [...commonChecklist, "BSN Numarası için randevu", "DigiD başvurusu", "Orientation Year vizesi şartlarını kontrol et"]
  },
  {
    id: 'au', name: 'Avustralya', englishName: 'Australia', region: 'Okyanusya', tier: 'Tier 2', difficulty: 60, visa: 'Subclass 482', tags: ['Yüksek Yaşam'], salary: 'AUD 80k+', desc: 'Mühendisler için "Skilled Occupation List" açık.', strategy: 'Master (Subclass 500) en iyi giriş.', link: 'https://immi.homeaffairs.gov.au/', education: { tuition: 'AUD 30k+', workRights: '24 Saat/Hafta', postGrad: '2-4 Yıl', topUnis: ['UNSW', 'Melbourne'], note: 'Tatillerde full-time.' },
    checklist: [...commonChecklist, "PTE/IELTS sınav sonucu", "Sağlık sigortası (OSHC)", "GTE (Geçici Giriş) mektubu yaz"]
  },
  // --- DİĞERLERİ ---
  {
    id: 'pl', name: 'Polonya', englishName: 'Poland', region: 'Avrupa', tier: 'Tier 1', difficulty: 20, visa: 'Work Permit', tags: ['Yazılım'], salary: '€25k - €40k', desc: 'Avrupa\'nın yazılım fabrikası. Vize kolay.', strategy: 'Master yaparken full-time çalışabilirsin.', link: 'https://study.gov.pl/', education: { tuition: '€2k - €4k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['Warsaw Tech'], note: 'İzin gerekmez.' },
    checklist: [...commonChecklist, "Çalışma izni (Type A) başvurusu", "Konaklama belgesi", "Sağlık sigortası"]
  },
  {
    id: 'it', name: 'İtalya', englishName: 'Italy', region: 'Avrupa', tier: 'Tier 1', difficulty: 25, visa: 'DSU Bursu', tags: ['Burs', 'Otomotiv'], salary: '€28k - €35k', desc: 'DSU Bursu ile bedava okuyup cep harçlığı al.', strategy: 'Torino (Fiat) ideal.', link: 'https://www.universitaly.it/', education: { tuition: 'Bursla Bedava', workRights: '20 Saat/Hafta', postGrad: '12 Ay', topUnis: ['Politecnico di Milano'], note: 'Burslar Eylülde.' },
    checklist: [...commonChecklist, "CIMEA Denklik Belgesi", "Codice Fiscale al", "DSU Bursu için ISEE paritificato belgesi"]
  },
  {
    id: 'se', name: 'İsveç', englishName: 'Sweden', region: 'Kuzey', tier: 'Tier 2', difficulty: 45, visa: 'Job Seeker', tags: ['İnovasyon'], salary: '40k SEK', desc: 'Ericsson ve Volvo burada.', strategy: 'İş arama vizesi var.', link: 'https://studyinsweden.se/', education: { tuition: '€10k+', workRights: 'Limitsiz', postGrad: '12 Ay', topUnis: ['KTH'], note: 'Sınır yok.' },
    checklist: [...commonChecklist, "Personnummer başvurusu", "İş arama vizesi şartlarını incele", "Konaklama sırasına gir"]
  },
  {
    id: 'no', name: 'Norveç', englishName: 'Norway', region: 'Kuzey', tier: 'Tier 2', difficulty: 65, visa: 'Skilled Worker', tags: ['Enerji'], salary: '€55k+', desc: 'Mühendis maaşları çok yüksek.', strategy: 'İş teklifi şart.', link: 'https://www.udi.no/', education: { tuition: 'Ücretli', workRights: '20 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['NTNU'], note: 'Yaşam pahalı.' },
    checklist: [...commonChecklist, "UDI başvuru portalına kaydol", "İş teklifi al", "Konaklama garantisi"]
  },
  {
    id: 'fi', name: 'Finlandiya', englishName: 'Finland', region: 'Kuzey', tier: 'Tier 2', difficulty: 50, visa: 'Specialist', tags: ['Telekom'], salary: '€40k+', desc: 'Nokia\'nın evi. 5G/6G.', strategy: 'Finland Works programı.', link: 'https://migri.fi/', education: { tuition: '€10k+', workRights: '30 Saat/Hafta', postGrad: '2 Yıl', topUnis: ['Aalto'], note: 'Çalışma saati arttı.' },
    checklist: [...commonChecklist, "Migri üzerinden oturum izni başvurusu", "Finland Works profili oluştur"]
  },
  {
    id: 'dk', name: 'Danimarka', englishName: 'Denmark', region: 'Kuzey', tier: 'Tier 2', difficulty: 55, visa: 'Positive List', tags: ['Rüzgar'], salary: '€50k+', desc: 'Vestas ve Lego burada.', strategy: 'Kopenhag çevresine odaklan.', link: 'https://www.nyidanmark.dk/', education: { tuition: '€6k+', workRights: '20 Saat/Hafta', postGrad: '3 Yıl', topUnis: ['DTU'], note: 'Mezuniyette 3 yıl izin.' },
    checklist: [...commonChecklist, "SIRI üzerinden başvuru yap", "NemID al", "CPR numarası kaydı"]
  },
  {
    id: 'ie', name: 'İrlanda', englishName: 'Ireland', region: 'Avrupa', tier: 'Tier 2', difficulty: 45, visa: 'Critical Skills', tags: ['Big Tech'], salary: '€40k+', desc: 'Google, Meta Avrupa merkezi.', strategy: 'Critical Skills vizesi.', link: 'https://enterprise.gov.ie/', education: { tuition: '€12k+', workRights: '20 Saat/Hafta', postGrad: '2 Yıl', topUnis: ['Trinity'], note: 'Mezuniyet sonrası 2 yıl.' },
    checklist: [...commonChecklist, "Critical Skills Occupations List kontrolü", "GNIB/IRP kartı başvurusu"]
  },
  {
    id: 'fr', name: 'Fransa', englishName: 'France', region: 'Avrupa', tier: 'Tier 2', difficulty: 50, visa: 'Passeport Talent', tags: ['Havacılık'], salary: '€40k+', desc: 'Airbus, Thales.', strategy: 'B1 Fransızca öğren.', link: 'https://france-visas.gouv.fr/', education: { tuition: '€243+', workRights: '964 Saat/Yıl', postGrad: '1 Yıl', topUnis: ['CentraleSupélec'], note: 'Devlet okulları ucuz.' },
    checklist: [...commonChecklist, "Campus France prosedürü", "OFII başvurusu", "Konut sigortası"]
  },
  {
    id: 'at', name: 'Avusturya', englishName: 'Austria', region: 'Avrupa', tier: 'Tier 2', difficulty: 50, visa: 'RWR Card', tags: ['Yarı İletken'], salary: '€45k+', desc: 'Infineon gibi çip üreticileri.', strategy: 'B1 Almanca avantaj.', link: 'https://www.migration.gv.at/', education: { tuition: '€1.5k', workRights: '20 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['TU Wien'], note: 'Eğitim makul.' },
    checklist: [...commonChecklist, "Red-White-Red Card puan hesabı", "Almanca A1 belgesi"]
  },
  {
    id: 'be', name: 'Belçika', englishName: 'Belgium', region: 'Avrupa', tier: 'Tier 2', difficulty: 45, visa: 'Single Permit', tags: ['Mikroelektronik'], salary: '€40k+', desc: 'IMEC Leuven\'dedir.', strategy: 'IMEC stajlarına başvur.', link: 'https://www.international.socialsecurity.be/', education: { tuition: '€1k-4k', workRights: '20 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['KU Leuven'], note: 'KU Leuven çok iyi.' },
    checklist: [...commonChecklist, "Single Permit başvurusu", "Diploma denklik (NARIC)"]
  },
  {
    id: 'es', name: 'İspanya', englishName: 'Spain', region: 'Avrupa', tier: 'Tier 2', difficulty: 40, visa: 'Highly Qualified', tags: ['Telekom'], salary: '€30k+', desc: 'Yenilenebilir enerji.', strategy: 'Barselona ve Madrid.', link: 'https://www.exteriores.gob.es/', education: { tuition: '€2k-5k', workRights: '30 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['UPC'], note: 'Çalışma izni kolaylaştı.' },
    checklist: [...commonChecklist, "NIE numarası al", "Empadronamiento (adres kaydı)"]
  },
  {
    id: 'ee', name: 'Estonya', englishName: 'Estonia', region: 'Avrupa', tier: 'Tier 2', difficulty: 25, visa: 'Startup', tags: ['Dijital'], salary: '€35k', desc: 'Yazılım odaklı.', strategy: 'TalTech başvur.', link: 'https://www.studyinestonia.ee/', education: { tuition: '€3k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['TalTech'], note: 'Sınırsız çalışma.' },
    checklist: [...commonChecklist, "E-Residency başvurusu (opsiyonel)", "D-Visa başvurusu"]
  },
  {
    id: 'cz', name: 'Çekya', englishName: 'Czechia', region: 'Avrupa', tier: 'Tier 1', difficulty: 30, visa: 'Student Visa', tags: ['Teknik'], salary: '€35k', desc: 'Otomotiv güçlü.', strategy: 'CVUT Prag.', link: 'https://www.studyin.cz/', education: { tuition: '€3k-5k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['CTU Prague'], note: 'Akredite program.' },
    checklist: [...commonChecklist, "Nostrifikasyon (diploma denklik)", "Çekçe dil kursu kaydı"]
  },
  {
    id: 'pt', name: 'Portekiz', englishName: 'Portugal', region: 'Avrupa', tier: 'Tier 1', difficulty: 10, visa: 'Job Seeker', tags: ['Ucuz'], salary: '€20k', desc: 'Kolay giriş.', strategy: 'Job Seeker vizesi.', link: 'https://vistos.mne.gov.pt/', education: { tuition: '€1k-3k', workRights: '20 Saat/Hafta', postGrad: 'Kolay', topUnis: ['Porto Univ'], note: 'SEF bildirimi.' },
    checklist: [...commonChecklist, "NIF (Vergi Numarası) al", "Job Seeker vizesi formu"]
  },
  {
    id: 'jp', name: 'Japonya', englishName: 'Japan', region: 'Asya', tier: 'Tier 2', difficulty: 60, visa: 'Engineer', tags: ['Robotik'], salary: '¥4M+', desc: 'Teknoloji devi.', strategy: 'MEXT bursu.', link: 'https://www.mofa.go.jp/', education: { tuition: 'MEXT Bedava', workRights: '28 Saat/Hafta', postGrad: 'İş Bulana Dek', topUnis: ['Tokyo Tech'], note: 'Özel izin.' },
    checklist: [...commonChecklist, "MEXT bursu başvuru formu", "Japonca seviye tespiti (JLPT)"]
  },
   {
    id: 'kr', name: 'Güney Kore', englishName: 'South Korea', region: 'Asya', tier: 'Tier 2', difficulty: 55, visa: 'E-7', tags: ['Samsung'], salary: '₩40M+', desc: 'Samsung, LG.', strategy: 'GKS bursu.', link: 'https://www.visa.go.kr/', education: { tuition: 'GKS Bedava', workRights: '20 Saat/Hafta', postGrad: '2 Yıl', topUnis: ['KAIST'], note: '6 aydan sonra.' },
    checklist: [...commonChecklist, "GKS bursu belgeleri", "TOPIK sınav sonucu"]
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
  ]
};

// --- KANBAN SÜTUNLARI ---
const kanbanColumns = [
  { id: 'to_apply', title: 'Başvurulacak', color: 'border-slate-500', bgColor: 'bg-slate-900/40' },
  { id: 'applied', title: 'Başvuruldu', color: 'border-blue-500', bgColor: 'bg-blue-900/10' },
  { id: 'interview', title: 'Görüşme', color: 'border-yellow-500', bgColor: 'bg-yellow-900/10' },
  { id: 'offer', title: 'Teklif', color: 'border-green-500', bgColor: 'bg-green-900/10' },
  { id: 'rejected', title: 'Red', color: 'border-red-500', bgColor: 'bg-red-900/10' }
];

// --- KANBAN KART BİLEŞENİ ---
const KanbanCard = ({ app, deleteApplication, onDragStart, isDragging }) => {
    const opacity = isDragging ? 'opacity-40 border-dashed border-cyan-400' : 'opacity-100 border-white/5';
    
    return (
        <div 
            draggable 
            onDragStart={(e) => onDragStart(e, app.id)}
            className={`
                bg-slate-800 p-3 rounded-xl border hover:border-white/20 transition-all shadow-md
                group cursor-grab active:cursor-grabbing ${opacity}
            `}
        >
            <div className="flex justify-between items-start mb-1">
                <div className="font-bold text-white text-sm truncate">{app.company}</div>
                <button onClick={() => deleteApplication(app.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 -mt-1 -mr-1">
                    <Trash2 size={12}/>
                </button>
            </div>
            <div className="text-xs text-slate-400 mb-2">{app.role}</div>
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    {app.companyUrl && (
                        <a href={app.companyUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-cyan-400 transition-colors" title="Şirket Sitesi">
                            <Globe size={12} />
                        </a>
                    )}
                    {app.jobUrl && (
                        <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-purple-400 transition-colors" title="İlan Linki">
                            <LinkIcon size={12} />
                        </a>
                    )}
                </div>
                <div className="text-[10px] text-slate-500 text-right">Başvuru: {app.date}</div>
            </div>
        </div>
    );
}

// --- KANBAN SÜTUN BİLEŞENİ ---
const KanbanColumn = ({ column, applications, deleteApplication, onDragStart, onDrop, onDragEnter, onDragLeave, draggingAppId, dragOverColumn }) => {
    
    const isTarget = column.id === dragOverColumn;
    const isBeingDragged = applications.some(app => app.id === draggingAppId);

    return (
        <div 
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => onDrop(e, column.id)}
            onDragEnter={(e) => onDragEnter(e, column.id)}
            onDragLeave={(e) => onDragLeave(e, column.id)}
            className={`
                w-72 shrink-0 flex flex-col rounded-xl border-4 transition-all duration-300
                ${column.bgColor} 
                ${isTarget ? 'border-cyan-400 scale-[1.01] shadow-[0_0_20px_rgba(34,211,238,0.5)]' : column.color}
            `}
        >
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-slate-900/70">
                <span className="font-bold text-slate-200 text-sm">{column.title}</span>
                <span className="text-xs text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full">{applications.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {applications.map(app => (
                    <KanbanCard 
                        key={app.id} 
                        app={app} 
                        deleteApplication={deleteApplication}
                        onDragStart={onDragStart}
                        isDragging={app.id === draggingAppId}
                    />
                ))}
                {applications.length === 0 && (
                    <div className={`text-center py-4 text-xs italic transition-all duration-500 ${isTarget ? 'text-cyan-400' : 'text-slate-600'}`}>
                        {isTarget ? 'Buraya Bırakın' : 'Boş'}
                    </div>
                )}
            </div>
        </div>
    );
}

// --- DASHBOARD BİLEŞENİ ---
const DashboardView = ({ applications }) => {
    const totalApps = applications.length;
    const interviewCount = applications.filter(a => a.status === 'interview').length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;
    const offerCount = applications.filter(a => a.status === 'offer').length;
    const waitingCount = applications.filter(a => a.status === 'applied').length;

    // Basit bir başarı oranı hesabı (Görüşme + Teklif) / Toplam (Red hariç)
    const successRate = totalApps > 0 ? Math.round(((interviewCount + offerCount) / (totalApps)) * 100) : 0;

    return (
        <div className="p-6 md:p-8 overflow-y-auto h-full space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <PieChart className="text-cyan-400" /> Analiz Paneli
            </h2>

            {/* Özet Kartlar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 shadow-lg">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Toplam Başvuru</div>
                    <div className="text-3xl font-bold text-white">{totalApps}</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 shadow-lg">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Görüşme Oranı</div>
                    <div className="text-3xl font-bold text-cyan-400">%{successRate}</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 shadow-lg">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Bekleyenler</div>
                    <div className="text-3xl font-bold text-yellow-400">{waitingCount}</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5 shadow-lg">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Teklifler</div>
                    <div className="text-3xl font-bold text-emerald-400">{offerCount}</div>
                </div>
            </div>

            {/* Durum Dağılım Grafiği (Bar Chart) */}
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
                <h3 className="text-sm font-bold text-slate-300 mb-6 uppercase tracking-wider">Başvuru Dağılımı</h3>
                <div className="space-y-4">
                    {[
                        { label: 'Başvuruldu', count: waitingCount, color: 'bg-blue-500', width: `${(waitingCount/totalApps)*100}%` },
                        { label: 'Görüşme', count: interviewCount, color: 'bg-yellow-500', width: `${(interviewCount/totalApps)*100}%` },
                        { label: 'Teklif', count: offerCount, color: 'bg-emerald-500', width: `${(offerCount/totalApps)*100}%` },
                        { label: 'Red', count: rejectedCount, color: 'bg-red-500', width: `${(rejectedCount/totalApps)*100}%` },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-24 text-xs font-bold text-slate-400 text-right">{item.label}</div>
                            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${item.color}`} 
                                    style={{ width: totalApps > 0 ? item.width : '0%' }}
                                ></div>
                            </div>
                            <div className="w-8 text-xs font-bold text-white">{item.count}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tavsiyeler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 p-5 rounded-xl border border-purple-500/20">
                    <h4 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2"><Lightbulb size={16}/> İpucu</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Kabul oranını artırmak için başvurularını "Tier 2" ülkelerine yoğunlaştırabilirsin. İstatistiklere göre bu ülkelerden dönüş alma şansın daha yüksek.
                    </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 p-5 rounded-xl border border-emerald-500/20">
                    <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2"><Target size={16}/> Hedef</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Haftalık başvuru hedefini 5 olarak belirle. Düzenli başvuru yapmak, algoritmanın seni aktif aday olarak öne çıkarmasını sağlar.
                    </p>
                </div>
            </div>
        </div>
    );
};

// İkon komponenti olmadığı için sahte bir ikon oluşturuyoruz
const Target = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);


export default function CareerCommandCenterV18() {
  const [appMode, setAppMode] = useState('explorer'); // 'explorer' | 'kanban' | 'dashboard'
  const [activeTab, setActiveTab] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState(allCountries[0]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('career'); // 'career' | 'education' | 'checklist'
  const [selectedRole, setSelectedRole] = useState(engineerRoles[0].title); 
  
  const [user, setUser] = useState(null);
  const [userNotes, setUserNotes] = useState({});
  const [userApplications, setUserApplications] = useState([]); // Kanban Data
  const [userChecklists, setUserChecklists] = useState({}); // Checklist Data: { countryId: { itemIndex: true/false } }
  
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState('connecting'); 
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [currentNote, setCurrentNote] = useState('');
  const [isEditing, setIsEditing] = useState(false); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Kanban Yeni Ekleme State'leri
  const [newAppCompany, setNewAppCompany] = useState('');
  const [newAppRole, setNewAppRole] = useState('');
  const [newAppCompanyUrl, setNewAppCompanyUrl] = useState('');
  const [newAppJobUrl, setNewAppJobUrl] = useState('');

  // Drag and Drop State'leri
  const [draggingAppId, setDraggingAppId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);


  const diffDays = Math.ceil(Math.abs(new Date('2026-02-01') - new Date()) / (1000 * 60 * 60 * 24));
  
  // Progress Bar
  const startDate = new Date('2022-09-15');
  const endDate = new Date('2026-02-01');
  const today = new Date();
  const totalDuration = endDate - startDate;
  const elapsed = today - startDate;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  useEffect(() => {
    if (!auth || !db) {
        setDbStatus('error');
        return;
    }

    // Auth durumunu dinle
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            setDbStatus('connected');
            setIsLoggingIn(false);
            
            // Kullanıcı verilerini dinle
            const userDocRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}/career_data/data`);
            return onSnapshot(userDocRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    if (data.notes) setUserNotes(data.notes);
                    if (data.applications) setUserApplications(data.applications);
                    if (data.checklists) setUserChecklists(data.checklists);
                }
            });
        } else {
            setUser(null);
            setDbStatus('disconnected');
            signInAnonymously(auth).catch(e => console.log("Anonim giriş yapılamadı."));
        }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setIsLoggingIn(true);
    setLoginError(null);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Google Giriş Hatası:", error);
        setIsLoggingIn(false);
        
        if (error.code === 'auth/unauthorized-domain') {
            setLoginError(`Bu alan adı (${window.location.hostname}) Firebase'de yetkili değil.`);
        } else {
            setLoginError("Giriş hatası: " + error.message);
        }
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        setUserNotes({});
        setUserApplications([]);
        setUserChecklists({});
    } catch (error) {
        console.error("Çıkış Hatası:", error);
    }
  };


  const handleSaveNote = async () => {
    if (!user || !selectedCountry) return;
    setIsSaving(true);
    const updatedNotes = { ...userNotes, [selectedCountry.id]: currentNote };
    
    const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/career_data/data`);
    
    try {
        await setDoc(userDocRef, { notes: updatedNotes }, { merge: true });
        setTimeout(() => { setIsSaving(false); setIsEditing(false); }, 500);
    } catch (e) { 
        console.error("Not Kaydetme Hatası:", e);
        setIsSaving(false); 
    }
  };

  // --- CHECKLIST İŞLEMİ ---
  const handleToggleChecklist = async (countryId, itemIndex) => {
      if (!user) return;
      
      const currentCountryChecklist = userChecklists[countryId] || {};
      const newStatus = !currentCountryChecklist[itemIndex];
      
      const updatedChecklists = {
          ...userChecklists,
          [countryId]: {
              ...currentCountryChecklist,
              [itemIndex]: newStatus
          }
      };

      // UI'ı hemen güncelle (Optimistic UI)
      setUserChecklists(updatedChecklists);

      const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/career_data/data`);
      try {
          await setDoc(userDocRef, { checklists: updatedChecklists }, { merge: true });
      } catch (e) {
          console.error("Checklist Hatası:", e);
          // Hata olursa eski haline döndürebiliriz ama şimdilik gerek yok
      }
  };

  // --- KANBAN İŞLEMLERİ ---
  const addApplication = async () => {
    if (!user || !newAppCompany || !newAppRole) return;
    const newApp = {
      id: Date.now(),
      company: newAppCompany,
      role: newAppRole,
      companyUrl: newAppCompanyUrl,
      jobUrl: newAppJobUrl,
      status: 'to_apply',
      date: new Date().toLocaleDateString('tr-TR')
    };
    const updatedApps = [...userApplications, newApp];
    setUserApplications(updatedApps);
    setNewAppCompany('');
    setNewAppRole('');
    setNewAppCompanyUrl('');
    setNewAppJobUrl('');
    
    const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/career_data/data`);
    await setDoc(userDocRef, { applications: updatedApps }, { merge: true }).catch(e => console.error("Uygulama Ekleme Hatası:", e));
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    if (!user) return;
    const updatedApps = userApplications.map(app => 
      (app.id === applicationId || app.id.toString() === applicationId) ? { ...app, status: newStatus } : app
    );
    setUserApplications(updatedApps);
    
    const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/career_data/data`);
    await setDoc(userDocRef, { applications: updatedApps }, { merge: true }).catch(e => console.error("Durum Güncelleme Hatası:", e));
  };

  const deleteApplication = async (applicationId) => {
    if (!user) return;
    const updatedApps = userApplications.filter(app => app.id !== applicationId);
    setUserApplications(updatedApps);
    
    const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/career_data/data`);
    await setDoc(userDocRef, { applications: updatedApps }, { merge: true }).catch(e => console.error("Uygulama Silme Hatası:", e));
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

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return allCountries.filter(c => {
      const matchTab = activeTab === 'All' || c.region === activeTab || c.tier === activeTab;
      const matchSearch = c.name.toLowerCase().includes(term) || c.tags.some(t => t.toLowerCase().includes(term));
      return matchTab && matchSearch;
    });
  }, [activeTab, searchTerm]);
  
  useEffect(() => {
      if (appMode === 'explorer') {
        if (filteredData.length > 0 && (!selectedCountry || !filteredData.find(c => c.id === selectedCountry.id))) {
            setSelectedCountry(filteredData[0]);
        } else if (filteredData.length === 0) {
            setSelectedCountry(null);
        }
      }
  }, [filteredData, selectedCountry, appMode]);

  const getTierGradient = (tier) => {
      if (tier === 'Tier 1') return 'from-emerald-900/50 via-slate-900 to-slate-900 border-emerald-500/30'; 
      if (tier === 'Tier 2') return 'from-yellow-900/50 via-slate-900 to-slate-900 border-yellow-500/30'; 
      return 'from-red-900/50 via-slate-900 to-slate-900 border-red-500/30'; 
  };
  
  // --- DRAG & DROP İŞLEYİCİLERİ ---
  const handleDragStart = (e, appId) => {
      setDraggingAppId(appId);
      e.dataTransfer.setData("applicationId", appId.toString());
  };

  const handleDrop = (e, newStatus) => {
      e.preventDefault();
      setDragOverColumn(null);
      const appId = e.dataTransfer.getData("applicationId");
      if (appId) {
          updateApplicationStatus(parseInt(appId), newStatus);
      }
      setDraggingAppId(null);
  };

  const handleDragEnter = (e, columnId) => {
      e.preventDefault();
      setDragOverColumn(columnId);
  };

  const handleDragLeave = (e, columnId) => {
      e.preventDefault();
      if (e.currentTarget.contains(e.relatedTarget)) {
          return;
      }
      setDragOverColumn(null);
  };

  return (
    <div className="flex w-full h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden flex-col md:flex-row relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none z-0"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_-200px,#1e293b,transparent)] z-0 pointer-events-none"></div>

      {/* SIDEBAR */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 md:relative md:translate-x-0 shrink-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col shadow-2xl h-full`}>
        <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider">
            <Zap size={20} fill="currentColor" /> <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">KARİYER-V18</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={20} /></button>
        </div>
        
        {/* ANA NAVİGASYON */}
        <div className="p-4 space-y-2 border-b border-white/5">
            <button 
                onClick={() => setAppMode('explorer')} 
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${appMode === 'explorer' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-white/5'}`}
            >
                <Globe size={16} /> Keşfet
            </button>
            <button 
                onClick={() => setAppMode('kanban')} 
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${appMode === 'kanban' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-slate-400 hover:bg-white/5'}`}
            >
                <ClipboardList size={16} /> Başvurularım
            </button>
            <button 
                onClick={() => setAppMode('dashboard')} 
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-bold flex items-center gap-3 transition-all ${appMode === 'dashboard' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-400 hover:bg-white/5'}`}
            >
                <PieChart size={16} /> Analiz Paneli
            </button>
        </div>

        {/* GOOGLE LOGIN / PROFILE AREA */}
        <div className="px-4 py-2 mt-auto border-t border-white/5">
             {user && !user.isAnonymous ? (
                 <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl border border-white/5">
                     <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-cyan-500/50" />
                     <div className="flex-1 min-w-0">
                         <div className="text-xs font-bold text-white truncate">{user.displayName}</div>
                         <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                     </div>
                     <button onClick={handleLogout} className="text-red-400 hover:text-red-300 p-1.5 hover:bg-white/5 rounded-lg transition-colors" title="Çıkış Yap">
                         <LogOut size={14} />
                     </button>
                 </div>
             ) : (
                <div className="bg-slate-800/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-slate-400 mb-2">Verilerini kaybetmemek için giriş yapmalısın.</p>
                    
                    {loginError && (
                        <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[10px] text-red-400">
                            {loginError}
                        </div>
                    )}

                    <button 
                        onClick={handleGoogleLogin} 
                        disabled={isLoggingIn}
                        className="w-full bg-white hover:bg-slate-200 text-slate-900 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        {isLoggingIn ? <Loader2 size={14} className="animate-spin" /> : (
                            <>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                                Google ile Giriş Yap
                            </>
                        )}
                    </button>
                </div>
             )}
        </div>

        {appMode === 'explorer' && (
            <nav className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
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
            <div>
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 px-2">Öncelik</h3>
                <div className="space-y-1">
                {['Tier 1', 'Tier 2', 'Tier 3'].map(tier => (
                    <button key={tier} onClick={() => { setActiveTab(tier); setMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex gap-3 items-center group ${activeTab === tier ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:bg-white/5'}`}>
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${tier === 'Tier 1' ? 'bg-green-500 shadow-green-500' : tier === 'Tier 2' ? 'bg-yellow-500 shadow-yellow-500' : 'bg-red-500 shadow-red-500'}`} />
                    {tier}
                    </button>
                ))}
                </div>
            </div>
            </nav>
        )}
        
        {appMode === 'kanban' && (
            <div className="p-4 flex-1 overflow-y-auto">
                 <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 text-center">
                    <p className="text-xs text-slate-400 mb-2">Toplam Başvuru</p>
                    <p className="text-2xl font-bold text-white">{userApplications.length}</p>
                 </div>
                 <div className="mt-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Hızlı Ekle</h3>
                    <div className="space-y-2 mb-2">
                        <input type="text" placeholder="Şirket Adı" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppCompany} onChange={e => setNewAppCompany(e.target.value)} />
                        <input type="text" placeholder="Pozisyon" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppRole} onChange={e => setNewAppRole(e.target.value)} />
                        <input type="text" placeholder="Şirket Web Sitesi (Opsiyonel)" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppCompanyUrl} onChange={e => setNewAppCompanyUrl(e.target.value)} />
                        <input type="text" placeholder="İlan Linki (Opsiyonel)" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppJobUrl} onChange={e => setNewAppJobUrl(e.target.value)} />
                    </div>
                    <button onClick={addApplication} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Plus size={12}/> Ekle</button>
                 </div>
            </div>
        )}

        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-white/5 shadow-lg">
             <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-slate-300 flex items-center gap-1.5"><Clock size={12} className="text-cyan-400" /> Mezuniyet ({new Date('2026-02-01').getFullYear()})</span><span className="text-xs text-white font-mono font-bold">{diffDays} Gün</span></div>
             <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden mb-1"><div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 h-full rounded-full" style={{ width: `${progress}%` }}></div></div>
             <div className="text-[10px] text-right text-slate-500">%{Math.floor(progress)} Tamamlandı</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full z-10 relative">
        
        {/* EXPLORER MODE */}
        {appMode === 'explorer' && (
            <>
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
                    <div className="w-[380px] border-r border-white/5 flex flex-col shrink-0 bg-slate-900/30 hidden lg:flex">
                        <div className="p-4 border-b border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between"><span>Sonuçlar ({filteredData.length})</span></div>
                        <div className="flex-1 overflow-y-auto p-4 scroll-smooth space-y-3 pb-20">
                            {filteredData.map(country => (
                                <div key={country.id} onClick={() => setSelectedCountry(country)} className={`group relative p-4 rounded-xl border cursor-pointer transition-all duration-200 ${selectedCountry?.id === country.id ? 'bg-slate-800 border-cyan-500/50 shadow-lg' : 'bg-slate-900/40 border-white/5 hover:bg-slate-800/60'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div><h3 className={`text-sm font-bold ${selectedCountry?.id === country.id ? 'text-cyan-400' : 'text-slate-200'}`}>{country.name}</h3><div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {country.region}</div></div>
                                    <div className="flex gap-0.5">{[1,2,3,4,5].map(bar => (<div key={bar} className={`w-1 h-2.5 rounded-full ${
                                        (country.difficulty / 20) >= bar 
                                            ? (country.difficulty > 70 ? 'bg-red-500' : country.difficulty > 40 ? 'bg-yellow-500' : 'bg-emerald-500') 
                                            : 'bg-slate-800'
                                    }`}/>))}</div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-950/50 border border-white/10 text-slate-400">{country.visa}</span>
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
                                <div className={`absolute inset-0 bg-gradient-to-br ${getTierGradient(selectedCountry.tier)} z-0 border-b`}></div>
                                <div className="absolute bottom-6 left-8 z-20 right-8 flex justify-between items-end">
                                <div>
                                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-white/5 border-white/10 inline-block mb-2 text-white`}>{selectedCountry.tier}</div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{selectedCountry.name}</h2>
                                </div>
                                <div className="flex bg-slate-950/50 rounded-lg p-1 border border-white/10">
                                    <button onClick={() => setViewMode('career')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'career' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>Profesyonel</button>
                                    <button onClick={() => setViewMode('education')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'education' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>Akademik</button>
                                    <button onClick={() => setViewMode('checklist')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'checklist' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                                        <div className='flex items-center gap-1'><FileCheck size={12}/> Vize & Hazırlık</div>
                                    </button>
                                </div>
                                </div>
                            </div>
                            {/* ... Detail Content (Maaş, Zorluk, Genel Durum, Strateji, İş Arama, Notlar) ... */}
                            <div className="p-8 space-y-8 max-w-4xl mx-auto w-full pb-20">
                                
                                {viewMode !== 'checklist' ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5"><div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Maaş Skalası</div><div className="text-xl font-bold text-emerald-400">{selectedCountry.salary}</div></div>
                                        <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5"><div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Giriş Zorluğu</div><div className="text-xl font-bold text-white">{selectedCountry.difficulty}%</div></div>
                                        <div className="bg-slate-800/40 p-4 rounded-xl border border-white/5 col-span-2"><div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Vize Stratejisi</div><div className="text-sm text-slate-300">{selectedCountry.strategy}</div></div>
                                    </div>
                                ) : null}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        {viewMode === 'career' && (
                                            <>
                                                <div><h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Layout size={16} className="text-cyan-500"/> Genel Bakış</h4><p className="text-sm text-slate-400 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-white/5">{selectedCountry.desc}</p></div>
                                                <div className="bg-slate-800/30 p-5 rounded-xl border border-white/5 space-y-4">
                                                    <div><label className="text-xs text-slate-500 block mb-2">Hedef Pozisyon</label><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-slate-950 border border-white/10 text-slate-200 text-sm rounded-lg p-3 outline-none">{engineerRoles.map(r => <option key={r.title} value={r.title}>{r.label}</option>)}</select></div>
                                                    <button onClick={() => performGoogleSearch(selectedCountry)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all"><Search size={16}/> Google'da {selectedCountry.englishName} İlanlarını Ara</button>
                                                </div>
                                            </>
                                        )}
                                        {viewMode === 'education' && (
                                            <div className="space-y-4">
                                                <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 flex justify-between"><span className="text-sm text-slate-400">Eğitim Ücreti</span><span className="text-sm font-bold text-white">{selectedCountry.education.tuition}</span></div>
                                                <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5 flex justify-between"><span className="text-sm text-slate-400">Çalışma İzni</span><span className="text-sm font-bold text-yellow-400">{selectedCountry.education.workRights}</span></div>
                                                <div className="bg-slate-800/30 p-4 rounded-xl border border-white/5"><span className="text-sm text-slate-400 block mb-2">Öne Çıkan Üniversiteler</span><div className="flex gap-2 flex-wrap">{selectedCountry.education.topUnis.map(u => <span key={u} className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">{u}</span>)}</div></div>
                                            </div>
                                        )}
                                        {viewMode === 'checklist' && (
                                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20 mb-4">
                                                    <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2"><ListTodo size={16}/> Vize & Hazırlık Listesi</h4>
                                                    <p className="text-xs text-slate-300">Bu liste {selectedCountry.name} için genel gereklilikleri içerir. Tamamladıklarını işaretleyerek ilerlemeni takip edebilirsin.</p>
                                                </div>
                                                <div className="space-y-2">
                                                    {(selectedCountry.checklist || []).map((item, index) => {
                                                        const isChecked = userChecklists[selectedCountry.id]?.[index] || false;
                                                        return (
                                                            <div 
                                                                key={index} 
                                                                onClick={() => handleToggleChecklist(selectedCountry.id, index)}
                                                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isChecked ? 'bg-emerald-900/10 border-emerald-500/30 opacity-70' : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50'}`}
                                                            >
                                                                <div className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 bg-slate-900'}`}>
                                                                    {isChecked && <Check size={12} strokeWidth={3} />}
                                                                </div>
                                                                <span className={`text-sm ${isChecked ? 'text-slate-400 line-through' : 'text-slate-200'}`}>{item}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {viewMode !== 'checklist' && (
                                        <div className="space-y-6">
                                            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5"><h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2"><Lightbulb size={14}/> Proje Fikri</h4>{(projectIdeas[selectedRole] || projectIdeas["Junior Embedded Software Engineer"]).slice(0,1).map((idea, i) => (<div key={i}><div className="text-sm font-bold text-white mb-1">{idea.title}</div><div className="text-xs text-slate-500 leading-relaxed">{idea.desc}</div></div>))}</div>
                                            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5">
                                                <div className="flex justify-between items-center mb-3"><h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Save size={14}/> Notlar</h4>{!isEditing && userNotes[selectedCountry.id] && <button onClick={() => setIsEditing(true)} className="text-[10px] text-cyan-400"><Edit3 size={12}/></button>}</div>
                                                {isEditing || !userNotes[selectedCountry.id] ? (<div className="space-y-2"><textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 outline-none min-h-[100px]" placeholder="Hedeflerini yaz..." value={currentNote} onChange={(e) => setCurrentNote(e.target.value)} /><div className="flex gap-2"><button onClick={handleSaveNote} disabled={isSaving} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">{isSaving ? '...' : 'Kaydet'}</button>{userNotes[selectedCountry.id] && <button onClick={() => setIsEditing(false)} className="px-3 bg-slate-700 text-white py-2 rounded-lg text-xs">iptal</button>}</div></div>) : (<p className="text-xs text-slate-300 whitespace-pre-wrap cursor-pointer hover:text-white" onClick={() => setIsEditing(true)}>{userNotes[selectedCountry.id]}</p>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-600"><p>Yükleniyor...</p></div>
                    )}
                </main>
            </>
        )}

        {/* KANBAN MODE */}
        {appMode === 'kanban' && (
            <main className="flex-1 flex overflow-x-auto overflow-y-hidden p-6 gap-4 bg-slate-950">
                {kanbanColumns.map(col => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        applications={userApplications.filter(a => a.status === col.id)}
                        deleteApplication={deleteApplication}
                        onDragStart={handleDragStart}
                        onDrop={handleDrop}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        draggingAppId={draggingAppId}
                        dragOverColumn={dragOverColumn}
                    />
                ))}
            </main>
        )}

        {/* DASHBOARD MODE */}
        {appMode === 'dashboard' && (
            <main className="flex-1 overflow-hidden bg-slate-950">
                <DashboardView applications={userApplications} />
            </main>
        )}

      </div>
    </div>
  );
}
