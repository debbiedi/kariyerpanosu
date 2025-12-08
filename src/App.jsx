import React, { useState, useMemo, useEffect } from 'react';
import { 
  Globe, Search, MapPin, Briefcase, GraduationCap, 
  AlertTriangle, ArrowRight, Layout, TrendingUp, 
  Terminal, Shield, Zap, ChevronRight, Save, ExternalLink, 
  Menu, X, Coins, Clock, Building, Award, Code, Cpu, Activity,
  Calendar, Settings, BarChart3, CheckCircle2, Users, Lightbulb,
  Linkedin, Cloud, Check, Loader2, Edit3, ClipboardList, Plus, Trash2, ArrowRightCircle, LogOut, LogIn, 
  ListTodo, PieChart, FileCheck, Link as LinkIcon, RefreshCw, Filter, ChevronLeft
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

// --- VERİTABANI (TÜM LİSTE - MASTER ODAKLI) ---
const allCountries = [
  // TIER 1 & POPÜLER
  {
    id: 'uk', name: 'Birleşik Krallık', englishName: 'United Kingdom', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 60, visa: 'Student Route', tags: ['Fintech', 'Savunma'], salary: '£35k - £55k',
    desc: 'Londra finans ve teknoloji başkenti. Master sonrası 2 yıl Graduate Visa hakkı var.',
    strategy: 'Graduate Visa ile 2 yıl iş arama/çalışma hakkını kullan.',
    link: 'https://www.gov.uk/student-visa',
    education: { tuition: '£15k - £25k', workRights: '20 Saat/Hafta', postGrad: '2 Yıl (Graduate Visa)', topUnis: ['Imperial', 'Cambridge', 'Oxford', 'UCL', 'Edinburgh', 'Manchester', 'King\'s College'], note: 'Tatillerde full-time.' },
    checklist: [...commonChecklist, "IELTS UKVI sınavına gir", "TB (Verem) Testi yaptır", "CAS Numarası al"]
  },
  {
    id: 'de', name: 'Almanya', englishName: 'Germany', region: 'Avrupa', 
    tier: 'Tier 1', difficulty: 35, visa: 'Student Visa', tags: ['Otomotiv', 'Sanayi 4.0'], salary: '€48k - €60k',
    desc: 'Mühendislik devi. TU9 üniversiteleri Master öğrencileri için harika fırsatlar sunar.',
    strategy: 'Werkstudent olarak çalışarak deneyim kazan.',
    link: 'https://www.daad.de/en/',
    education: { tuition: 'Ücretsiz (Katkı Payı)', workRights: '20 Saat/Hafta', postGrad: '18 Ay', topUnis: ['TU Munich', 'RWTH Aachen', 'TU Berlin', 'KIT Karlsruhe', 'TU Dresden', 'Stuttgart Univ.', 'TU Darmstadt'], note: 'Yılda 120 tam gün çalışma hakkı.' },
    checklist: [...commonChecklist, "Bloke Hesap (Sperrkonto) aç", "Sağlık Sigortası (Krankenkasse)", "ZAB Denklik Belgesi al", "Almanca A1/A2 sertifikası"]
  },
  {
    id: 'us', name: 'ABD', englishName: 'United States', region: 'Amerika', 
    tier: 'Tier 3', difficulty: 95, visa: 'F1 Visa', tags: ['Tech Giant'], salary: '$90k - $120k',
    desc: 'Teknolojinin kalbi. STEM Master programları 3 yıl OPT (çalışma izni) sağlar.',
    strategy: 'Mutlaka STEM (Bilim, Teknoloji, Mühendislik) kapsamındaki bir Master programı seç.',
    link: 'https://educationusa.state.gov/', 
    education: { tuition: '$30k+', workRights: '20 Saat (Kampüs İçi)', postGrad: '3 Yıl (STEM OPT)', topUnis: ['MIT', 'Stanford', 'Berkeley', 'Caltech', 'Georgia Tech', 'CMU', 'UIUC', 'Univ. of Texas Austin'], note: 'Kampüs dışı çalışma CPT ile mümkün.' },
    checklist: [...commonChecklist, "DS-160 Formunu doldur", "SEVIS ücretini öde", "I-20 belgesini okuldan al", "Banka teminat mektubu hazırla"]
  },
  {
    id: 'ca', name: 'Kanada', englishName: 'Canada', region: 'Amerika', 
    tier: 'Tier 2', difficulty: 55, visa: 'Study Permit', tags: ['Göçmen Dostu'], salary: 'CAD 65k - 90k',
    desc: 'Master sonrası 3 yıla kadar PGWP (Post-Graduation Work Permit) alabilirsin.',
    strategy: 'Master sonrası PGWP ile kalıcı oturum (PR) puanını artır.',
    link: 'https://www.canada.ca/', 
    education: { tuition: 'CAD 20k+', workRights: '24 Saat/Hafta', postGrad: '3 Yıl (PGWP)', topUnis: ['U of Toronto', 'Waterloo', 'UBC', 'McGill', 'Univ. of Alberta', 'Montreal Univ.', 'McMaster'], note: 'Kampüs dışı çalışma saati artırıldı.' },
    checklist: [...commonChecklist, "Study Permit başvurusu", "Biometrik randevusu al", "Provincial Attestation Letter (gerekirse)"]
  },
  {
    id: 'ch', name: 'İsviçre', englishName: 'Switzerland', region: 'Avrupa', 
    tier: 'Tier 3', difficulty: 90, visa: 'Student Visa', tags: ['Maksimum Maaş'], salary: 'CHF 85k+',
    desc: 'Avrupa\'nın en yüksek maaşları. Master sonrası iş aramak için 6 ay verilir.',
    strategy: 'ETH veya EPFL gibi top okullardan mezun olup kota sistemine takılmadan iş bul.',
    link: 'https://www.sem.admin.ch/', 
    education: { tuition: 'CHF 1.5k', workRights: '15 Saat/Hafta', postGrad: '6 Ay', topUnis: ['ETH Zurich', 'EPFL', 'Univ. of Zurich', 'Univ. of Bern', 'Univ. of Basel', 'St. Gallen'], note: 'Çalışma izni 6. aydan sonra başlar.' },
    checklist: [...commonChecklist, "Kanton göçmenlik ofisi onayı", "Finansal yeterlilik kanıtı", "Konaklama sözleşmesi"]
  },
  {
    id: 'nl', name: 'Hollanda', englishName: 'Netherlands', region: 'Avrupa', 
    tier: 'Tier 2', difficulty: 65, visa: 'MVV', tags: ['High Tech'], salary: '€50k - €70k',
    desc: 'ASML ve Philips burada. Master sonrası "Orientation Year" vizesi ile 1 yıl iş arama hakkı.',
    strategy: 'Orientation Year vizesi şartlarını sağlayan bir okul seç.',
    link: 'https://www.studyinnl.org/',
    education: { tuition: '€15k+', workRights: '16 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['TU Delft', 'TU Eindhoven', 'Univ. of Twente', 'Amsterdam UvA', 'Groningen', 'Leiden'], note: 'Veya yazın full-time.' },
    checklist: [...commonChecklist, "MVV Vizesi başvurusu", "BSN Numarası için randevu", "DigiD başvurusu"]
  },
  {
    id: 'au', name: 'Avustralya', englishName: 'Australia', region: 'Okyanusya', tier: 'Tier 2', difficulty: 60, visa: 'Subclass 500', tags: ['Yüksek Yaşam'], salary: 'AUD 80k+', desc: 'Master (Coursework) sonrası 2-3 yıl, Master (Research) sonrası 3 yıl çalışma izni.', strategy: 'Regional bölgelerde okursan ekstra çalışma izni süresi alırsın.', link: 'https://immi.homeaffairs.gov.au/', education: { tuition: 'AUD 30k+', workRights: '24 Saat/Hafta', postGrad: '2-3 Yıl', topUnis: ['UNSW', 'Melbourne', 'Sydney Univ', 'ANU', 'Monash', 'Queensland'], note: 'Tatillerde limitsiz.' },
    checklist: [...commonChecklist, "CoE (Confirmation of Enrolment)", "OSHC Sağlık Sigortası", "GTE (Geçici Giriş) mektubu"]
  },
  // --- BATI AVRUPA ---
  {
    id: 'lu', name: 'Lüksemburg', englishName: 'Luxembourg', region: 'Avrupa', tier: 'Tier 1', difficulty: 65, visa: 'Student Visa', tags: ['Finans', 'Yüksek Maaş'], salary: '€60k+', desc: 'Master öğrencileri için fırsatlar artıyor. Çok dilli ortam.', strategy: 'Staj yaparak sektöre giriş yap.', link: 'https://guichet.public.lu/', education: { tuition: '€400 - €800', workRights: '15 Saat/Hafta', postGrad: 'Var', topUnis: ['Univ. of Luxembourg', 'Lunex University'], note: 'Tatillerde 40 saat.' }, checklist: [...commonChecklist, "Diploma denkliği", "Konaklama sözleşmesi"]
  },
  {
    id: 'li', name: 'Lihtenştayn', englishName: 'Liechtenstein', region: 'Avrupa', tier: 'Tier 3', difficulty: 95, visa: 'Strict', tags: ['Mikro Devlet', 'Zor'], salary: 'CHF 80k+', desc: 'Üniversite seçeneği çok az. Genelde İsviçre\'den gidip gelinir.', strategy: 'İsviçre vizesi ile sınır ötesi öğrenci ol.', link: 'https://www.llv.li/', education: { tuition: 'Yüksek', workRights: 'Kısıtlı', postGrad: 'Yok', topUnis: ['Univ. of Liechtenstein'], note: 'Çalışma izni çok zor.' }, checklist: [...commonChecklist, "İsviçre oturum izni (tavsiye)"]
  },
  {
    id: 'fr', name: 'Fransa', englishName: 'France', region: 'Avrupa', tier: 'Tier 2', difficulty: 50, visa: 'VLS-TS', tags: ['Havacılık'], salary: '€40k+', desc: 'Master diploması (Bac+5) aldıktan sonra "APS" (Job Seeker) vizesine başvurabilirsin.', strategy: 'Alternance (hem oku hem çalış) programlarını kovala.', link: 'https://france-visas.gouv.fr/', education: { tuition: '€243 - €3770', workRights: '20 Saat/Hafta', postGrad: '1 Yıl (APS)', topUnis: ['CentraleSupélec', 'Polytechnique', 'Sorbonne', 'INSA Lyon', 'Telecom Paris', 'Univ. Paris-Saclay'], note: 'Yıllık 964 saat hakkı.' }, checklist: [...commonChecklist, "Campus France onayı", "OFII kaydı", "CVEC ödemesi"]
  },
  {
    id: 'at', name: 'Avusturya', englishName: 'Austria', region: 'Avrupa', tier: 'Tier 2', difficulty: 50, visa: 'Residence Permit Student', tags: ['Yarı İletken'], salary: '€45k+', desc: 'Master öğrencileri haftada 20 saat çalışabilir. Mezuniyet sonrası 12 ay iş arama izni.', strategy: 'Almanca bilmek iş bulmayı çok kolaylaştırır.', link: 'https://www.migration.gv.at/', education: { tuition: '€1.5k', workRights: '20 Saat/Hafta', postGrad: '12 Ay', topUnis: ['TU Wien', 'TU Graz', 'Univ. of Vienna', 'JKU Linz', 'Innsbruck Univ.'], note: 'AMS çalışma izni onayı gerekir.' }, checklist: [...commonChecklist, "Konaklama kanıtı", "Mali yeterlilik belgesi"]
  },
  {
    id: 'be', name: 'Belçika', englishName: 'Belgium', region: 'Avrupa', tier: 'Tier 2', difficulty: 45, visa: 'Student Visa', tags: ['Mikroelektronik'], salary: '€40k+', desc: 'Master sonrası "Search Year" vizesi ile 1 yıl kalabilirsin.', strategy: 'IMEC gibi araştırma merkezlerinde tez yaz.', link: 'https://dofi.ibz.be/', education: { tuition: '€1k-4k', workRights: '20 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['KU Leuven', 'Ghent Univ', 'VUB Brussels', 'UCLouvain', 'Univ. of Antwerp'], note: 'Tatillerde limitsiz.' }, checklist: [...commonChecklist, "ASP (Blocked Account) belgesi", "Sağlık raporu"]
  },
  {
    id: 'ie', name: 'İrlanda', englishName: 'Ireland', region: 'Avrupa', tier: 'Tier 2', difficulty: 45, visa: 'Stamp 2', tags: ['Big Tech'], salary: '€40k+', desc: 'Master mezunları "Third Level Graduate Programme" (Stamp 1G) ile 2 yıl tam zamanlı çalışabilir.', strategy: 'Büyük teknoloji firmalarının Dublin ofislerini hedefle.', link: 'https://enterprise.gov.ie/', education: { tuition: '€12k+', workRights: '20 Saat/Hafta', postGrad: '2 Yıl (Stamp 1G)', topUnis: ['Trinity College Dublin', 'UCD', 'Univ. of Galway', 'DCU', 'Univ. College Cork'], note: 'Yaz ve kış tatilinde 40 saat.' }, checklist: [...commonChecklist, "Özel sağlık sigortası", "3000€ (veya 7000€) finansal kanıt"]
  },
  // --- DOĞU AVRUPA & BALKANLAR ---
  {
    id: 'bg', name: 'Bulgaristan', englishName: 'Bulgaria', region: 'Avrupa', tier: 'Tier 2', difficulty: 30, visa: 'D Visa', tags: ['Düşük Vergi', 'Outsourcing'], salary: '€25k - €35k', desc: 'Master öğrencileri için çalışma imkanları gelişiyor.', strategy: 'Uluslararası şirketlerde part-time iş bak.', link: 'https://www.mfa.bg/', education: { tuition: '€3k-5k', workRights: '20 Saat/Hafta', postGrad: '9 Ay', topUnis: ['Sofia Univ. St. Kliment Ohridski', 'Technical Univ. of Sofia', 'American Univ. in Bulgaria', 'Plovdiv Univ.'], note: 'Çalışma izni gerekebilir.' }, checklist: [...commonChecklist, "D Tipi Vize başvurusu", "Konaklama kanıtı"]
  },
  {
    id: 'cz', name: 'Çekya', englishName: 'Czechia', region: 'Avrupa', tier: 'Tier 1', difficulty: 30, visa: 'Long-term Residence', tags: ['Teknik', 'Merkezi'], salary: '€35k', desc: 'Akredite bir Master programına kayıtlıysan çalışma iznine ihtiyacın YOKTUR (Limitsiz).', strategy: 'Tam zamanlı yazılım işi bulup hem oku hem çalış.', link: 'https://www.studyin.cz/', education: { tuition: '€3k-5k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['CTU Prague', 'Brno Univ. of Tech (BUT)', 'Charles Univ.', 'Masaryk Univ.', 'Univ. of West Bohemia'], note: 'Öğrenciyken full-time çalışmak yasal.' }, checklist: [...commonChecklist, "Nostrifikasyon (diploma denklik)", "Konaklama sözleşmesi"]
  },
  {
    id: 'hu', name: 'Macaristan', englishName: 'Hungary', region: 'Avrupa', tier: 'Tier 2', difficulty: 35, visa: 'Residence Permit', tags: ['Budapeşte', 'Otomotiv'], salary: '€25k - €35k', desc: 'Master öğrencileri dönem içinde 24 saat, tatillerde 66 saat çalışabilir.', strategy: 'Stipendium Hungaricum bursu ile git.', link: 'http://www.bmbah.hu/', education: { tuition: '€3k-6k', workRights: '24 Saat/Hafta', postGrad: '9 Ay', topUnis: ['BME (Budapest Tech)', 'ELTE', 'Univ. of Debrecen', 'Univ. of Szeged', 'Corvinus Univ.'], note: 'Tatillerde full-time.' }, checklist: [...commonChecklist, "Banka hesap dökümü", "Sağlık sigortası"]
  },
  {
    id: 'pl', name: 'Polonya', englishName: 'Poland', region: 'Avrupa', tier: 'Tier 1', difficulty: 20, visa: 'Student Visa', tags: ['Yazılım'], salary: '€25k - €40k', desc: 'Polonya\'da Full-time Master öğrencileri çalışma izni olmadan LİMİTSİZ çalışabilir.', strategy: 'Varşova veya Krakow\'da tam zamanlı bir iş bul.', link: 'https://study.gov.pl/', education: { tuition: '€2k - €4k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['Warsaw Univ. of Tech', 'AGH UST Krakow', 'Wroclaw Tech', 'Poznan Tech', 'Gdansk Tech', 'Jagiellonian Univ.'], note: 'Çalışma izni muafiyeti var.' }, checklist: [...commonChecklist, "Vize randevusu", "Konaklama belgesi", "Sigorta"]
  },
  {
    id: 'ro', name: 'Romanya', englishName: 'Romania', region: 'Avrupa', tier: 'Tier 2', difficulty: 30, visa: 'Student Visa', tags: ['Hızlı İnternet', 'IT'], salary: '€25k - €35k', desc: 'Master öğrencileri haftada 4 saat (part-time) çalışabilir.', strategy: 'IT sektöründeki vergi avantajlarını araştır.', link: 'https://igi.mai.gov.ro/', education: { tuition: '€2k-5k', workRights: 'Part-time (4s/gün)', postGrad: 'Var', topUnis: ['Politehnica Bucharest', 'Babes-Bolyai Univ.', 'Tech. Univ. of Cluj-Napoca', 'Univ. of Bucharest'], note: 'Çalışma saati kısıtlı.' }, checklist: [...commonChecklist, "MEB onayı", "Vize başvurusu"]
  },
  {
    id: 'sk', name: 'Slovakya', englishName: 'Slovakia', region: 'Avrupa', tier: 'Tier 2', difficulty: 35, visa: 'National Visa', tags: ['Otomotiv', 'Üretim'], salary: '€25k - €35k', desc: 'Master öğrencileri haftada 20 saat çalışabilir.', strategy: 'Otomotiv sektöründeki stajları kovala.', link: 'https://www.mic.iom.sk/', education: { tuition: '€2k-5k', workRights: '20 Saat/Hafta', postGrad: '9 Ay', topUnis: ['STU Bratislava', 'Comenius Univ.', 'Tech. Univ. of Kosice', 'Univ. of Zilina'], note: 'Üniversite onayı gerekebilir.' }, checklist: [...commonChecklist]
  },
  // --- İSKANDİNAVYA & BALTIKLAR ---
  {
    id: 'dk', name: 'Danimarka', englishName: 'Denmark', region: 'Kuzey', tier: 'Tier 2', difficulty: 55, visa: 'Residence Permit', tags: ['Rüzgar'], salary: '€50k+', desc: 'Master sonrası "Establishment Card" ile 3 yıla kadar kalabilirsin.', strategy: 'Danca öğrenmek iş bulmayı çok kolaylaştırır.', link: 'https://www.nyidanmark.dk/', education: { tuition: '€6k+', workRights: '20 Saat/Hafta', postGrad: '3 Yıl (Establishment Card)', topUnis: ['DTU (Technical Univ.)', 'Univ. of Copenhagen', 'Aarhus Univ.', 'Aalborg Univ.', 'ITU Copenhagen'], note: 'Yazın (Haz-Ağu) limitsiz.' }, checklist: [...commonChecklist, "ST1 formunu doldur", "Biyometrik veriler"]
  },
  {
    id: 'ee', name: 'Estonya', englishName: 'Estonia', region: 'Avrupa', tier: 'Tier 2', difficulty: 25, visa: 'TRP Student', tags: ['Dijital'], salary: '€35k', desc: 'Master öğrencileri derslerini aksatmadığı sürece LİMİTSİZ çalışabilir.', strategy: 'Estonya\'nın dijital ekosistemindeki startup\'larda çalış.', link: 'https://www.studyinestonia.ee/', education: { tuition: '€3k', workRights: 'Limitsiz', postGrad: '9 Ay', topUnis: ['TalTech', 'Univ. of Tartu', 'Tallinn Univ.'], note: 'Ders başarısı şart.' }, checklist: [...commonChecklist, "D-Visa / TRP başvurusu", "Konaklama"]
  },
  {
    id: 'fi', name: 'Finlandiya', englishName: 'Finland', region: 'Kuzey', tier: 'Tier 2', difficulty: 50, visa: 'Residence Permit', tags: ['Telekom'], salary: '€40k+', desc: 'Çalışma izni haftalık 30 saate çıkarıldı. Master sonrası 2 yıl iş arama izni.', strategy: 'Teknoloji şirketlerinde İngilizce iş bulmak mümkün.', link: 'https://migri.fi/', education: { tuition: '€10k+', workRights: '30 Saat/Hafta', postGrad: '2 Yıl', topUnis: ['Aalto Univ.', 'Univ. of Helsinki', 'Tampere Univ.', 'Univ. of Oulu', 'LUT University'], note: 'Yeni yasa ile 30 saat oldu.' }, checklist: [...commonChecklist, "Migri üzerinden başvuru", "Sağlık sigortası"]
  },
  {
    id: 'se', name: 'İsveç', englishName: 'Sweden', region: 'Kuzey', tier: 'Tier 2', difficulty: 45, visa: 'Residence Permit', tags: ['İnovasyon'], salary: '40k SEK', desc: 'İsveç\'te öğrenciler için çalışma saati SINIRI YOKTUR (Limitsiz).', strategy: 'Derslerini geçebileceğin kadar çalış.', link: 'https://studyinsweden.se/', education: { tuition: '€10k+', workRights: 'Limitsiz', postGrad: '12 Ay', topUnis: ['KTH Royal Inst. of Tech', 'Chalmers Univ.', 'Lund Univ.', 'Uppsala Univ.', 'Linköping Univ.'], note: 'Dersleri aksatmamak kaydıyla.' }, checklist: [...commonChecklist, "Personnummer başvurusu", "Sıraya gir (konaklama)"]
  },
  {
    id: 'no', name: 'Norveç', englishName: 'Norway', region: 'Kuzey', tier: 'Tier 2', difficulty: 65, visa: 'Study Permit', tags: ['Enerji'], salary: '€55k+', desc: 'Master öğrencileri haftada 20 saat çalışabilir.', strategy: 'Sektörle bağlantılı yarı zamanlı işler bul.', link: 'https://www.udi.no/', education: { tuition: 'Ücretli', workRights: '20 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['NTNU (Trondheim)', 'Univ. of Oslo', 'Univ. of Bergen', 'UiT Arctic Univ.'], note: 'Tatillerde full-time.' }, checklist: [...commonChecklist, "UDI başvuru ücreti", "Depozito hesabı aç"]
  },
  {
    id: 'lv', name: 'Letonya', englishName: 'Latvia', region: 'Avrupa', tier: 'Tier 2', difficulty: 30, visa: 'Residence Permit', tags: ['Ucuz', 'Start-up'], salary: '€25k - €35k', desc: 'Master öğrencileri için çalışma izni LİMİTSİZDİR (Full-time çalışabilirsin).', strategy: 'Tam zamanlı bir iş bularak eğitim masraflarını rahatça karşıla.', link: 'https://www.pmlp.gov.lv/', education: { tuition: '€2k-4k', workRights: 'Limitsiz', postGrad: '6 Ay', topUnis: ['Riga Tech Univ. (RTU)', 'Univ. of Latvia', 'Transport & Telecommunication Inst.'], note: 'Lisans 20s, Master Limitsiz.' }, checklist: [...commonChecklist, "AIC Denklik Belgesi", "Oturum kartı randevusu"]
  },
  {
    id: 'lt', name: 'Litvanya', englishName: 'Lithuania', region: 'Avrupa', tier: 'Tier 2', difficulty: 30, visa: 'National Visa D', tags: ['Fintech', 'Hızlı'], salary: '€25k - €40k', desc: 'Master öğrencileri haftada 20 saat çalışabilir.', strategy: 'Fintech şirketlerinde yarı zamanlı pozisyonlar.', link: 'https://migracija.lrv.lt/', education: { tuition: '€2k-4k', workRights: '20 Saat/Hafta', postGrad: '15 Ay', topUnis: ['Kaunas Tech Univ. (KTU)', 'Vilnius Univ.', 'Vilnius Tech'], note: 'Mezuniyet sonrası 15 ay.' }, checklist: [...commonChecklist, "TRP başvurusu", "SKVC denklik"]
  },
  // --- GÜNEY AVRUPA & AKDENİZ ---
  {
    id: 'es', name: 'İspanya', englishName: 'Spain', region: 'Avrupa', tier: 'Tier 2', difficulty: 40, visa: 'Student Visa', tags: ['Telekom'], salary: '€30k+', desc: 'Çalışma izni haftalık 30 saate çıkarıldı. Staj imkanları geniş.', strategy: 'Barselona ve Madrid teknoloji hublarıdır.', link: 'https://www.exteriores.gob.es/', education: { tuition: '€2k-5k', workRights: '30 Saat/Hafta', postGrad: '1 Yıl', topUnis: ['UPC Barcelona', 'Univ. Politécnica de Madrid (UPM)', 'Univ. Politécnica de Valencia (UPV)', 'Univ. of Barcelona'], note: 'Yeni yasa ile 30 saat.' }, checklist: [...commonChecklist, "NIE numarası al", "Empadronamiento (adres kaydı)"]
  },
  {
    id: 'it', name: 'İtalya', englishName: 'Italy', region: 'Avrupa', tier: 'Tier 1', difficulty: 25, visa: 'Student Visa', tags: ['Burs', 'Otomotiv'], salary: '€28k - €35k', desc: 'Yıllık 1040 saat çalışma sınırı var (ort. 20 saat/hafta).', strategy: 'DSU bursu ve part-time iş ile geçinmek mümkün.', link: 'https://www.universitaly.it/', education: { tuition: 'Bursla Bedava', workRights: '20 Saat/Hafta', postGrad: '12 Ay', topUnis: ['Politecnico di Milano', 'Politecnico di Torino', 'Sapienza Univ. Rome', 'Univ. of Bologna', 'Univ. of Padova'], note: 'Yıllık 1040 saat sınırı.' }, checklist: [...commonChecklist, "CIMEA Denklik Belgesi", "Codice Fiscale al", "Permesso di Soggiorno başvurusu"]
  },
  {
    id: 'pt', name: 'Portekiz', englishName: 'Portugal', region: 'Avrupa', tier: 'Tier 1', difficulty: 10, visa: 'D4 Visa', tags: ['Ucuz'], salary: '€20k', desc: 'Master öğrencileri çalışabilir, ancak SEF\'e bildirim yapılmalı.', strategy: 'Lizbon ve Porto\'daki teknoloji şirketlerine bak.', link: 'https://vistos.mne.gov.pt/', education: { tuition: '€1k-3k', workRights: '20 Saat/Hafta', postGrad: 'Kolay', topUnis: ['Univ. of Porto', 'Técnico Lisboa (IST)', 'Univ. of Coimbra', 'Nova Univ. Lisbon'], note: 'SEF onayı gerekli.' }, checklist: [...commonChecklist, "NIF (Vergi Numarası) al", "Junta de Freguesia (adres)"]
  },
  // --- ASYA ---
  {
    id: 'jp', name: 'Japonya', englishName: 'Japan', region: 'Asya', tier: 'Tier 2', difficulty: 60, visa: 'Student Visa', tags: ['Robotik'], salary: '¥4M+', desc: 'Haftada 28 saat çalışma izni (özel izinle).', strategy: 'MEXT bursu ile gitmek en mantıklısı.', link: 'https://www.mofa.go.jp/', education: { tuition: 'MEXT Bedava', workRights: '28 Saat/Hafta', postGrad: 'İş Bulana Dek', topUnis: ['Univ. of Tokyo', 'Tokyo Tech', 'Kyoto Univ.', 'Osaka Univ.', 'Tohoku Univ.', 'Keio Univ.'], note: 'Shikakugai katsudo kyoka izni şart.' }, checklist: [...commonChecklist, "CoE (Certificate of Eligibility)", "MEXT bursu başvurusu"]
  },
   {
    id: 'kr', name: 'Güney Kore', englishName: 'South Korea', region: 'Asya', tier: 'Tier 2', difficulty: 55, visa: 'D-2 Visa', tags: ['Samsung'], salary: '₩40M+', desc: 'Master öğrencileri için çalışma izni dil seviyesine (TOPIK) bağlı olarak 30-35 saate kadar çıkabilir.', strategy: 'GKS bursuna başvur.', link: 'https://www.visa.go.kr/', education: { tuition: 'GKS Bedava', workRights: '20-30 Saat/Hafta', postGrad: '2 Yıl (D-10)', topUnis: ['KAIST', 'Seoul National Univ. (SNU)', 'POSTECH', 'Yonsei Univ.', 'Korea Univ.'], note: 'TOPIK seviyesine göre değişir.' }, checklist: [...commonChecklist, "GKS bursu belgeleri", "TOPIK sınav sonucu"]
  },
  {
    id: 'sg', name: 'Singapur', englishName: 'Singapore', region: 'Asya', tier: 'Tier 1', difficulty: 75, visa: 'Student Pass', tags: ['Fintech', 'Sıcak'], salary: 'SGD 60k+', desc: 'Belirlenen üniversitelerde okuyanlar part-time (16 saat) çalışabilir.', strategy: 'Hükümet burslarına (Tuition Grant) bak.', link: 'https://www.mom.gov.sg/', education: { tuition: 'Yüksek', workRights: '16 Saat/Hafta', postGrad: 'LTVP', topUnis: ['NUS', 'NTU', 'SMU', 'SUTD'], note: 'Sadece onaylı kurumlarda.' }, checklist: [...commonChecklist, "Student Pass başvurusu", "Tuition Grant Scheme"]
  },
  {
    id: 'cn', name: 'Çin', englishName: 'China', region: 'Asya', tier: 'Tier 2', difficulty: 65, visa: 'X1 Visa', tags: ['Üretim', 'Donanım'], salary: '¥200k+', desc: 'Yasal olarak öğrenciyken çalışmak zordur, ancak staj yapılabilir.', strategy: 'Burslu Master programları çok yaygın.', link: 'https://www.visaforchina.org/', education: { tuition: 'Burslu', workRights: 'Kısıtlı (Staj)', postGrad: '-', topUnis: ['Tsinghua Univ.', 'Peking Univ.', 'Shanghai Jiao Tong', 'Fudan Univ.', 'Zhejiang Univ.'], note: 'Üniversite ve işveren onayı şart.' }, checklist: [...commonChecklist, "JW201/JW202 formu", "Sağlık raporu"]
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
    { title: "STM32 Bootloader", desc: "UART üzerinden kendi bootloader'ını yazarak firmware güncelleme mantığını kavra." },
    { title: "RTOS Weather Station", desc: "FreeRTOS ile sıcaklık/nem sensörlerini okuyan ve ekrana basan çoklu görev (multitasking) yapısı kur." },
    { title: "Digital Oscilloscope", desc: "STM32 ADC ve DMA kullanarak yüksek hızlı analog sinyalleri yakala ve ekranda çizdir." },
    { title: "MP3 Player", desc: "SPI/I2S protokolleri ile SD karttan ses dosyalarını okuyup bir DAC üzerinden çal." },
    { title: "PID Line Follower", desc: "Kızılötesi sensörler ve PID kontrol algoritması kullanarak çizgi izleyen robot yap." },
    { title: "Smart Lock System", desc: "Keypad, servo motor ve şifreleme algoritmaları kullanarak güvenli bir kilit sistemi tasarla." }
  ],
  "Junior Firmware Engineer": [
    { title: "Bare Metal SPI Driver", desc: "HAL kütüphanesi kullanmadan, doğrudan register'lara yazarak SPI sürücüsü geliştir." },
    { title: "USB HID Device", desc: "Mikrodenetleyiciyi bilgisayara klavye veya mouse olarak tanıtan USB stack'i kullan." },
    { title: "I2C EEPROM Bit-Banging", desc: "Donanım I2C modülü yerine GPIO'ları manuel kontrol ederek I2C protokolünü yazılımla oluştur." },
    { title: "Low Power Sensor Node", desc: "Uyku modlarını ve kesmeleri (interrupts) kullanarak pil ömrünü maksimize eden bir sensör düğümü yap." },
    { title: "OTA Update over BLE", desc: "Bluetooth Low Energy üzerinden kablosuz firmware güncellemesi (FOTA) yapan bir sistem kur." },
    { title: "Custom Bootloader", desc: "Cihazın açılışını kontrol eden ve güvenli önyükleme (secure boot) sağlayan kendi bootloader'ını yaz." }
  ],
  "Junior IoT Engineer": [
    { title: "MQTT Dashboard", desc: "ESP32 ile sensör verilerini AWS IoT Core veya HiveMQ'ya gönderip React tabanlı bir panelde izle." },
    { title: "Smart Home Hub", desc: "Farklı marka akıllı cihazları (Zigbee/WiFi) tek bir merkezden yöneten (Home Assistant benzeri) bir hub yap." },
    { title: "GPS Asset Tracker", desc: "GPS ve GSM (SIM800L) modülleriyle bir varlığın konumunu canlı olarak haritada takip et." },
    { title: "Smart Irrigation", desc: "Toprak nemine göre otomatik sulama yapan ve mobil uygulamadan kontrol edilen bir sistem." },
    { title: "Voice Controlled Light", desc: "ESP32'yi Amazon Alexa veya Google Assistant ile entegre ederek sesle lamba kontrolü yap." },
    { title: "Industrial Modbus Monitor", desc: "RS485 Modbus verilerini okuyup MQTT üzerinden buluta aktaran bir endüstriyel gateway tasarla." }
  ],
  "Test Automation Engineer Python": [
    { title: "HIL Simulation Script", desc: "Python (PySerial) ile donanıma komut gönderip yanıtları doğrulayan otomatik test senaryoları yaz." },
    { title: "Log Analyzer Tool", desc: "Gigabaytlarca log dosyasını tarayıp hata desenlerini (error patterns) bulan ve raporlayan bir araç geliştir." },
    { title: "API Testing Framework", desc: "Pytest ve Requests kütüphaneleriyle bir REST API'nin tüm uç noktalarını (endpoints) test eden yapı kur." },
    { title: "Web Scraper & Validator", desc: "Selenium veya BeautifulSoup ile web sitelerinden veri çekip içerik doğruluğunu test et." },
    { title: "CI/CD Pipeline Script", desc: "GitHub Actions veya Jenkins üzerinde çalışacak, kod commit edildiğinde otomatik testleri başlatan scriptler yaz." },
    { title: "GUI Automation Bot", desc: "PyAutoGUI kullanarak masaüstü uygulamalarında tekrarlayan işlemleri otomatize eden bir bot yap." }
  ],
  "PLC Automation Engineer": [
    { title: "Traffic Light Logic", desc: "Karmaşık bir kavşak için zamanlayıcılar ve sensörler içeren trafik ışığı kontrol mantığı (Ladder Logic)." },
    { title: "Tank Level Control", desc: "PID kontrol bloğu kullanarak bir tankın su seviyesini sabit tutan otomasyon sistemi." },
    { title: "Elevator Control System", desc: "4 katlı bir asansörün çağrı önceliklendirme ve güvenlik kilitlerini içeren PLC programı." },
    { title: "Conveyor Sorting System", desc: "Sensörler yardımıyla ürünleri boyutuna veya rengine göre ayıran konveyör bant otomasyonu." },
    { title: "Automatic Car Wash", desc: "Sıralı işlem (sequential process) mantığıyla çalışan, fırça ve su jetlerini yöneten oto yıkama sistemi." },
    { title: "VFD Motor Control", desc: "PLC üzerinden Modbus haberleşmesi ile bir AC motorun hızını ve yönünü kontrol et." }
  ],
  "System Integration Engineer": [
    { title: "Sensor Fusion", desc: "İvmeölçer, Jiroskop ve Manyetometre verilerini Kalman Filtresi ile birleştirip hassas konum bul." },
    { title: "CAN Bus Sniffer", desc: "Araç içi haberleşme ağını (CAN Bus) dinleyen, verileri çözümleyen ve kaydeden bir donanım aracı." },
    { title: "Robot Arm Interface", desc: "Mekanik bir robot kolu ROS (Robot Operating System) ve seri haberleşme ile bilgisayardan kontrol et." },
    { title: "Drone Flight Controller", desc: "Kendi uçuş kontrolcünü yazarak sensör verilerini motor hızlarına dönüştüren stabilizasyon algoritması." },
    { title: "Vision Inspection System", desc: "OpenCV ve endüstriyel kamera kullanarak üretim hattındaki hatalı ürünleri tespit eden sistem." },
    { title: "Multi-Sensor Data Logger", desc: "Farklı arayüzlerden (SPI, I2C, UART) gelen verileri toplayıp SQL veritabanına kaydeden entegre sistem." }
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
  const [selectedCountry, setSelectedCountry] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('career'); // 'career' | 'education' | 'checklist'
  const [selectedRole, setSelectedRole] = useState(engineerRoles[0].title); 
  const [workFilter, setWorkFilter] = useState('all'); // 'all', 'full', 'part'
  
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

  // Project Idea State
  const [projectIdeaIndex, setProjectIdeaIndex] = useState(0);


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
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
      
      let matchWork = true;
      const rights = c.education.workRights.toLowerCase();
      
      if (workFilter === 'full') {
          // "Limitsiz" veya "Full-Time" geçenler
          matchWork = rights.includes('limitsiz') || rights.includes('full-time');
      } else if (workFilter === 'part') {
          // "Saat" veya "Part" geçenler VE "Limitsiz" olmayanlar
          matchWork = !rights.includes('limitsiz') && (rights.includes('saat') || rights.includes('part') || rights.includes('kısıtlı'));
      }

      return matchTab && matchSearch && matchWork;
    });
  }, [activeTab, searchTerm, workFilter]);
  
  useEffect(() => {
      if (appMode === 'explorer') {
          if (!selectedCountry && filteredData.length > 0 && window.innerWidth >= 768) {
             // Sadece desktop'ta otomatik ilk ülkeyi seç, mobilde seçme
             setSelectedCountry(filteredData[0]);
          } else if (filteredData.length === 0) {
             setSelectedCountry(null);
          }
      }
  }, [filteredData, appMode]);

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
                    {/* YENİ MANTIK: Sadece 'Planlama' dışındakileri say */}
                    <p className="text-2xl font-bold text-white">{userApplications.filter(a => a.status !== 'to_apply').length}</p>
                 </div>
                 
                 <div className="mt-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Hızlı Ekle</h3>
                    
                    {user && !user.isAnonymous ? (
                        <>
                            <div className="space-y-2 mb-2">
                                <input type="text" placeholder="Şirket Adı" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppCompany} onChange={e => setNewAppCompany(e.target.value)} />
                                <input type="text" placeholder="Pozisyon" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppRole} onChange={e => setNewAppRole(e.target.value)} />
                                <input type="text" placeholder="Şirket Web Sitesi (Opsiyonel)" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppCompanyUrl} onChange={e => setNewAppCompanyUrl(e.target.value)} />
                                <input type="text" placeholder="İlan Linki (Opsiyonel)" className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs outline-none focus:border-purple-500" value={newAppJobUrl} onChange={e => setNewAppJobUrl(e.target.value)} />
                            </div>
                            <button onClick={addApplication} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Plus size={12}/> Ekle</button>
                        </>
                    ) : (
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-dashed border-slate-600 text-center">
                            <p className="text-[10px] text-slate-400 mb-2">İlan eklemek için giriş yapmalısın.</p>
                            <button 
                                onClick={handleGoogleLogin}
                                disabled={isLoggingIn}
                                className="w-full bg-white text-slate-900 py-1.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 hover:bg-slate-200 transition-colors disabled:opacity-50"
                            >
                                {isLoggingIn ? <Loader2 size={10} className="animate-spin" /> : <><LogIn size={10} /> Giriş Yap</>}
                            </button>
                        </div>
                    )}
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
                
                {/* YENİ EKLENEN KISIM: TARİH VE BAŞVURU SAYISI */}
                <div className="hidden md:flex items-center gap-3">
                    {user && !user.isAnonymous && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 shadow-sm animate-in fade-in">
                            <ClipboardList size={14} />
                            {/* YENİ MANTIK: Sadece 'Planlama' dışındakileri say */}
                            <span className="text-xs font-bold">Toplam {userApplications.filter(a => a.status !== 'to_apply').length} Başvuru</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-full border border-white/10 shadow-sm">
                        <Calendar size={14} className="text-slate-400"/>
                        <span className="text-xs font-bold text-slate-300 uppercase">
                            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>
                </header>

                <main className="flex-1 flex overflow-hidden relative">
                    {/* LIST */}
                    <div className={`
                        flex flex-col shrink-0 bg-slate-900/30 transition-all duration-300
                        ${selectedCountry ? 'hidden md:flex md:w-[380px] border-r border-white/5' : 'w-full md:w-[380px] border-r border-white/5'}
                    `}>
                        <div className="p-4 border-b border-white/5 text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                            <span>Sonuçlar ({filteredData.length})</span>
                            {/* YENİ FİLTRE BUTONLARI */}
                            <div className="flex gap-1 bg-slate-800 p-0.5 rounded-lg">
                                <button onClick={() => setWorkFilter('all')} className={`px-2 py-1 rounded-md transition-all ${workFilter === 'all' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Tümü</button>
                                <button onClick={() => setWorkFilter('part')} className={`px-2 py-1 rounded-md transition-all ${workFilter === 'part' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Yarı</button>
                                <button onClick={() => setWorkFilter('full')} className={`px-2 py-1 rounded-md transition-all ${workFilter === 'full' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Tam</button>
                            </div>
                        </div>
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
                        <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50 overflow-y-auto fixed inset-0 z-40 md:static md:z-auto">
                            <div className="h-40 relative shrink-0 overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${getTierGradient(selectedCountry.tier)} z-0 border-b`}></div>
                                <button 
                                    onClick={() => setSelectedCountry(null)} 
                                    className="absolute top-4 left-4 z-30 p-2 bg-black/40 backdrop-blur-md rounded-full text-white md:hidden hover:bg-black/60 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
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
                                            <div className="bg-slate-900/50 border border-white/5 rounded-xl p-5">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Lightbulb size={14}/> Proje Fikri</h4>
                                                    <button onClick={() => setProjectIdeaIndex(prev => prev + 1)} className="text-slate-500 hover:text-cyan-400 transition-colors" title="Fikri Değiştir">
                                                        <RefreshCw size={12} />
                                                    </button>
                                                </div>
                                                {(() => {
                                                    const roleProjects = projectIdeas[selectedRole] || projectIdeas["Junior Embedded Software Engineer"];
                                                    const currentProject = roleProjects[projectIdeaIndex % roleProjects.length];
                                                    return (
                                                        <div>
                                                            <div className="text-sm font-bold text-white mb-1">{currentProject.title}</div>
                                                            <div className="text-xs text-slate-500 leading-relaxed">{currentProject.desc}</div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
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
