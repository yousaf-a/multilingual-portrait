export interface TranslatedItem {
  language: string;
  nativeLanguage: string;
  text: string;
  script: string;
}

// 100 Built-in language translations for "I Love You" (Reel 2 reference)
export const LOVE_TRANSLATIONS: Record<string, string> = {
  English: "I Love You",
  Spanish: "Te amo",
  French: "Je t'aime",
  German: "Ich liebe dich",
  Italian: "Ti amo",
  Portuguese: "Eu te amo",
  Russian: "Я тебя люблю",
  Chinese: "我爱你",
  Japanese: "愛してる",
  Korean: "사랑해",
  Arabic: "أحبك",
  Hindi: "मैं तुमसे प्यार करता हूँ",
  Bengali: "আমি তোমাকে ভালোবাসি",
  Punjabi: "ਮੈਂ ਤੈਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ",
  Urdu: "میں تم سے پیار کرتا ہوں",
  Turkish: "Seni seviyorum",
  Vietnamese: "Anh yêu em",
  Thai: "ฉันรักเธอ",
  Greek: "Σ' αγαπώ",
  Hebrew: "אני אוהב אותך",
  Dutch: "Ik hou van jou",
  Swedish: "Jag älskar dig",
  Norwegian: "Jeg elsker deg",
  Danish: "Jeg elsker dig",
  Finnish: "Minä rakastan sinua",
  Polish: "Kocham cię",
  Czech: "Miluji tě",
  Hungarian: "Szeretlek",
  Romanian: "Te iubesc",
  Ukrainian: "Я тебе кохаю",
  Indonesian: "Aku cinta kamu",
  Malay: "Saya sayang awak",
  Tagalog: "Mahal kita",
  Swahili: "Nakupenda",
  Persian: "دوستت دارم",
  Tamil: "நான் உன்னை காதலிக்கிறேன்",
  Telugu: "నేను నిన్ను ప్రేమిస్తున్నాను",
  Marathi: "माझं तुझ्यावर प्रेम आहे",
  Gujarati: "હું તને પ્રેમ કરું છું",
  Kannada: "ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ",
  Malayalam: "ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു",
  Nepali: "म तिमीलाई माया गर्छु",
  Sinhala: "මම ඔයාට ආදරෙයි",
  Burmese: "ချစ်တယ်",
  Khmer: "ខ្ញុំស្រឡាញ់អ្នក",
  Georgian: "მიყვარხარ",
  Armenian: "Ես քեզ սիրում եմ",
  Irish: "Is breá liom tú",
  Welsh: "Rwy'n dy garu di",
  Icelandic: "Ég elska þig",
  Albanian: "Të dua",
  Croatian: "Volim te",
  Serbian: "Волим те",
  Bulgarian: "Обичам те",
  Slovak: "Ľúbim ťa",
  Slovenian: "Ljubim te",
  Lithuanian: "Aš tave myliu",
  Latvian: "Es tevi mīlu",
  Estonian: "Ma armastan sind",
  Maltese: "Inħobbok",
  Basque: "Maite zaitut",
  Catalan: "T'estimo",
  Galician: "Ámote",
  Esperanto: "Mi amas vin",
  Latin: "Te amo",
  Hawaiian: "Aloha au iā 'oe",
  Samoan: "Ou te alofa ia te oe",
  Maori: "Aroha ahau ki a koe",
  Fijian: "Au domoni iko",
  Mongolian: "Би чамд хайртай",
  Kazakh: "Мен сені сүйемін",
  Uzbek: "Men seni sevaman",
  Azerbaijani: "Mən səni sevirəm",
  Kurdish: "Ez te hez dikim",
  Pashto: "زه تا سره مینه لرم",
  Amharic: "እወድሃለሁ",
  Yoruba: "Mo nifẹ rẹ",
  Igbo: "A hụrụ m gị n'anya",
  Zulu: "Ngiyakuthanda",
  Xhosa: "Ndiyakuthanda",
  Afrikaans: "Ek het jou lief",
  Somali: "Waan ku jecelahay",
  Malagasy: "Tiako ianao",
  Cebuano: "Gihigugma ko ikaw",
  Javanese: "Aku tresna sampeyan",
  Sundanese: "Abdi bogoh ka anjeun",
  Klingon: "bangwiI",
  Tibetan: "ང་ཁྱོད་ལ་དགའ་པོ་ཡོད།",
  Yiddish: "איך האָב דיך ליב",
  Luxembourgish: "Ech hunn dech gär",
  Macedonian: "Те сакам",
  Belarusian: "Я цябе кахаю",
  Bosnian: "Volim te",
  Corsican: "Ti tengu caru",
  Frisian: "Ik hâld fan dy",
  HaitianCreole: "Mwen renmen ou",
  Kinyarwanda: "Ndagukunda",
  Sesotho: "Ke a o rata",
  Shona: "Ndinokuda"
};

// 100 Built-in language translations for "Sorry" (Reel 1 reference)
export const SORRY_TRANSLATIONS: Record<string, string> = {
  English: "I'm Sorry",
  Spanish: "Lo siento",
  French: "Je suis désolé",
  German: "Es tut mir leid",
  Italian: "Mi dispiace",
  Portuguese: "Desculpe",
  Russian: "Прости меня",
  Chinese: "对不起",
  Japanese: "ごめんなさい",
  Korean: "미안해요",
  Arabic: "أنا آسف",
  Hindi: "मुझे माफ़ कर दो",
  Bengali: "আমাকে ক্ষমা করো",
  Punjabi: "ਮੈਨੂੰ ਮਾਫ਼ ਕਰ ਦਿਓ",
  Urdu: "مجھے معاف کر دو",
  Turkish: "Özür dilerim",
  Vietnamese: "Tôi xin lỗi",
  Thai: "ฉันขอโทษ",
  Greek: "Συγγνώμη",
  Hebrew: "אני מצטער",
  Dutch: "Het spijt me",
  Swedish: "Förlåt mig",
  Norwegian: "Beklager",
  Danish: "Undskyld",
  Finnish: "Anteeksi",
  Polish: "Przepraszam",
  Czech: "Promiň",
  Hungarian: "Bocsánat",
  Romanian: "Îmi pare rău",
  Ukrainian: "Вибач мене",
  Indonesian: "Maafkan aku",
  Malay: "Maafkan saya",
  Tagalog: "Patawad",
  Swahili: "Samahani",
  Persian: "متاسفم",
  Tamil: "என்னை மன்னிக்கவும்",
  Telugu: "నన్ను క్షమించు",
  Marathi: "मला माफ करा",
  Gujarati: "મને માફ કરો",
  Kannada: "ನನ್ನನ್ನು ಕ್ಷಮಿಸಿ",
  Malayalam: "എനിക്ക് ഖേദമുണ്ട്",
  Nepali: "मलाई माफ गर्नुहोस्",
  Sinhala: "සමාවෙන්න",
  Burmese: "တောင်းပန်ပါတယ်",
  Khmer: "សុំទោស",
  Georgian: "მაპატიე",
  Armenian: "Կներեք",
  Irish: "Tá brón orm",
  Welsh: "Mae'n ddrwg gennyf",
  Icelandic: "Fyrirgefðu",
  Albanian: "Më fal",
  Croatian: "Oprosti mi",
  Serbian: "Опрости ми",
  Bulgarian: "Съжалявам",
  Slovak: "Prepáč",
  Slovenian: "Oprosti",
  Lithuanian: "Atsiprašau",
  Latvian: "Piedod",
  Estonian: "Vabandust",
  Maltese: "Skuzani",
  Basque: "Barkatu",
  Catalan: "Ho sento",
  Galician: "Desculpe",
  Esperanto: "Pardonu min",
  Latin: "Me paenitet",
  Hawaiian: "E kala mai iaʻu",
  Samoan: "Faʻamalie",
  Maori: "Aroha mai",
  Fijian: "Vosoti au",
  Mongolian: "Уучлаарай",
  Kazakh: "Кешіріңіз",
  Uzbek: "Kechirasiz",
  Azerbaijani: "Bağışlayın",
  Kurdish: "Biborîne",
  Pashto: "بخښنه غواړم",
  Amharic: "ይቅርታ",
  Yoruba: "E ma binu",
  Igbo: "Gbaghara m",
  Zulu: "Ngiyaxolisa",
  Xhosa: "Ndixolele",
  Afrikaans: "Ek is jammer",
  Somali: "Waan ka xumahay",
  Malagasy: "Azafady",
  Cebuano: "Pasayloa ko",
  Javanese: "Nyuwun pangapunten",
  Sundanese: "Hapunten",
  Klingon: "jIbech",
  Tibetan: "དགོངས་དག",
  Yiddish: "אַנטשולדיק",
  Luxembourgish: "Et deet mir leed",
  Macedonian: "Извини",
  Belarusian: "Прабачце",
  Bosnian: "Žao mi je",
  Corsican: "Scusatemi",
  Frisian: "It spyt my",
  HaitianCreole: "Eskize mwen",
  Kinyarwanda: "Umbabarire",
  Sesotho: "Ntshwarele",
  Shona: "Ndine urombo"
};

// Alphabet script transliteration helpers for custom names
const CYRILLIC_MAP: Record<string, string> = {
  a: 'а', b: 'б', c: 'к', d: 'д', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'дж',
  k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', q: 'к', r: 'р', s: 'с', t: 'т',
  u: 'у', v: 'в', w: 'в', x: 'кс', y: 'й', z: 'з', th: 'т', sh: 'ш', ch: 'ч', ph: 'ф'
};

const GREEK_MAP: Record<string, string> = {
  a: 'α', b: 'β', c: 'κ', d: 'δ', e: 'ε', f: 'φ', g: 'γ', h: 'χ', i: 'ι', j: 'τζ',
  k: 'κ', l: 'λ', m: 'μ', n: 'ν', o: 'ο', p: 'π', q: 'κ', r: 'ρ', s: 'σ', t: 'τ',
  u: 'ου', v: 'β', w: 'ου', x: 'ξ', y: 'υ', z: 'ζ'
};

const ARABIC_MAP: Record<string, string> = {
  a: 'ا', b: 'ب', c: 'ك', d: 'د', e: 'ي', f: 'ف', g: 'ج', h: 'ه', i: 'ي', j: 'ج',
  k: 'ك', l: 'ل', m: 'م', n: 'ن', o: 'و', p: 'ب', q: 'ك', r: 'ر', s: 'س', t: 'ت',
  u: 'و', v: 'ف', w: 'و', x: 'كس', y: 'ي', z: 'ز'
};

const HEBREW_MAP: Record<string, string> = {
  a: 'א', b: 'ב', c: 'ק', d: 'ד', e: 'ה', f: 'פ', g: 'ג', h: 'ה', i: 'י', j: 'ג׳',
  k: 'ק', l: 'ל', m: 'מ', n: 'נ', o: 'ו', p: 'פ', q: 'ק', r: 'ר', s: 'ס', t: 'ת',
  u: 'ו', v: 'ו', w: 'וו', x: 'קס', y: 'י', z: 'ז'
};

const DEVANAGARI_MAP: Record<string, string> = {
  a: 'आ', b: 'ब', c: 'क', d: 'ड', e: 'ए', f: 'फ', g: 'ग', h: 'ह', i: 'इ', j: 'ज',
  k: 'क', l: 'ल', m: 'म', n: 'न', o: 'ओ', p: 'प', q: 'क', r: 'र', s: 'स', t: 'ट',
  u: 'उ', v: 'व', w: 'व', x: 'क्स', y: 'य', z: 'ज़'
};

const KATAKANA_MAP: Record<string, string> = {
  a: 'ア', b: 'ブ', c: 'ク', d: 'ド', e: 'エ', f: 'フ', g: 'グ', h: 'ハ', i: 'イ', j: 'ジ',
  k: 'ク', l: 'ル', m: 'ム', n: 'ン', o: 'オ', p: 'プ', q: 'ク', r: 'ル', s: 'ス', t: 'ト',
  u: 'ウ', v: 'ヴ', w: 'ワ', x: 'クス', y: 'イ', z: 'ズ'
};

const HANGUL_MAP: Record<string, string> = {
  a: '아', b: '브', c: '크', d: '드', e: '에', f: '프', g: '그', h: '하', i: '이', j: '즈',
  k: '크', l: '르', m: '음', n: '엔', o: '오', p: '프', q: '큐', r: '알', s: '스', t: '트',
  u: '우', v: '브', w: '더블유', x: '엑스', y: '와이', z: '즈'
};

function transliterateWithMap(text: string, map: Record<string, string>): string {
  const lower = text.toLowerCase();
  let result = '';
  for (let i = 0; i < lower.length; i++) {
    const char = lower[i];
    result += map[char] || char;
  }
  return result;
}

// Generates 100 entries strictly using what the user fills
export function getMultilingualList(
  name: string,
  mode: 'name' | 'love' | 'sorry' | 'custom' = 'name'
): TranslatedItem[] {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return [];
  }

  // If user explicitly entered "I Love You" or "Love You", provide world translations of that phrase
  const isExplicitLove =
    trimmedName.toLowerCase() === 'i love you' ||
    trimmedName.toLowerCase() === 'love you';

  if (isExplicitLove) {
    return Object.entries(LOVE_TRANSLATIONS).map(([language, phrase]) => ({
      language,
      nativeLanguage: language,
      text: phrase,
      script: 'native'
    }));
  }

  if (mode === 'sorry' && trimmedName.toLowerCase().includes('sorry')) {
    return Object.entries(SORRY_TRANSLATIONS).map(([language, phrase]) => ({
      language,
      nativeLanguage: language,
      text: phrase,
      script: 'native'
    }));
  }

  // Pure user input in 100 languages/scripts: NO forced "I Love You" prefix or suffix!
  const list: TranslatedItem[] = [];
  const baseLanguages = Object.keys(LOVE_TRANSLATIONS);

  for (const lang of baseLanguages) {
    let scriptText = trimmedName;

    // Apply phonetic script mappings for key language families
    if (['Russian', 'Ukrainian', 'Bulgarian', 'Serbian', 'Macedonian', 'Belarusian'].includes(lang)) {
      scriptText = transliterateWithMap(trimmedName, CYRILLIC_MAP);
    } else if (lang === 'Greek') {
      scriptText = transliterateWithMap(trimmedName, GREEK_MAP);
    } else if (['Arabic', 'Urdu', 'Persian', 'Pashto', 'Kurdish'].includes(lang)) {
      scriptText = transliterateWithMap(trimmedName, ARABIC_MAP);
    } else if (['Hebrew', 'Yiddish'].includes(lang)) {
      scriptText = transliterateWithMap(trimmedName, HEBREW_MAP);
    } else if (['Hindi', 'Marathi', 'Nepali'].includes(lang)) {
      scriptText = transliterateWithMap(trimmedName, DEVANAGARI_MAP);
    } else if (lang === 'Japanese') {
      scriptText = transliterateWithMap(trimmedName, KATAKANA_MAP);
    } else if (lang === 'Korean') {
      scriptText = transliterateWithMap(trimmedName, HANGUL_MAP);
    } else {
      // Latin variations: exact user text
      scriptText = trimmedName;
    }

    list.push({
      language: lang,
      nativeLanguage: lang,
      text: scriptText,
      script: lang
    });
  }

  return list;
}

