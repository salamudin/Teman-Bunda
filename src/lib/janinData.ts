export interface JaninWeekInfo {
  week: number;
  emoji?: string;
  size: string; // e.g. "2.5 cm"

  weight: string; // e.g. "2 gram"
  fruitAnalogy: string; // e.g. "Biji Jeruk"
  description: string;
  motherSensation: string;
  tips: string[];
}

export const janinDataList: Record<number, JaninWeekInfo> = {
  1: {
    week: 1,
    emoji: "👶",
    size: "0.01 cm",
    weight: "0 gr",
    fruitAnalogy: "Biji Poppy",
    description: "Selama minggu pertama, tubuh Bunda sedang mempersiapkan diri untuk pembuahan. Lapisan rahim mulai menebal.",
    motherSensation: "Mungkin belum ada gejala fisik yang terasa, namun hormon mulai bersiap.",
    tips: ["Mulailah mengonsumsi vitamin prenatal.", "Catat tanggal HPHT dengan akurat."]
  },
  2: {
    week: 2,
    emoji: "🥚",
    size: "0.02 cm",
    weight: "0 gr",
    fruitAnalogy: "Biji Wijen",
    description: "Pembuahan biasanya terjadi pada akhir minggu ini. Sel telur dan sperma bertemu membentuk zigot.",
    motherSensation: "Beberapa Bunda mungkin merasakan nyeri ovulasi ringan di satu sisi perut.",
    tips: ["Jaga pola makan sehat dan bergizi.", "Hindari stres berlebih."]
  },
  3: {
    week: 3,
    emoji: "🌱",
    size: "0.05 cm",
    weight: "0 gr",
    fruitAnalogy: "Butiran Beras",
    description: "Sel telur yang telah dibuahi mulai membelah dengan cepat dan melakukan perjalanan menuju rahim.",
    motherSensation: "Mungkin ada sedikit bercak darah (implantation bleeding) saat janin menempel di rahim.",
    tips: ["Tetap terhidrasi dengan baik.", "Konsumsi asam folat secara rutin."]
  },
  4: {

    week: 4,
    size: "0.1 cm",
    weight: " < 1 gr",
    fruitAnalogy: "Biji Selasih",
    description: "Blastokista sekarang disebut embrio. Pembentukan awal jantung dan sistem saraf pusat mulai terjadi.",
    motherSensation: "Mungkin merasa mual ringan (morning sickness) dan payudara terasa lebih sensitif.",
    tips: ["Mulai konsumsi asam folat.", "Hindari asap rokok dan alkohol."]
  },
  8: {
    week: 8,
    emoji: "🫐",
    size: "1.6 cm",
    weight: "1 gr",
    fruitAnalogy: "Buah Raspberry",
    description: "Jari tangan dan kaki mulai terbentuk. Ekor di ujung tulang belakang menghilang.",
    motherSensation: "Sering merasa lelah dan mual yang lebih intens.",
    tips: ["Pilih camilan sehat untuk meredakan mual.", "Rutin kontrol ke dokter kandungan."]
  },
  12: {
    week: 12,
    emoji: "🍋",
    size: "5.4 cm",
    weight: "14 gr",
    fruitAnalogy: "Buah Lemon",
    description: "Semua organ utama sudah terbentuk. Janin mulai bisa bergerak meskipun belum terasa.",
    motherSensation: "Mual mulai berkurang (morning sickness biasanya membaik setelah trimester pertama).",
    tips: ["Jaga asupan kalsium.", "Gunakan pelembap untuk mencegah stretch marks."]
  },
  16: {
    week: 16,
    emoji: "🍐",
    size: "11.6 cm",
    weight: "100 gr",
    fruitAnalogy: "Buah Alpukat",
    description: "Mata janin sudah bisa bergerak ke samping dan sistem pencernaan mulai bekerja.",
    motherSensation: "Perut mulai membesar secara signifikan. Mungkin mulai merasakan gerakan lembut (quickening).",
    tips: ["Tidur dengan bantal penyangga.", "Lakukan peregangan ringan."]
  },
  20: {
    week: 20,
    emoji: "🍌",
    size: "25.6 cm",
    weight: "300 gr",
    fruitAnalogy: "Pisang",
    description: "Setengah perjalanan terlewati! Janin sekarang sudah memiliki rambut tipis (lanugo) dan lapisan pelindung kulit (vernix).",
    motherSensation: "Nafsu makan mungkin meningkat. Kaki mungkin mulai sering kram.",
    tips: ["Pastikan asupan zat besi terjaga.", "Banyak minum air putih."]
  },
  24: {
    week: 24,
    emoji: "🌽",
    size: "30 cm",
    weight: "600 gr",
    fruitAnalogy: "Jagung",
    description: "Paru-paru mulai memproduksi surfaktan untuk membantu pernapasan saat lahir nanti.",
    motherSensation: "Mungkin merasa gatal pada area perut karena kulit yang merenggang.",
    tips: ["Hindari berdiri terlalu lama.", "Gunakan sepatu yang nyaman."]
  },
  28: {
    week: 28,
    emoji: "🥬",
    size: "37.6 cm",
    weight: "1 kg",
    fruitAnalogy: "Terong",
    description: "Mata sudah bisa membuka dan berkedip. Janin sudah bisa merespons cahaya dari luar perut.",
    motherSensation: "Mungkin sering merasa sesak napas karena rahim menekan diafragma.",
    tips: ["Mulai siapkan perlengkapan bayi.", "Makan dalam porsi kecil tapi sering."]
  },
  32: {
    week: 32,
    emoji: "🥥",
    size: "42.4 cm",
    weight: "1.7 kg",
    fruitAnalogy: "Blewah",
    description: "Semua organ sudah hampir matang sempurna kecuali paru-paru yang masih butuh sedikit waktu lagi.",
    motherSensation: "Sering buang air kecil karena kepala janin mulai menekan kandung kemih.",
    tips: ["Kurangi asupan kafein.", "Lakukan latihan pernapasan."]
  },
  36: {
    week: 36,
    emoji: "🍈",
    size: "47.4 cm",
    weight: "2.6 kg",
    fruitAnalogy: "Pepaya",
    description: "Janin sudah berada di posisi siap lahir (kepala di bawah). Tubuhnya mulai menumpuk lemak.",
    motherSensation: "Perut terasa sangat kencang dan makin sulit menemukan posisi tidur yang nyaman.",
    tips: ["Siapkan tas rumah sakit.", "Pantau gerakan janin secara rutin."]
  },
  40: {
    week: 40,
    emoji: "🎃",
    size: "51.2 cm",
    weight: "3.5 kg",
    fruitAnalogy: "Semangka Kecil",
    description: "Waktunya bertemu dunia! Semua sistem tubuh siap untuk berfungsi secara independen.",
    motherSensation: "Merasa sangat berat dan mungkin mulai mengalami kontraksi palsu (Braxton Hicks).",
    tips: ["Tetap tenang dan rileks.", "Hubungi kerabat jika mulai merasa tanda persalinan."]
  }
};

export const getWeekInfo = (weekNum: number): JaninWeekInfo => {
  // Find the closest previous defined week in data
  const keys = Object.keys(janinDataList).map(Number).sort((a,b) => a - b);
  let bestKey = keys[0];
  for (const k of keys) {
    if (k <= weekNum) bestKey = k;
    else break;
  }
  return {
    ...janinDataList[bestKey],
    week: weekNum // return the current actual week requested
  };
};
