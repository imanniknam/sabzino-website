export const productCategories = [
  "سبزی‌های خشک",
  "سبزیجات آماده",
  "چاشنی‌ها و سس‌ها",
  "ادویه‌های جهان",
  "نوشیدنی‌های طبیعی",
] as const;

export const catalog = [
  { id: "dried-pepper", name: "گوجه خشک", category: "سبزی‌های خشک", description: "ورقه‌های گوجه خشک؛ مناسب پاستا، سالاد و خوراک", price: 165000, image: "/images/product-1.webp", stock: 24 },
  { id: "kuku-herbs", name: "شنبلیله خشک", category: "سبزی‌های خشک", description: "عطر اصیل شنبلیله برای خورش و ترکیب‌های خانگی", price: 148000, image: "/images/product-2.webp", stock: 30 },
  { id: "ash-herbs", name: "نعناع فلفلی", category: "سبزی‌های خشک", description: "خنک، معطر و مناسب دمنوش، نوشیدنی و آشپزی", price: 152000, image: "/images/product-3.webp", stock: 28 },
  { id: "dolmeh-herbs", name: "ریحان بنفش خشک", category: "سبزی‌های خشک", description: "ریحان بنفش خوش‌رنگ با رایحه‌ای گرم و متفاوت", price: 158000, image: "/images/product-4.webp", stock: 18 },
  { id: "dried-basil", name: "ریحان خشک", category: "سبزی‌های خشک", description: "ریحان خشک معطر برای سس، پاستا و غذاهای روزمره", price: 149000, image: "/images/product-5.webp", stock: 26 },
  { id: "dried-savory", name: "مرزه خشک", category: "سبزی‌های خشک", description: "مرزه خوش‌عطر برای حبوبات، ترشی و خوراک‌های ایرانی", price: 146000, image: "/images/product-6.webp", stock: 21 },
  { id: "fried-onion-sliced", name: "پیاز سرخ‌شده خلالی", category: "سبزیجات آماده", description: "خلال‌های طلایی و آماده برای آش، کشک بادمجان و تزیین غذا", price: 176000, image: "/images/product-7.webp", stock: 19 },
  { id: "fried-onion-majlesi", name: "پیاز سرخ‌شده مجلسی", category: "سبزیجات آماده", description: "پیازداغ خوش‌رنگ و ترد؛ آماده مصرف", price: 182000, image: "/images/product-8.webp", stock: 17 },
  { id: "fried-carrot", name: "هویج سرخ‌شده", category: "سبزیجات آماده", description: "هویج خلالی آماده برای غذاهای مجلسی و ترکیبی", price: 178000, image: "/images/product-9.webp", stock: 16 },
  { id: "green-pepper", name: "ترشی فلفل سبز", category: "چاشنی‌ها و سس‌ها", description: "فلفل سبز و سیر با طعمی تند و زنده", price: 198000, image: "/images/product-10.webp", stock: 20 },
  { id: "seed-seasoning", name: "چاشنی دانه‌دار سبزینو", category: "چاشنی‌ها و سس‌ها", description: "ترکیبی بافت‌دار و متفاوت برای مزه‌پردازی", price: 215000, image: "/images/product-11.webp", stock: 14 },
  { id: "eggplant-pickle", name: "ترشی بادمجان", category: "چاشنی‌ها و سس‌ها", description: "بادمجان دست‌ساز و پرچاشنی با دستور سبزینو", price: 189000, image: "/images/product-12.webp", stock: 15 },
  { id: "red-pepper", name: "سس فلفل قرمز", category: "چاشنی‌ها و سس‌ها", description: "سس فلفل قرمز تند، دانه‌دار و خوش‌طعم", price: 208000, image: "/images/product-13.webp", stock: 22 },
] as const;

export type CatalogProduct = (typeof catalog)[number];
