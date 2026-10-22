// The sample menu: 61 dishes across breakfast, lunch, dinner, tea & coffee and
// desserts, from Indian, Italian, American, Japanese and French kitchens.
// The API's seed script will load this into MongoDB (phase 2).
// Prices are made up for the demo. Translations are AI-drafted.

import { photoCredits } from "./photo-credits";
import type { AddOn, Availability, Category, CategorySlug, Cuisine, Diet, ItemTag, Locale, MenuItem, Variant } from "./types";

export const demoCategories: Category[] = [
  { slug: "breakfast", mealPeriod: "breakfast", sortOrder: 1, name: { en: "Breakfast", hi: "नाश्ता", bn: "সকালের খাবার", mr: "न्याहारी", te: "అల్పాహారం" } },
  { slug: "lunch", mealPeriod: "lunch", sortOrder: 2, name: { en: "Lunch", hi: "दोपहर का खाना", bn: "দুপুরের খাবার", mr: "दुपारचं जेवण", te: "మధ్యాహ్న భోజనం" } },
  { slug: "dinner", mealPeriod: "dinner", sortOrder: 3, name: { en: "Dinner", hi: "रात का खाना", bn: "রাতের খাবার", mr: "रात्रीचं जेवण", te: "రాత్రి భోజనం" } },
  { slug: "tea-coffee", mealPeriod: "allDay", sortOrder: 4, name: { en: "Tea & coffee", hi: "चाय और कॉफ़ी", bn: "চা ও কফি", mr: "चहा आणि कॉफी", te: "టీ & కాఫీ" } },
  { slug: "desserts", mealPeriod: "allDay", sortOrder: 5, name: { en: "Desserts", hi: "मिठाइयां", bn: "মিষ্টি", mr: "गोड पदार्थ", te: "స్వీట్లు" } },
];

const REGULAR_LARGE: Variant[] = [
  { name: { en: "Regular", hi: "रेगुलर", bn: "রেগুলার", mr: "रेग्युलर", te: "రెగ్యులర్" }, priceDelta: 0 },
  { name: { en: "Large", hi: "लार्ज", bn: "লার্জ", mr: "लार्ज", te: "లార్జ్" }, priceDelta: 2000 },
];
const OAT_MILK: AddOn = { name: { en: "Oat milk", hi: "ओट मिल्क", bn: "ওট মিল্ক", mr: "ओट मिल्क", te: "ఓట్ మిల్క్" }, price: 3000 };
const EXTRA_SHOT: AddOn = { name: { en: "Extra shot", hi: "एक्स्ट्रा शॉट", bn: "এক্সট্রা শট", mr: "एक्स्ट्रा शॉट", te: "ఎక్స్‌ట్రా షాట్" }, price: 4000 };
const EXTRA_CHEESE: AddOn = { name: { en: "Extra cheese", hi: "एक्स्ट्रा चीज़", bn: "এক্সট্রা চিজ", mr: "एक्स्ट्रा चीज", te: "ఎక్స్‌ట్రా చీజ్" }, price: 5000 };

type Text = [name: string, description: string];

interface Spec {
  slug: string;
  category: CategorySlug;
  cuisine: Cuisine;
  /** Rupees; stored as paise. */
  price: number;
  diet: Diet;
  when: Availability[];
  alt: string;
  tags?: ItemTag[];
  allergens?: string[];
  spice?: 0 | 1 | 2 | 3;
  variants?: Variant[];
  addOns?: AddOn[];
  featured?: boolean;
}

const order: Partial<Record<CategorySlug, number>> = {};

function dish(s: Spec, t: Record<Locale, Text>): MenuItem {
  order[s.category] = (order[s.category] ?? 0) + 1;
  const pick = (i: 0 | 1) => ({ en: t.en[i], hi: t.hi[i], bn: t.bn[i], mr: t.mr[i], te: t.te[i] });
  return {
    slug: s.slug,
    category: s.category,
    cuisine: s.cuisine,
    name: pick(0),
    description: pick(1),
    price: s.price * 100,
    images: [{ url: `/images/dishes/${s.slug}.jpg`, alt: { en: s.alt }, credit: photoCredits[`dishes/${s.slug}`] }],
    availableIn: s.when,
    diet: s.diet,
    tags: s.tags ?? [],
    allergens: s.allergens ?? [],
    spiceLevel: s.spice ?? 0,
    variants: s.variants ?? [],
    addOns: s.addOns ?? [],
    isAvailable: true,
    isFeatured: s.featured ?? false,
    sortOrder: order[s.category]!,
  };
}

const B: Availability[] = ["breakfast"];
const L: Availability[] = ["lunch"];
const D: Availability[] = ["dinner"];
const LD: Availability[] = ["lunch", "dinner"];
const ALL: Availability[] = ["allDay"];

export const demoMenu: MenuItem[] = [
  // ── Breakfast ───────────────────────────────────────────────
  dish({ slug: "masala-dosa", category: "breakfast", cuisine: "indian", price: 149, diet: "veg", when: B, spice: 1, tags: ["bestseller"], featured: true, alt: "A crisp masala dosa with chutneys and sambar on a steel plate" }, {
    en: ["Masala dosa", "Crisp rice-and-lentil crêpe folded over spiced potato, with coconut chutney and sambar."],
    hi: ["मसाला डोसा", "मसालेदार आलू से भरा कुरकुरा डोसा, नारियल चटनी और सांबर के साथ।"],
    bn: ["মশলা ধোসা", "মশলাদার আলুর পুর দেওয়া মচমচে ধোসা, নারকেলের চাটনি আর সম্বরের সঙ্গে।"],
    mr: ["मसाला डोसा", "मसालेदार बटाट्याची भाजी भरलेला कुरकुरीत डोसा, खोबऱ्याची चटणी आणि सांबारसोबत."],
    te: ["మసాలా దోశ", "కారం బంగాళాదుంప కూర నింపిన కరకరలాడే దోశ, కొబ్బరి చట్నీ, సాంబార్‌తో."],
  }),
  dish({ slug: "idli-sambar", category: "breakfast", cuisine: "indian", price: 119, diet: "vegan", when: B, spice: 1, tags: ["glutenFree"], featured: true, alt: "Steamed idli in a bowl of sambar" }, {
    en: ["Idli sambar", "Three steamed rice cakes with sambar and two chutneys."],
    hi: ["इडली सांबर", "सांबर और दो तरह की चटनी के साथ तीन भाप में पकी इडली।"],
    bn: ["ইডলি সম্বর", "সম্বর আর দু'রকম চাটনির সঙ্গে তিনটি ভাপানো ইডলি।"],
    mr: ["इडली सांबार", "सांबार आणि दोन चटण्यांसोबत तीन वाफवलेल्या इडल्या."],
    te: ["ఇడ్లీ సాంబార్", "సాంబార్, రెండు రకాల చట్నీలతో మూడు ఆవిరి ఇడ్లీలు."],
  }),
  dish({ slug: "kanda-poha", category: "breakfast", cuisine: "indian", price: 99, diet: "vegan", when: B, spice: 1, tags: ["glutenFree"], allergens: ["peanuts"], alt: "Yellow poha with peanuts and a lime wedge on a plate" }, {
    en: ["Kanda poha", "Flattened rice with onion, peanuts, curry leaves and a squeeze of lime."],
    hi: ["कांदा पोहा", "प्याज़, मूंगफली, करी पत्ते और नींबू के साथ पोहा।"],
    bn: ["কান্দা পোহা", "পেঁয়াজ, চিনেবাদাম, কারিপাতা আর লেবু দিয়ে চিঁড়ের পোহা।"],
    mr: ["कांदेपोहे", "कांदा, शेंगदाणे, कढीपत्ता आणि लिंबू पिळलेले पोहे."],
    te: ["ఉల్లి పోహా", "ఉల్లిపాయ, వేరుశనగ, కరివేపాకు, నిమ్మరసంతో అటుకుల పోహా."],
  }),
  dish({ slug: "aloo-paratha", category: "breakfast", cuisine: "indian", price: 139, diet: "veg", when: B, spice: 1, allergens: ["gluten", "milk"], alt: "Aloo paratha with dal, curd and pickle on a white plate" }, {
    en: ["Aloo paratha", "Two whole-wheat flatbreads stuffed with spiced potato, with butter, curd and pickle."],
    hi: ["आलू पराठा", "मसालेदार आलू से भरे दो गेहूं के पराठे, मक्खन, दही और अचार के साथ।"],
    bn: ["আলু পরোটা", "মশলাদার আলুর পুর দেওয়া দুটো আটার পরোটা, মাখন, দই আর আচারের সঙ্গে।"],
    mr: ["आलू पराठा", "मसालेदार बटाटा भरलेले दोन गव्हाचे पराठे, लोणी, दही आणि लोणच्यासोबत."],
    te: ["ఆలూ పరాఠా", "కారం బంగాళాదుంప నింపిన రెండు గోధుమ పరాఠాలు, వెన్న, పెరుగు, ఊరగాయతో."],
  }),
  dish({ slug: "masala-omelette-toast", category: "breakfast", cuisine: "indian", price: 139, diet: "egg", when: B, spice: 1, allergens: ["egg", "gluten", "milk"], alt: "A masala omelette with grilled toast" }, {
    en: ["Masala omelette and toast", "Two-egg omelette with onion, tomato and green chilli, with grilled toast."],
    hi: ["मसाला ऑमलेट और टोस्ट", "प्याज़, टमाटर और हरी मिर्च वाला दो अंडों का ऑमलेट, सिके टोस्ट के साथ।"],
    bn: ["মশলা অমলেট ও টোস্ট", "পেঁয়াজ, টমেটো আর কাঁচালঙ্কা দিয়ে দুটো ডিমের অমলেট, সেঁকা টোস্টের সঙ্গে।"],
    mr: ["मसाला ऑम्लेट आणि टोस्ट", "कांदा, टोमॅटो आणि हिरवी मिरची घातलेलं दोन अंड्यांचं ऑम्लेट, भाजलेल्या टोस्टसोबत."],
    te: ["మసాలా ఆమ్లెట్, టోస్ట్", "ఉల్లి, టమాటా, పచ్చిమిర్చితో రెండు గుడ్ల ఆమ్లెట్, కాల్చిన టోస్ట్‌తో."],
  }),
  dish({ slug: "buttermilk-pancakes", category: "breakfast", cuisine: "american", price: 229, diet: "egg", when: B, tags: ["bestseller"], allergens: ["gluten", "egg", "milk"], alt: "A stack of blueberry pancakes with whipped cream" }, {
    en: ["Blueberry pancakes", "Three fluffy buttermilk pancakes with blueberries, whipped cream and maple syrup."],
    hi: ["ब्लूबेरी पैनकेक", "ब्लूबेरी, व्हिप्ड क्रीम और मेपल सिरप के साथ तीन मुलायम बटरमिल्क पैनकेक।"],
    bn: ["ব্লুবেরি প্যানকেক", "ব্লুবেরি, হুইপড ক্রিম আর মেপল সিরাপ দিয়ে তিনটে নরম বাটারমিল্ক প্যানকেক।"],
    mr: ["ब्लूबेरी पॅनकेक", "ब्लूबेरी, व्हिप्ड क्रीम आणि मेपल सिरपसोबत तीन मऊ बटरमिल्क पॅनकेक."],
    te: ["బ్లూబెర్రీ ప్యాన్‌కేక్స్", "బ్లూబెర్రీలు, విప్డ్ క్రీమ్, మేపుల్ సిరప్‌తో మూడు మెత్తని బటర్‌మిల్క్ ప్యాన్‌కేక్స్."],
  }),
  dish({ slug: "eggs-benedict", category: "breakfast", cuisine: "american", price: 299, diet: "nonVeg", when: B, allergens: ["gluten", "egg", "milk"], alt: "Eggs benedict with hollandaise and roasted tomatoes" }, {
    en: ["Eggs benedict", "Poached eggs and smoked chicken ham on English muffins, with hollandaise."],
    hi: ["एग्स बेनेडिक्ट", "इंग्लिश मफ़िन पर पोच्ड अंडे और स्मोक्ड चिकन हैम, हॉलंडेज़ सॉस के साथ।"],
    bn: ["এগস বেনেডিক্ট", "ইংলিশ মাফিনের ওপর পোচ করা ডিম আর স্মোকড চিকেন হ্যাম, হল্যান্ডেজ সসের সঙ্গে।"],
    mr: ["एग्ज बेनेडिक्ट", "इंग्लिश मफिनवर पोच केलेली अंडी आणि स्मोक्ड चिकन हॅम, हॉलंडेज सॉससोबत."],
    te: ["ఎగ్స్ బెనెడిక్ట్", "ఇంగ్లిష్ మఫిన్లపై పోచ్డ్ గుడ్లు, స్మోక్డ్ చికెన్ హామ్, హాలండేస్ సాస్‌తో."],
  }),
  dish({ slug: "avocado-toast", category: "breakfast", cuisine: "american", price: 279, diet: "vegan", when: B, tags: ["new"], allergens: ["gluten"], alt: "Avocado toast topped with cherry tomatoes and microgreens" }, {
    en: ["Avocado toast", "Smashed avocado on toasted sourdough with cherry tomatoes, chilli flakes and lime."],
    hi: ["एवोकाडो टोस्ट", "सिके सावरडो ब्रेड पर मसला एवोकाडो, चेरी टमाटर, चिली फ़्लेक्स और नींबू।"],
    bn: ["অ্যাভোকাডো টোস্ট", "সেঁকা সাওয়ারডো রুটির ওপর থেঁতো অ্যাভোকাডো, চেরি টমেটো, চিলি ফ্লেক্স আর লেবু।"],
    mr: ["अ‍ॅव्होकॅडो टोस्ट", "भाजलेल्या सावरडो ब्रेडवर कुस्करलेला अ‍ॅव्होकॅडो, चेरी टोमॅटो, चिली फ्लेक्स आणि लिंबू."],
    te: ["అవకాడో టోస్ట్", "కాల్చిన సావర్‌డో బ్రెడ్‌పై మెదిపిన అవకాడో, చెర్రీ టమాటాలు, చిల్లీ ఫ్లేక్స్, నిమ్మ."],
  }),
  dish({ slug: "french-toast", category: "breakfast", cuisine: "french", price: 199, diet: "egg", when: B, allergens: ["gluten", "egg", "milk"], alt: "Thick slices of French toast on a plate" }, {
    en: ["French toast", "Brioche soaked in vanilla custard, pan-fried golden and dusted with cinnamon sugar."],
    hi: ["फ़्रेंच टोस्ट", "वनीला कस्टर्ड में भीगा ब्रियोश, सुनहरा तला और दालचीनी चीनी छिड़का।"],
    bn: ["ফ্রেঞ্চ টোস্ট", "ভ্যানিলা কাস্টার্ডে ভেজানো ব্রিওশ, সোনালি করে ভাজা, দারচিনি-চিনি ছড়ানো।"],
    mr: ["फ्रेंच टोस्ट", "व्हॅनिला कस्टर्डमध्ये भिजवलेला ब्रिओश, सोनेरी परतलेला, दालचिनी साखर भुरभुरलेला."],
    te: ["ఫ్రెంచ్ టోస్ట్", "వెనీలా కస్టర్డ్‌లో నానబెట్టి బంగారు రంగులో వేయించిన బ్రియోష్, దాల్చిన చెక్క చక్కెరతో."],
  }),
  dish({ slug: "butter-croissant", category: "breakfast", cuisine: "french", price: 149, diet: "veg", when: B, allergens: ["gluten", "milk"], alt: "A pile of golden butter croissants" }, {
    en: ["Butter croissant", "Flaky all-butter croissant, baked every morning. Served with jam and butter."],
    hi: ["बटर क्रोसां", "रोज़ सुबह बेक होने वाला परतदार बटर क्रोसां, जैम और मक्खन के साथ।"],
    bn: ["বাটার ক্রোয়াসাঁ", "প্রতিদিন সকালে বেক করা স্তরে স্তরে মাখনের ক্রোয়াসাঁ, জ্যাম আর মাখনের সঙ্গে।"],
    mr: ["बटर क्रोसाँ", "रोज सकाळी भाजलेलं पापुद्रेदार बटर क्रोसाँ, जॅम आणि लोण्यासोबत."],
    te: ["బటర్ క్రోయిసాంట్", "ప్రతి ఉదయం బేక్ చేసే పొరలు పొరల వెన్న క్రోయిసాంట్, జామ్, వెన్నతో."],
  }),
  dish({ slug: "pain-au-chocolat", category: "breakfast", cuisine: "french", price: 169, diet: "veg", when: B, allergens: ["gluten", "milk", "soy"], alt: "A pain au chocolat on a table" }, {
    en: ["Pain au chocolat", "Croissant pastry rolled around two bars of dark chocolate."],
    hi: ["पैं ओ शोकोला", "डार्क चॉकलेट की दो पट्टियों के चारों ओर लिपटी क्रोसां पेस्ट्री।"],
    bn: ["প্যাঁ ও শোকোলা", "দুটো ডার্ক চকোলেটের কাঠি ঘিরে মোড়া ক্রোয়াসাঁ পেস্ট্রি।"],
    mr: ["पॅं ओ शोकोला", "डार्क चॉकलेटच्या दोन पट्ट्यांभोवती गुंडाळलेली क्रोसाँ पेस्ट्री."],
    te: ["పాన్ ఓ షాకొలా", "రెండు డార్క్ చాక్లెట్ ముక్కల చుట్టూ చుట్టిన క్రోయిసాంట్ పేస్ట్రీ."],
  }),
  dish({ slug: "spinach-frittata", category: "breakfast", cuisine: "italian", price: 219, diet: "egg", when: B, tags: ["glutenFree"], allergens: ["egg", "milk"], alt: "A slice of vegetable frittata on a grey plate" }, {
    en: ["Spinach frittata", "Baked Italian omelette with spinach, peppers and parmesan, with a side salad."],
    hi: ["पालक फ़्रिटाटा", "पालक, शिमला मिर्च और पार्मेज़ान वाला बेक्ड इतालवी ऑमलेट, सलाद के साथ।"],
    bn: ["পালং ফ্রিটাটা", "পালং, ক্যাপসিকাম আর পারমেজান দিয়ে বেক করা ইতালীয় অমলেট, সালাদের সঙ্গে।"],
    mr: ["पालक फ्रिटाटा", "पालक, ढोबळी मिरची आणि पार्मेझानसह बेक केलेलं इटालियन ऑम्लेट, सॅलडसोबत."],
    te: ["పాలకూర ఫ్రిటాటా", "పాలకూర, క్యాప్సికమ్, పార్మెజాన్‌తో బేక్ చేసిన ఇటాలియన్ ఆమ్లెట్, సలాడ్‌తో."],
  }),
  dish({ slug: "japanese-breakfast", category: "breakfast", cuisine: "japanese", price: 399, diet: "nonVeg", when: B, tags: ["chefSpecial"], allergens: ["fish", "soy", "gluten"], alt: "A Japanese set meal with grilled salmon, rice, tofu and miso soup on a tray" }, {
    en: ["Japanese breakfast set", "Grilled salmon, steamed rice, miso soup, chilled tofu and pickles on one tray."],
    hi: ["जापानी नाश्ता सेट", "एक ट्रे में ग्रिल्ड सैल्मन, चावल, मिसो सूप, ठंडा टोफ़ू और अचार।"],
    bn: ["জাপানি ব্রেকফাস্ট সেট", "এক ট্রেতে গ্রিল করা স্যামন, ভাত, মিসো স্যুপ, ঠান্ডা টোফু আর আচার।"],
    mr: ["जपानी न्याहारी सेट", "एका ट्रेमध्ये ग्रिल्ड सॅल्मन, भात, मिसो सूप, थंड टोफू आणि लोणचं."],
    te: ["జపనీస్ బ్రేక్‌ఫాస్ట్ సెట్", "ఒకే ట్రేలో గ్రిల్డ్ సాల్మన్, అన్నం, మిసో సూప్, చల్లని టోఫు, ఊరగాయలు."],
  }),
  dish({ slug: "tamagoyaki", category: "breakfast", cuisine: "japanese", price: 189, diet: "egg", when: B, allergens: ["egg", "soy"], alt: "Slices of rolled Japanese omelette on a plate with rice" }, {
    en: ["Tamagoyaki", "Sweet-savoury rolled Japanese omelette, with grated radish and soy."],
    hi: ["तामागोयाकी", "मीठा-नमकीन रोल किया जापानी ऑमलेट, कद्दूकस मूली और सोया के साथ।"],
    bn: ["তামাগোইয়াকি", "মিষ্টি-নোনতা গোটানো জাপানি অমলেট, মুলো কোরা আর সয়ার সঙ্গে।"],
    mr: ["तामागोयाकी", "गोड-खारट गुंडाळलेलं जपानी ऑम्लेट, किसलेला मुळा आणि सोयासोबत."],
    te: ["తమగోయాకి", "తీపి-ఉప్పు రుచి చుట్టిన జపనీస్ ఆమ్లెట్, తురిమిన ముల్లంగి, సోయాతో."],
  }),
  dish({ slug: "onigiri", category: "breakfast", cuisine: "japanese", price: 159, diet: "vegan", when: B, tags: ["glutenFree"], allergens: ["soy"], alt: "Two rice balls wrapped in nori" }, {
    en: ["Onigiri pair", "Two rice balls wrapped in nori, one with pickled plum and one with kombu."],
    hi: ["ओनिगिरी जोड़ी", "नोरी में लिपटे चावल के दो गोले, एक में अचारी आलूबुखारा और एक में कोम्बु।"],
    bn: ["ওনিগিরি জোড়া", "নোরিতে মোড়া দুটো ভাতের বল, একটায় আচারি কুল, অন্যটায় কোম্বু।"],
    mr: ["ओनिगिरी जोडी", "नोरीत गुंडाळलेले भाताचे दोन गोळे, एकात लोणच्याचा आलुबुखार, एकात कोम्बू."],
    te: ["ఒనిగిరి జంట", "నోరీలో చుట్టిన రెండు అన్నం ఉండలు, ఒకదాంట్లో ఊరబెట్టిన ప్లమ్, మరోదాంట్లో కొంబు."],
  }),

  // ── Lunch ───────────────────────────────────────────────────
  dish({ slug: "bengali-thali", category: "lunch", cuisine: "indian", price: 329, diet: "egg", when: L, spice: 1, tags: ["chefSpecial"], allergens: ["gluten", "milk", "egg"], featured: true, alt: "A brass thali with rice, pulao, luchi, dal, egg curry, paneer, aloo dum and rosogolla" }, {
    en: ["Bengali lunch thali", "Rice, pulao, luchi, dal, aloo dum, paneer curry, egg curry, fritters and rosogolla."],
    hi: ["बंगाली थाली", "चावल, पुलाव, लूची, दाल, आलू दम, पनीर करी, अंडा करी, पकौड़े और रसगुल्ला।"],
    bn: ["বাঙালি থালি", "ভাত, পোলাও, লুচি, ডাল, আলুর দম, পনির, ডিমের ঝোল, ভাজা আর রসগোল্লা।"],
    mr: ["बंगाली थाळी", "भात, पुलाव, लुची, डाळ, आलू दम, पनीर करी, अंडा करी, भजी आणि रसगुल्ला."],
    te: ["బెంగాలీ థాలీ", "అన్నం, పులావ్, లూచీ, పప్పు, ఆలూ దమ్, పనీర్ కూర, గుడ్డు కూర, బజ్జీలు, రసగుల్లా."],
  }),
  dish({ slug: "chicken-dum-biryani", category: "lunch", cuisine: "indian", price: 299, diet: "nonVeg", when: LD, spice: 2, tags: ["bestseller"], allergens: ["milk", "nuts"], featured: true, alt: "Chicken biryani topped with cashews and fried onion" }, {
    en: ["Chicken dum biryani", "Basmati rice and chicken slow-cooked in a sealed pot, with fried onion and cashews. Served with raita."],
    hi: ["चिकन दम बिरयानी", "बंद हांडी में धीमी आंच पर पके बासमती चावल और चिकन, तले प्याज़ और काजू के साथ। रायता साथ में।"],
    bn: ["চিকেন দম বিরিয়ানি", "মুখবন্ধ হাঁড়িতে ঢিমে আঁচে রান্না বাসমতী চাল আর চিকেন, ভাজা পেঁয়াজ ও কাজু দিয়ে। সঙ্গে রায়তা।"],
    mr: ["चिकन दम बिर्याणी", "बंद हंडीत मंद आचेवर शिजवलेला बासमती भात आणि चिकन, तळलेला कांदा आणि काजूसह. सोबत रायता."],
    te: ["చికెన్ దమ్ బిర్యానీ", "మూత పెట్టిన కుండలో నెమ్మదిగా ఉడికిన బాస్మతి బియ్యం, చికెన్; వేయించిన ఉల్లి, జీడిపప్పుతో. రైతాతో."],
  }),
  dish({ slug: "rajma-chawal", category: "lunch", cuisine: "indian", price: 199, diet: "veg", when: L, spice: 1, tags: ["glutenFree"], alt: "Rajma curry and white rice on a steel plate" }, {
    en: ["Rajma chawal", "Kidney beans simmered in an onion-tomato gravy, with steamed rice."],
    hi: ["राजमा चावल", "प्याज़-टमाटर की तरी में पका राजमा, उबले चावल के साथ।"],
    bn: ["রাজমা চাওল", "পেঁয়াজ-টমেটোর ঝোলে রান্না রাজমা, সাদা ভাতের সঙ্গে।"],
    mr: ["राजमा चावल", "कांदा-टोमॅटोच्या ग्रेव्हीत शिजवलेला राजमा, वाफाळत्या भातासोबत."],
    te: ["రాజ్మా చావల్", "ఉల్లి-టమాటా గ్రేవీలో ఉడికిన రాజ్మా, అన్నంతో."],
  }),
  dish({ slug: "chole-bhature", category: "lunch", cuisine: "indian", price: 219, diet: "veg", when: L, spice: 2, tags: ["bestseller"], allergens: ["gluten", "milk"], alt: "Two puffed bhature with a bowl of chole and sliced onion" }, {
    en: ["Chole bhature", "Spiced chickpea curry with two puffed, fried breads, onion and pickle."],
    hi: ["छोले भटूरे", "मसालेदार छोले, दो फूले हुए भटूरे, प्याज़ और अचार के साथ।"],
    bn: ["ছোলে ভাটুরে", "মশলাদার ছোলার তরকারি, দুটো ফোলা ভাটুরে, পেঁয়াজ আর আচারের সঙ্গে।"],
    mr: ["छोले भटुरे", "मसालेदार छोले, दोन फुगलेले भटुरे, कांदा आणि लोणच्यासोबत."],
    te: ["చోలే భటూరే", "కారం శనగల కూర, రెండు ఉబ్బిన భటూరేలు, ఉల్లి, ఊరగాయతో."],
  }),
  dish({ slug: "pav-bhaji", category: "lunch", cuisine: "indian", price: 189, diet: "veg", when: L, spice: 2, allergens: ["gluten", "milk"], alt: "Pav bhaji with buttered buns and chopped onion on a steel tray" }, {
    en: ["Pav bhaji", "Buttery mashed-vegetable curry with toasted pav, onion and lime. A Mumbai classic."],
    hi: ["पाव भाजी", "मक्खन वाली मसली सब्ज़ियों की भाजी, सिके पाव, प्याज़ और नींबू के साथ। मुंबई की ख़ास।"],
    bn: ["পাও ভাজি", "মাখন দেওয়া থেঁতো সবজির ভাজি, সেঁকা পাও, পেঁয়াজ আর লেবুর সঙ্গে। মুম্বইয়ের বিখ্যাত পদ।"],
    mr: ["पावभाजी", "बटरमधली कुस्करलेल्या भाज्यांची भाजी, भाजलेले पाव, कांदा आणि लिंबू. अस्सल मुंबईची."],
    te: ["పావ్ భాజీ", "వెన్నతో మెదిపిన కూరగాయల భాజీ, కాల్చిన పావ్, ఉల్లి, నిమ్మతో. ముంబై స్పెషల్."],
  }),
  dish({ slug: "margherita-pizza", category: "lunch", cuisine: "italian", price: 349, diet: "veg", when: LD, tags: ["bestseller"], allergens: ["gluten", "milk"], addOns: [EXTRA_CHEESE], alt: "A Neapolitan margherita pizza with blistered crust" }, {
    en: ["Margherita pizza", "Wood-fired base with San Marzano tomato, fresh mozzarella and basil."],
    hi: ["मार्गेरिटा पिज़्ज़ा", "लकड़ी की आंच में सिका बेस, टमाटर सॉस, ताज़ा मोत्ज़ारेला और तुलसी।"],
    bn: ["মার্গারিটা পিৎজা", "কাঠের আঁচে সেঁকা বেস, টমেটো সস, টাটকা মোজারেলা আর বেসিল।"],
    mr: ["मार्गारिटा पिझ्झा", "लाकडाच्या भट्टीत भाजलेला बेस, टोमॅटो सॉस, ताजं मोझरेला आणि तुळस."],
    te: ["మార్గరీటా పిజ్జా", "కట్టెల పొయ్యిలో కాల్చిన బేస్, టమాటా సాస్, తాజా మొజరెల్లా, తులసి."],
  }),
  dish({ slug: "penne-arrabbiata", category: "lunch", cuisine: "italian", price: 299, diet: "vegan", when: L, spice: 2, allergens: ["gluten"], alt: "Penne in a red arrabbiata sauce" }, {
    en: ["Penne arrabbiata", "Penne in a fiery tomato, garlic and chilli sauce, finished with olive oil and parsley."],
    hi: ["पेने अराबियाता", "तीखी टमाटर, लहसुन और मिर्च की सॉस में पेने, जैतून तेल और पार्सले के साथ।"],
    bn: ["পেনে আরাবিয়াতা", "ঝাল টমেটো, রসুন আর লঙ্কার সসে পেনে, অলিভ অয়েল আর পার্সলে দিয়ে।"],
    mr: ["पेने अराबियाटा", "तिखट टोमॅटो, लसूण आणि मिरचीच्या सॉसमध्ये पेने, ऑलिव्ह तेल आणि पार्सलीसह."],
    te: ["పెన్నే అరాబియాటా", "కారమైన టమాటా, వెల్లుల్లి, మిర్చి సాస్‌లో పెన్నే, ఆలివ్ నూనె, పార్స్లీతో."],
  }),
  dish({ slug: "caprese-panini", category: "lunch", cuisine: "italian", price: 259, diet: "veg", when: L, allergens: ["gluten", "milk"], alt: "A focaccia sandwich with mozzarella and greens" }, {
    en: ["Caprese focaccia sandwich", "Fresh mozzarella, tomato, basil pesto and rocket in warm focaccia."],
    hi: ["कैप्रेज़े फ़ोकाचा सैंडविच", "गर्म फ़ोकाचा में ताज़ा मोत्ज़ारेला, टमाटर, बेसिल पेस्तो और रॉकेट पत्ते।"],
    bn: ["ক্যাপ্রেসে ফোকাচ্চা স্যান্ডউইচ", "গরম ফোকাচ্চায় টাটকা মোজারেলা, টমেটো, বেসিল পেস্তো আর রকেট পাতা।"],
    mr: ["कॅप्रेसे फोकाचिया सँडविच", "गरम फोकाचियामध्ये ताजं मोझरेला, टोमॅटो, बेसिल पेस्तो आणि रॉकेट पानं."],
    te: ["కాప్రేసే ఫొకాచియా శాండ్‌విచ్", "వేడి ఫొకాచియాలో తాజా మొజరెల్లా, టమాటా, బేసిల్ పెస్టో, రాకెట్ ఆకులు."],
  }),
  dish({ slug: "classic-cheeseburger", category: "lunch", cuisine: "american", price: 329, diet: "nonVeg", when: LD, allergens: ["gluten", "milk", "egg"], addOns: [EXTRA_CHEESE], alt: "A cheeseburger with lettuce in a sesame bun" }, {
    en: ["Classic cheeseburger", "Grilled chicken patty, cheddar, lettuce, pickles and house sauce in a sesame bun. Fries on the side."],
    hi: ["क्लासिक चीज़बर्गर", "तिल वाले बन में ग्रिल्ड चिकन पैटी, चेडर, लेट्यूस, अचार और हाउस सॉस। साथ में फ़्राइज़।"],
    bn: ["ক্লাসিক চিজবার্গার", "তিলের বানে গ্রিল করা চিকেন প্যাটি, চেডার, লেটুস, আচার আর হাউস সস। সঙ্গে ফ্রাই।"],
    mr: ["क्लासिक चीजबर्गर", "तिळाच्या बनमध्ये ग्रिल्ड चिकन पॅटी, चेडर, लेट्यूस, लोणचं आणि हाउस सॉस. सोबत फ्राइज."],
    te: ["క్లాసిక్ చీజ్‌బర్గర్", "నువ్వుల బన్‌లో గ్రిల్డ్ చికెన్ ప్యాటీ, చెడ్డార్, లెట్యూస్, ఊరగాయ, హౌస్ సాస్. పక్కన ఫ్రైస్."],
  }),
  dish({ slug: "club-sandwich", category: "lunch", cuisine: "american", price: 289, diet: "nonVeg", when: L, allergens: ["gluten", "egg"], alt: "Club sandwich quarters held with skewers" }, {
    en: ["Club sandwich", "Triple-decker toast with roast chicken, egg, lettuce, tomato and mayonnaise."],
    hi: ["क्लब सैंडविच", "तीन परतों वाला टोस्ट, रोस्ट चिकन, अंडा, लेट्यूस, टमाटर और मेयोनीज़ के साथ।"],
    bn: ["ক্লাব স্যান্ডউইচ", "তিন তলা টোস্টে রোস্ট চিকেন, ডিম, লেটুস, টমেটো আর মেয়োনিজ।"],
    mr: ["क्लब सँडविच", "तीन थरांच्या टोस्टमध्ये रोस्ट चिकन, अंडं, लेट्यूस, टोमॅटो आणि मेयोनीज."],
    te: ["క్లబ్ శాండ్‌విచ్", "మూడు పొరల టోస్ట్‌లో రోస్ట్ చికెన్, గుడ్డు, లెట్యూస్, టమాటా, మయోనీస్."],
  }),
  dish({ slug: "caesar-salad", category: "lunch", cuisine: "american", price: 279, diet: "nonVeg", when: LD, allergens: ["gluten", "milk", "egg", "fish"], alt: "Caesar salad with croutons and parmesan" }, {
    en: ["Chicken Caesar salad", "Romaine, grilled chicken, garlic croutons and parmesan in a creamy Caesar dressing."],
    hi: ["चिकन सीज़र सलाद", "रोमेन लेट्यूस, ग्रिल्ड चिकन, लहसुन क्रूटॉन और पार्मेज़ान, क्रीमी सीज़र ड्रेसिंग में।"],
    bn: ["চিকেন সিজার সালাদ", "রোমেন লেটুস, গ্রিল করা চিকেন, রসুন ক্রুটন আর পারমেজান, ক্রিমি সিজার ড্রেসিংয়ে।"],
    mr: ["चिकन सीझर सॅलड", "रोमेन लेट्यूस, ग्रिल्ड चिकन, लसूण क्रूटॉन आणि पार्मेझान, क्रीमी सीझर ड्रेसिंगमध्ये."],
    te: ["చికెన్ సీజర్ సలాడ్", "రోమేన్ లెట్యూస్, గ్రిల్డ్ చికెన్, వెల్లుల్లి క్రూటాన్లు, పార్మెజాన్; క్రీమీ సీజర్ డ్రెస్సింగ్‌లో."],
  }),
  dish({ slug: "mac-and-cheese", category: "lunch", cuisine: "american", price: 259, diet: "veg", when: L, allergens: ["gluten", "milk"], alt: "A bowl of baked macaroni and cheese" }, {
    en: ["Mac and cheese", "Macaroni baked in a three-cheese sauce under a crisp breadcrumb top."],
    hi: ["मैक एंड चीज़", "तीन तरह की चीज़ सॉस में बेक की मैकरोनी, ऊपर कुरकुरी ब्रेडक्रम्ब परत।"],
    bn: ["ম্যাক অ্যান্ড চিজ", "তিন রকম চিজের সসে বেক করা ম্যাকারনি, ওপরে মচমচে ব্রেডক্রাম্ব।"],
    mr: ["मॅक अँड चीज", "तीन प्रकारच्या चीज सॉसमध्ये बेक केलेली मॅकरोनी, वर कुरकुरीत ब्रेडक्रम्ब."],
    te: ["మ్యాక్ అండ్ చీజ్", "మూడు రకాల చీజ్ సాస్‌లో బేక్ చేసిన మాకరోనీ, పైన కరకరలాడే బ్రెడ్‌క్రంబ్స్."],
  }),
  dish({ slug: "chicken-katsu-curry", category: "lunch", cuisine: "japanese", price: 379, diet: "nonVeg", when: L, spice: 1, tags: ["bestseller"], allergens: ["gluten", "egg", "soy"], alt: "Japanese curry with a breaded cutlet and rice" }, {
    en: ["Chicken katsu curry", "Panko-crumbed chicken cutlet on rice with mild, sweet Japanese curry sauce."],
    hi: ["चिकन कात्सु करी", "पैंको में लिपटा चिकन कटलेट चावल पर, हल्की मीठी जापानी करी सॉस के साथ।"],
    bn: ["চিকেন কাৎসু কারি", "প্যাঙ্কো মাখানো চিকেন কাটলেট ভাতের ওপর, হালকা মিষ্টি জাপানি কারি সসের সঙ্গে।"],
    mr: ["चिकन कात्सू करी", "पँको लावलेलं चिकन कटलेट भातावर, सौम्य गोडसर जपानी करी सॉससोबत."],
    te: ["చికెన్ కట్సు కర్రీ", "అన్నంపై పాంకో చికెన్ కట్‌లెట్, తేలికపాటి తీపి జపనీస్ కర్రీ సాస్‌తో."],
  }),
  dish({ slug: "veg-gyoza", category: "lunch", cuisine: "japanese", price: 249, diet: "vegan", when: LD, allergens: ["gluten", "soy"], alt: "A plate of pan-fried gyoza dumplings" }, {
    en: ["Vegetable gyoza", "Eight pan-fried dumplings filled with cabbage, mushroom and ginger, with chilli-soy dip."],
    hi: ["वेज ग्योज़ा", "पत्तागोभी, मशरूम और अदरक से भरे आठ तवे पर सिके डंपलिंग, चिली-सोया डिप के साथ।"],
    bn: ["ভেজ গিয়োজা", "বাঁধাকপি, মাশরুম আর আদার পুর দেওয়া আটটা তাওয়ায় সেঁকা ডাম্পলিং, চিলি-সয়া ডিপের সঙ্গে।"],
    mr: ["व्हेज ग्योझा", "कोबी, मशरूम आणि आल्याचं सारण भरलेले आठ तव्यावर भाजलेले डंपलिंग, चिली-सोया डिपसोबत."],
    te: ["వెజ్ గ్యోజా", "క్యాబేజీ, పుట్టగొడుగు, అల్లం నింపిన ఎనిమిది పెనంపై వేయించిన డంప్లింగ్స్, చిల్లీ-సోయా డిప్‌తో."],
  }),
  dish({ slug: "croque-monsieur", category: "lunch", cuisine: "french", price: 299, diet: "nonVeg", when: L, allergens: ["gluten", "milk"], alt: "A croque monsieur with a side salad" }, {
    en: ["Croque monsieur", "Toasted sandwich of chicken ham and gruyère under bubbling béchamel."],
    hi: ["क्रोक मॉस्यो", "चिकन हैम और ग्रुयेर चीज़ का टोस्टेड सैंडविच, ऊपर उबलती बेशामेल सॉस।"],
    bn: ["ক্রোক মঁসিয়ে", "চিকেন হ্যাম আর গ্রুয়েরের টোস্ট করা স্যান্ডউইচ, ওপরে ফুটন্ত বেশামেল।"],
    mr: ["क्रोक मॉन्स्यू", "चिकन हॅम आणि ग्रुयेरचं टोस्टेड सँडविच, वर उकळतं बेशामेल."],
    te: ["క్రోక్ మోస్యూ", "చికెన్ హామ్, గ్రూయేర్ చీజ్ టోస్టెడ్ శాండ్‌విచ్, పైన బెషామెల్ సాస్."],
  }),
  dish({ slug: "quiche-lorraine", category: "lunch", cuisine: "french", price: 279, diet: "nonVeg", when: L, allergens: ["gluten", "milk", "egg"], alt: "A slice of quiche lorraine with salad" }, {
    en: ["Quiche lorraine", "Buttery pastry filled with egg custard, smoked chicken and gruyère, with a green salad."],
    hi: ["कीश लॉरेन", "मक्खनी पेस्ट्री में अंडे का कस्टर्ड, स्मोक्ड चिकन और ग्रुयेर, हरी सलाद के साथ।"],
    bn: ["কিশ লরেন", "মাখনের পেস্ট্রিতে ডিমের কাস্টার্ড, স্মোকড চিকেন আর গ্রুয়েরের পুর, সবুজ সালাদের সঙ্গে।"],
    mr: ["कीश लॉरेन", "लोण्याच्या पेस्ट्रीत अंड्याचं कस्टर्ड, स्मोक्ड चिकन आणि ग्रुयेर, हिरव्या सॅलडसोबत."],
    te: ["కీష్ లొరేన్", "వెన్న పేస్ట్రీలో గుడ్డు కస్టర్డ్, స్మోక్డ్ చికెన్, గ్రూయేర్; పచ్చి సలాడ్‌తో."],
  }),

  // ── Dinner ──────────────────────────────────────────────────
  dish({ slug: "butter-chicken-naan", category: "dinner", cuisine: "indian", price: 349, diet: "nonVeg", when: D, spice: 1, tags: ["chefSpecial"], allergens: ["milk", "gluten"], featured: true, alt: "Butter chicken in a copper kadai with garlic naan" }, {
    en: ["Butter chicken with garlic naan", "Tandoori chicken in a tomato, butter and cream sauce, with two garlic naans."],
    hi: ["बटर चिकन, गार्लिक नान", "टमाटर, मक्खन और क्रीम की ग्रेवी में तंदूरी चिकन, दो गार्लिक नान के साथ।"],
    bn: ["বাটার চিকেন ও গার্লিক নান", "টমেটো, মাখন আর ক্রিমের গ্রেভিতে তন্দুরি চিকেন, দুটো গার্লিক নানের সঙ্গে।"],
    mr: ["बटर चिकन आणि गार्लिक नान", "टोमॅटो, बटर आणि क्रीमच्या ग्रेव्हीत तंदुरी चिकन, दोन गार्लिक नानसोबत."],
    te: ["బటర్ చికెన్, గార్లిక్ నాన్", "టమాటా, వెన్న, క్రీమ్ గ్రేవీలో తందూరి చికెన్, రెండు గార్లిక్ నాన్‌లతో."],
  }),
  dish({ slug: "paneer-tikka", category: "dinner", cuisine: "indian", price: 269, diet: "veg", when: D, spice: 2, tags: ["glutenFree"], allergens: ["milk"], alt: "Charred paneer tikka on a banana leaf" }, {
    en: ["Paneer tikka", "Paneer, peppers and onion marinated in spiced yoghurt and charred in the tandoor."],
    hi: ["पनीर टिक्का", "मसालेदार दही में मैरिनेट किया पनीर, शिमला मिर्च और प्याज़, तंदूर में सिका हुआ।"],
    bn: ["পনির টিক্কা", "মশলাদার দইয়ে মাখানো পনির, ক্যাপসিকাম আর পেঁয়াজ, তন্দুরে সেঁকা।"],
    mr: ["पनीर टिक्का", "मसालेदार दह्यात मुरवलेलं पनीर, ढोबळी मिरची आणि कांदा, तंदूरमध्ये भाजलेलं."],
    te: ["పనీర్ టిక్కా", "కారం పెరుగులో నానబెట్టిన పనీర్, క్యాప్సికమ్, ఉల్లి; తందూర్‌లో కాల్చినవి."],
  }),
  dish({ slug: "dal-makhani", category: "dinner", cuisine: "indian", price: 229, diet: "veg", when: D, tags: ["glutenFree"], allergens: ["milk"], alt: "Dal makhani with a swirl of cream in a copper bowl" }, {
    en: ["Dal makhani", "Black lentils cooked overnight with butter and cream. Best with naan or rice."],
    hi: ["दाल मखनी", "रात भर धीमी आंच पर मक्खन और क्रीम के साथ पकी काली दाल। नान या चावल के साथ।"],
    bn: ["ডাল মাখানি", "সারা রাত ধরে মাখন আর ক্রিম দিয়ে রান্না কালো ডাল। নান বা ভাতের সঙ্গে।"],
    mr: ["दाल मखनी", "रात्रभर बटर आणि क्रीमसह शिजवलेली उडदाची डाळ. नान किंवा भातासोबत."],
    te: ["దాల్ మఖనీ", "రాత్రంతా వెన్న, క్రీమ్‌తో ఉడికించిన మినప్పప్పు. నాన్ లేదా అన్నంతో."],
  }),
  dish({ slug: "palak-paneer", category: "dinner", cuisine: "indian", price: 259, diet: "veg", when: D, spice: 1, tags: ["glutenFree"], allergens: ["milk"], alt: "A bowl of palak paneer" }, {
    en: ["Palak paneer", "Cubes of paneer in a smooth spinach gravy with garlic and a touch of cream."],
    hi: ["पालक पनीर", "लहसुन और थोड़ी क्रीम वाली मुलायम पालक ग्रेवी में पनीर के टुकड़े।"],
    bn: ["পালং পনির", "রসুন আর একটু ক্রিম দেওয়া মসৃণ পালংয়ের গ্রেভিতে পনিরের টুকরো।"],
    mr: ["पालक पनीर", "लसूण आणि थोडं क्रीम घातलेल्या मऊ पालक ग्रेव्हीत पनीरचे तुकडे."],
    te: ["పాలక్ పనీర్", "వెల్లుల్లి, కొద్దిగా క్రీమ్ వేసిన మెత్తని పాలకూర గ్రేవీలో పనీర్ ముక్కలు."],
  }),
  dish({ slug: "rogan-josh", category: "dinner", cuisine: "indian", price: 429, diet: "nonVeg", when: D, spice: 2, tags: ["glutenFree"], allergens: ["milk"], alt: "Mutton rogan josh in a white bowl" }, {
    en: ["Mutton rogan josh", "Kashmiri slow-braised mutton in a red chilli, fennel and yoghurt gravy."],
    hi: ["मटन रोगन जोश", "लाल मिर्च, सौंफ और दही की ग्रेवी में धीमी आंच पर पका कश्मीरी मटन।"],
    bn: ["মাটন রোগান জোশ", "লাল লঙ্কা, মৌরি আর দইয়ের গ্রেভিতে ঢিমে আঁচে রান্না কাশ্মীরি মাটন।"],
    mr: ["मटण रोगन जोश", "लाल मिरची, बडीशेप आणि दह्याच्या ग्रेव्हीत मंद आचेवर शिजवलेलं काश्मिरी मटण."],
    te: ["మటన్ రోగన్ జోష్", "ఎర్ర మిరప, సోంపు, పెరుగు గ్రేవీలో నెమ్మదిగా ఉడికించిన కాశ్మీరీ మటన్."],
  }),
  dish({ slug: "mushroom-risotto", category: "dinner", cuisine: "italian", price: 389, diet: "veg", when: D, tags: ["glutenFree"], allergens: ["milk"], alt: "Mushroom risotto in a blue bowl" }, {
    en: ["Wild mushroom risotto", "Arborio rice stirred with mushrooms, white wine, butter and parmesan."],
    hi: ["मशरूम रिज़ोटो", "मशरूम, व्हाइट वाइन, मक्खन और पार्मेज़ान के साथ पकाया आर्बोरियो चावल।"],
    bn: ["মাশরুম রিসোত্তো", "মাশরুম, হোয়াইট ওয়াইন, মাখন আর পারমেজান দিয়ে নেড়ে রাঁধা আরবোরিও চাল।"],
    mr: ["मशरूम रिसोटो", "मशरूम, व्हाइट वाइन, बटर आणि पार्मेझानसह ढवळून शिजवलेला आर्बोरियो भात."],
    te: ["మష్రూమ్ రిసోటో", "పుట్టగొడుగులు, వైట్ వైన్, వెన్న, పార్మెజాన్‌తో కలిపి వండిన ఆర్బోరియో బియ్యం."],
  }),
  dish({ slug: "lasagna", category: "dinner", cuisine: "italian", price: 419, diet: "nonVeg", when: D, allergens: ["gluten", "milk", "egg"], alt: "A square of lasagna with melted cheese on a white plate" }, {
    en: ["Lasagna bolognese", "Layers of fresh pasta, slow-cooked lamb ragù, béchamel and mozzarella."],
    hi: ["लज़ान्या बोलोन्येज़", "ताज़ा पास्ता की परतें, धीमी आंच पर पका मटन रागू, बेशामेल और मोत्ज़ारेला।"],
    bn: ["লাজানিয়া বোলোনিজ", "টাটকা পাস্তার স্তর, ঢিমে আঁচে রাঁধা ভেড়ার মাংসের রাগু, বেশামেল আর মোজারেলা।"],
    mr: ["लझान्या बोलोनेज", "ताज्या पास्त्याचे थर, मंद आचेवर शिजवलेला मटण रागू, बेशामेल आणि मोझरेला."],
    te: ["లజానియా బొలొనీస్", "తాజా పాస్తా పొరలు, నెమ్మదిగా వండిన మటన్ రాగూ, బెషామెల్, మొజరెల్లా."],
  }),
  dish({ slug: "spaghetti-carbonara", category: "dinner", cuisine: "italian", price: 379, diet: "nonVeg", when: D, allergens: ["gluten", "milk", "egg"], alt: "Spaghetti carbonara on a black plate" }, {
    en: ["Spaghetti carbonara", "Spaghetti tossed with egg yolk, pecorino, black pepper and crisp chicken bacon."],
    hi: ["स्पैगेटी कार्बोनारा", "अंडे की ज़र्दी, पेकोरिनो, काली मिर्च और कुरकुरे चिकन बेकन के साथ स्पैगेटी।"],
    bn: ["স্প্যাগেটি কার্বোনারা", "ডিমের কুসুম, পেকোরিনো, গোলমরিচ আর মচমচে চিকেন বেকনে মাখানো স্প্যাগেটি।"],
    mr: ["स्पॅगेटी कार्बोनारा", "अंड्याचा बलक, पेकोरिनो, काळी मिरी आणि कुरकुरीत चिकन बेकनसह स्पॅगेटी."],
    te: ["స్పగెట్టీ కార్బొనారా", "గుడ్డు సొన, పెకొరినో, మిరియాలు, కరకరలాడే చికెన్ బేకన్‌తో కలిపిన స్పగెట్టీ."],
  }),
  dish({ slug: "bbq-wings", category: "dinner", cuisine: "american", price: 329, diet: "nonVeg", when: D, spice: 2, tags: ["glutenFree"], allergens: ["milk"], alt: "Glazed barbecue chicken wings with crinkle-cut fries" }, {
    en: ["Smoky BBQ wings", "Ten chicken wings glazed in smoky barbecue sauce, with fries and ranch dip."],
    hi: ["स्मोकी बीबीक्यू विंग्स", "स्मोकी बारबेक्यू सॉस में लिपटे दस चिकन विंग्स, फ़्राइज़ और रैंच डिप के साथ।"],
    bn: ["স্মোকি বিবিকিউ উইংস", "স্মোকি বারবিকিউ সসে মাখানো দশটা চিকেন উইংস, ফ্রাই আর র‍্যাঞ্চ ডিপের সঙ্গে।"],
    mr: ["स्मोकी बीबीक्यू विंग्ज", "स्मोकी बार्बेक्यू सॉसमध्ये घोळवलेले दहा चिकन विंग्ज, फ्राइज आणि रँच डिपसोबत."],
    te: ["స్మోకీ బీబీక్యూ వింగ్స్", "స్మోకీ బార్బెక్యూ సాస్‌లో పది చికెన్ వింగ్స్, ఫ్రైస్, ర్యాంచ్ డిప్‌తో."],
  }),
  dish({ slug: "steak-frites", category: "dinner", cuisine: "french", price: 649, diet: "nonVeg", when: D, tags: ["chefSpecial", "glutenFree"], allergens: ["milk", "mustard"], alt: "Grilled steak with herb butter, fries and mustard" }, {
    en: ["Steak frites", "Grilled tenderloin with herb butter, thin fries and Dijon mustard."],
    hi: ["स्टेक फ़्रीट", "हर्ब बटर के साथ ग्रिल्ड टेंडरलॉइन, पतले फ़्राइज़ और डिजॉन मस्टर्ड।"],
    bn: ["স্টেক ফ্রিট", "হার্ব বাটার দিয়ে গ্রিল করা টেন্ডারলয়েন, সরু ফ্রাই আর ডিজোঁ মাস্টার্ড।"],
    mr: ["स्टेक फ्रिट", "हर्ब बटरसह ग्रिल्ड टेंडरलॉइन, पातळ फ्राइज आणि डिजॉन मस्टर्ड."],
    te: ["స్టీక్ ఫ్రీట్స్", "హెర్బ్ బటర్‌తో గ్రిల్డ్ టెండర్‌లాయిన్, సన్నని ఫ్రైస్, డిజాన్ మస్టర్డ్."],
  }),
  dish({ slug: "tonkotsu-ramen", category: "dinner", cuisine: "japanese", price: 449, diet: "nonVeg", when: D, tags: ["bestseller"], allergens: ["gluten", "egg", "soy", "sesame"], alt: "A bowl of ramen with chashu, egg and spring onion" }, {
    en: ["Chicken paitan ramen", "Creamy chicken broth, wheat noodles, chashu chicken, soft egg, nori and spring onion."],
    hi: ["चिकन पाइतान रामेन", "गाढ़ा चिकन शोरबा, गेहूं के नूडल्स, चाशू चिकन, नरम अंडा, नोरी और हरा प्याज़।"],
    bn: ["চিকেন পাইতান রামেন", "ঘন চিকেন স্টক, গমের নুডলস, চাশু চিকেন, নরম ডিম, নোরি আর পেঁয়াজকলি।"],
    mr: ["चिकन पायतान रामेन", "दाट चिकन रस्सा, गव्हाचे नूडल्स, चाशू चिकन, मऊ अंडं, नोरी आणि कांद्याची पात."],
    te: ["చికెన్ పైటాన్ రామెన్", "చిక్కని చికెన్ పులుసు, గోధుమ నూడుల్స్, చాషు చికెన్, మెత్తని గుడ్డు, నోరీ, ఉల్లికాడలు."],
  }),
  dish({ slug: "sushi-platter", category: "dinner", cuisine: "japanese", price: 599, diet: "nonVeg", when: LD, tags: ["chefSpecial"], allergens: ["fish", "shellfish", "soy"], alt: "Assorted nigiri sushi on a dark plate" }, {
    en: ["Nigiri platter", "Ten pieces of nigiri: salmon, prawn, tuna and tamago, with wasabi and pickled ginger."],
    hi: ["निगिरी प्लैटर", "दस निगिरी: सैल्मन, झींगा, टूना और तामागो, वसाबी और अचारी अदरक के साथ।"],
    bn: ["নিগিরি প্ল্যাটার", "দশ পিস নিগিরি: স্যামন, চিংড়ি, টুনা আর তামাগো, ওয়াসাবি আর আচারি আদার সঙ্গে।"],
    mr: ["निगिरी प्लॅटर", "दहा निगिरी: सॅल्मन, कोळंबी, ट्यूना आणि तामागो, वसाबी आणि लोणच्याच्या आल्यासोबत."],
    te: ["నిగిరి ప్లాటర్", "పది నిగిరి ముక్కలు: సాల్మన్, రొయ్య, ట్యూనా, తమగో; వసాబీ, ఊరబెట్టిన అల్లంతో."],
  }),
  dish({ slug: "teriyaki-bowl", category: "dinner", cuisine: "japanese", price: 369, diet: "nonVeg", when: D, allergens: ["soy", "sesame", "egg", "gluten"], alt: "A rice bowl topped with teriyaki chicken, spring onion and a soft egg" }, {
    en: ["Chicken teriyaki don", "Glazed teriyaki chicken over rice with spring onion, sesame and a soft egg."],
    hi: ["चिकन तेरियाकी डॉन", "चावल पर चमकदार तेरियाकी चिकन, हरा प्याज़, तिल और नरम अंडा।"],
    bn: ["চিকেন তেরিয়াকি ডন", "ভাতের ওপর চকচকে তেরিয়াকি চিকেন, পেঁয়াজকলি, তিল আর নরম ডিম।"],
    mr: ["चिकन तेरियाकी डॉन", "भातावर चकचकीत तेरियाकी चिकन, कांद्याची पात, तीळ आणि मऊ अंडं."],
    te: ["చికెన్ టెరియాకి డాన్", "అన్నంపై మెరిసే టెరియాకి చికెన్, ఉల్లికాడలు, నువ్వులు, మెత్తని గుడ్డు."],
  }),
  dish({ slug: "vegetable-tempura", category: "dinner", cuisine: "japanese", price: 429, diet: "nonVeg", when: D, allergens: ["gluten", "shellfish", "soy", "egg"], alt: "A tempura set meal with rice, dipping sauce and miso soup" }, {
    en: ["Tempura teishoku", "Prawn and seasonal vegetable tempura with rice, miso soup and tentsuyu dip."],
    hi: ["टेम्पुरा तेइशोकु", "झींगा और मौसमी सब्ज़ियों का टेम्पुरा, चावल, मिसो सूप और तेन्त्सुयु डिप के साथ।"],
    bn: ["টেম্পুরা তেইশোকু", "চিংড়ি আর মরসুমি সবজির টেম্পুরা, ভাত, মিসো স্যুপ আর তেন্তসুয়ু ডিপের সঙ্গে।"],
    mr: ["टेम्पुरा तेइशोकू", "कोळंबी आणि हंगामी भाज्यांचा टेम्पुरा, भात, मिसो सूप आणि तेन्त्सुयू डिपसोबत."],
    te: ["టెంపురా టెయిషోకు", "రొయ్యలు, కాలానుగుణ కూరగాయల టెంపురా, అన్నం, మిసో సూప్, టెన్ట్సుయు డిప్‌తో."],
  }),
  dish({ slug: "ratatouille", category: "dinner", cuisine: "french", price: 329, diet: "vegan", when: D, tags: ["glutenFree"], alt: "Layered ratatouille of aubergine, courgette and tomato" }, {
    en: ["Ratatouille", "Slow-baked aubergine, courgette, peppers and tomato with herbs of Provence."],
    hi: ["रैटाटुई", "प्रोवांस की जड़ी-बूटियों के साथ धीमी आंच पर बेक बैंगन, तोरी, शिमला मिर्च और टमाटर।"],
    bn: ["র‍্যাটাটুই", "প্রোভঁসের ভেষজ দিয়ে ঢিমে আঁচে বেক করা বেগুন, জুকিনি, ক্যাপসিকাম আর টমেটো।"],
    mr: ["रॅटाटुई", "प्रोव्हान्सच्या औषधी वनस्पतींसह मंद आचेवर बेक केलेली वांगी, झुकिनी, ढोबळी मिरची आणि टोमॅटो."],
    te: ["రాటటూయ్", "ప్రొవాన్స్ మూలికలతో నెమ్మదిగా బేక్ చేసిన వంకాయ, జుకినీ, క్యాప్సికమ్, టమాటా."],
  }),
  dish({ slug: "coq-au-vin", category: "dinner", cuisine: "french", price: 549, diet: "nonVeg", when: D, tags: ["glutenFree"], alt: "Coq au vin with mushrooms and onions in a deep plate" }, {
    en: ["Coq au vin", "Chicken braised in red wine with mushrooms, pearl onions and thyme, with mashed potato."],
    hi: ["कॉक ओ वैं", "रेड वाइन में मशरूम, छोटे प्याज़ और थाइम के साथ पका चिकन, मैश्ड आलू के साथ।"],
    bn: ["কক ও ভ্যাঁ", "রেড ওয়াইনে মাশরুম, ছোট পেঁয়াজ আর থাইম দিয়ে রাঁধা চিকেন, ম্যাশড আলুর সঙ্গে।"],
    mr: ["कॉक ओ व्हॅं", "रेड वाइनमध्ये मशरूम, छोटे कांदे आणि थाइमसह शिजवलेलं चिकन, मॅश्ड बटाट्यासोबत."],
    te: ["కాక్ ఓ వాన్", "రెడ్ వైన్‌లో పుట్టగొడుగులు, చిన్న ఉల్లిపాయలు, థైమ్‌తో ఉడికిన చికెన్, మ్యాష్డ్ పొటాటోతో."],
  }),

  // ── Tea & coffee (all day) ──────────────────────────────────
  dish({ slug: "masala-chai", category: "tea-coffee", cuisine: "indian", price: 49, diet: "veg", when: ALL, tags: ["bestseller"], allergens: ["milk"], variants: REGULAR_LARGE, addOns: [OAT_MILK], featured: true, alt: "A glass of milky masala chai on a dark wooden table" }, {
    en: ["Masala chai", "Assam tea boiled with milk, ginger, cardamom and a little jaggery."],
    hi: ["मसाला चाय", "दूध, अदरक, इलायची और थोड़े गुड़ के साथ उबली असम चाय।"],
    bn: ["মশলা চা", "দুধ, আদা, এলাচ আর একটু গুড় দিয়ে ফোটানো অসমের চা।"],
    mr: ["मसाला चहा", "दूध, आलं, वेलची आणि थोडा गूळ घालून उकळलेला आसाम चहा."],
    te: ["మసాలా చాయ్", "పాలు, అల్లం, యాలకులు, కొద్దిగా బెల్లంతో మరిగించిన అస్సాం టీ."],
  }),
  dish({ slug: "filter-coffee", category: "tea-coffee", cuisine: "indian", price: 69, diet: "veg", when: ALL, allergens: ["milk"], variants: REGULAR_LARGE, alt: "Frothy filter coffee in a steel tumbler and davara" }, {
    en: ["Filter coffee", "South Indian coffee and chicory decoction with frothed hot milk, in a steel tumbler."],
    hi: ["फ़िल्टर कॉफ़ी", "झागदार गर्म दूध के साथ दक्षिण भारतीय कॉफ़ी-चिकोरी डिकॉक्शन, स्टील के गिलास में।"],
    bn: ["ফিল্টার কফি", "ফেনা-ওঠা গরম দুধের সঙ্গে দক্ষিণ ভারতীয় কফি-চিকোরির ডিকক্শন, স্টিলের গ্লাসে।"],
    mr: ["फिल्टर कॉफी", "फेसाळ गरम दुधासोबत दाक्षिणात्य कॉफी-चिकोरी डिकॉक्शन, स्टीलच्या पेल्यात."],
    te: ["ఫిల్టర్ కాఫీ", "నురగ పాలతో దక్షిణాది కాఫీ-చికోరీ డికాక్షన్, స్టీల్ గ్లాసులో."],
  }),
  dish({ slug: "cold-coffee", category: "tea-coffee", cuisine: "american", price: 149, diet: "veg", when: ALL, allergens: ["milk"], addOns: [EXTRA_SHOT, OAT_MILK], featured: true, alt: "Iced coffee with milk swirling through it in a glass" }, {
    en: ["Cold coffee", "Espresso shaken with chilled milk and ice. Lightly sweet."],
    hi: ["कोल्ड कॉफ़ी", "ठंडे दूध और बर्फ़ के साथ फेंटा एस्प्रेसो। हल्का मीठा।"],
    bn: ["কোল্ড কফি", "ঠান্ডা দুধ আর বরফের সঙ্গে ঝাঁকানো এসপ্রেসো। হালকা মিষ্টি।"],
    mr: ["कोल्ड कॉफी", "थंड दूध आणि बर्फासोबत घुसळलेला एस्प्रेसो. हलका गोड."],
    te: ["కోల్డ్ కాఫీ", "చల్లని పాలు, ఐస్‌తో కలిపిన ఎస్ప్రెస్సో. కొద్దిగా తీపి."],
  }),
  dish({ slug: "cappuccino", category: "tea-coffee", cuisine: "italian", price: 159, diet: "veg", when: ALL, allergens: ["milk"], addOns: [EXTRA_SHOT, OAT_MILK], alt: "A cappuccino with latte art in a yellow cup" }, {
    en: ["Cappuccino", "Double espresso under silky steamed milk and a thick layer of foam."],
    hi: ["कैपुचीनो", "मुलायम भाप वाले दूध और गाढ़े झाग के नीचे डबल एस्प्रेसो।"],
    bn: ["কাপুচিনো", "মসৃণ স্টিমড দুধ আর ঘন ফেনার নিচে ডাবল এসপ্রেসো।"],
    mr: ["कॅपुचिनो", "मऊ वाफवलेलं दूध आणि दाट फेसाखाली डबल एस्प्रेसो."],
    te: ["కాపుచినో", "మెత్తని ఆవిరి పాలు, దట్టమైన నురగ కింద డబుల్ ఎస్ప్రెస్సో."],
  }),
  dish({ slug: "espresso", category: "tea-coffee", cuisine: "italian", price: 99, diet: "vegan", when: ALL, alt: "An espresso in a grey cup and saucer" }, {
    en: ["Espresso", "A double shot of our house blend, roasted nearby in small batches."],
    hi: ["एस्प्रेसो", "पास में छोटे बैच में भुने हमारे हाउस ब्लेंड का डबल शॉट।"],
    bn: ["এসপ্রেসো", "কাছেই অল্প করে রোস্ট করা আমাদের হাউস ব্লেন্ডের ডাবল শট।"],
    mr: ["एस्प्रेसो", "जवळच थोड्या प्रमाणात भाजलेल्या आमच्या हाउस ब्लेंडचा डबल शॉट."],
    te: ["ఎస్ప్రెస్సో", "దగ్గర్లోనే కొద్ది కొద్దిగా వేయించిన మా హౌస్ బ్లెండ్ డబుల్ షాట్."],
  }),
  dish({ slug: "matcha-latte", category: "tea-coffee", cuisine: "japanese", price: 199, diet: "veg", when: ALL, tags: ["new"], allergens: ["milk"], addOns: [OAT_MILK], alt: "A matcha latte with leaf latte art" }, {
    en: ["Matcha latte", "Stone-ground Japanese green tea whisked with steamed milk."],
    hi: ["माचा लाटे", "भाप वाले दूध के साथ फेंटी गई पत्थर पर पिसी जापानी हरी चाय।"],
    bn: ["মাচা লাতে", "স্টিমড দুধের সঙ্গে ফেটানো পাথরে পেষা জাপানি গ্রিন টি।"],
    mr: ["माचा लाटे", "वाफवलेल्या दुधासोबत फेटलेला दगडावर दळलेला जपानी ग्रीन टी."],
    te: ["మాచా లాటే", "ఆవిరి పాలతో కలిపిన రాతిపై రుబ్బిన జపనీస్ గ్రీన్ టీ."],
  }),
  dish({ slug: "sweet-lassi", category: "tea-coffee", cuisine: "indian", price: 119, diet: "veg", when: ALL, tags: ["glutenFree"], allergens: ["milk"], alt: "Thick sweet lassi in a clay kulhad" }, {
    en: ["Kulhad lassi", "Thick sweet lassi with a layer of malai, served in a clay cup."],
    hi: ["कुल्हड़ लस्सी", "मलाई की परत वाली गाढ़ी मीठी लस्सी, मिट्टी के कुल्हड़ में।"],
    bn: ["কুলহড় লস্যি", "মালাইয়ের স্তর দেওয়া ঘন মিষ্টি লস্যি, মাটির ভাঁড়ে।"],
    mr: ["कुल्हड लस्सी", "सायीचा थर असलेली दाट गोड लस्सी, मातीच्या कुल्हडमध्ये."],
    te: ["కుల్హడ్ లస్సీ", "మీగడ పొరతో చిక్కని తీపి లస్సీ, మట్టి కప్పులో."],
  }),
  dish({ slug: "hot-chocolate", category: "tea-coffee", cuisine: "french", price: 179, diet: "veg", when: ALL, allergens: ["milk"], addOns: [OAT_MILK], alt: "A mug of hot chocolate topped with whipped cream" }, {
    en: ["Chocolat chaud", "Thick Parisian hot chocolate made with dark chocolate and whole milk."],
    hi: ["शोकोला शो", "डार्क चॉकलेट और फ़ुल क्रीम दूध से बनी गाढ़ी पेरिस वाली हॉट चॉकलेट।"],
    bn: ["শোকোলা শো", "ডার্ক চকোলেট আর ফুল ক্রিম দুধে তৈরি ঘন প্যারিসের হট চকোলেট।"],
    mr: ["शोकोला शो", "डार्क चॉकलेट आणि फुल क्रीम दुधापासून बनवलेलं दाट पॅरिसियन हॉट चॉकलेट."],
    te: ["షొకొలా షో", "డార్క్ చాక్లెట్, ఫుల్ క్రీమ్ పాలతో చేసిన చిక్కని ప్యారిస్ హాట్ చాక్లెట్."],
  }),

  // ── Desserts (all day) ──────────────────────────────────────
  dish({ slug: "tiramisu", category: "desserts", cuisine: "italian", price: 249, diet: "egg", when: ALL, tags: ["bestseller"], allergens: ["gluten", "milk", "egg"], alt: "A slice of tiramisu dusted with cocoa" }, {
    en: ["Tiramisu", "Espresso-soaked sponge fingers layered with mascarpone cream and cocoa. Alcohol-free."],
    hi: ["तिरामिसु", "एस्प्रेसो में भीगे स्पंज बिस्किट, मस्कारपोने क्रीम और कोको की परतें। बिना शराब।"],
    bn: ["তিরামিসু", "এসপ্রেসোয় ভেজানো স্পঞ্জ বিস্কুট, মাস্কারপোনে ক্রিম আর কোকোর স্তর। অ্যালকোহল ছাড়া।"],
    mr: ["तिरामिसू", "एस्प्रेसोमध्ये भिजवलेली स्पंज बिस्किटं, मस्कारपोने क्रीम आणि कोकोचे थर. अल्कोहोलशिवाय."],
    te: ["తిరామిసు", "ఎస్ప్రెస్సోలో నానిన స్పాంజ్ బిస్కెట్లు, మస్కార్పోనే క్రీమ్, కోకో పొరలు. ఆల్కహాల్ లేదు."],
  }),
  dish({ slug: "ny-cheesecake", category: "desserts", cuisine: "american", price: 279, diet: "egg", when: ALL, allergens: ["gluten", "milk", "egg"], alt: "A slice of baked cheesecake with berry compote" }, {
    en: ["New York cheesecake", "Dense baked cheesecake on a biscuit base, with blueberry compote."],
    hi: ["न्यूयॉर्क चीज़केक", "बिस्किट बेस पर गाढ़ा बेक्ड चीज़केक, ब्लूबेरी कॉम्पोट के साथ।"],
    bn: ["নিউ ইয়র্ক চিজকেক", "বিস্কুটের বেসে ঘন বেকড চিজকেক, ব্লুবেরি কমপোটের সঙ্গে।"],
    mr: ["न्यूयॉर्क चीजकेक", "बिस्किटाच्या बेसवर दाट बेक्ड चीजकेक, ब्लूबेरी कॉम्पोटसोबत."],
    te: ["న్యూయార్క్ చీజ్‌కేక్", "బిస్కెట్ బేస్‌పై చిక్కని బేక్డ్ చీజ్‌కేక్, బ్లూబెర్రీ కంపోట్‌తో."],
  }),
  dish({ slug: "creme-brulee", category: "desserts", cuisine: "french", price: 239, diet: "egg", when: ALL, tags: ["glutenFree"], allergens: ["milk", "egg"], alt: "Crème brûlée with a caramelised top in a ramekin" }, {
    en: ["Crème brûlée", "Vanilla bean custard under a crackling layer of burnt sugar."],
    hi: ["क्रेम ब्रूले", "जली हुई चीनी की कुरकुरी परत के नीचे वनीला कस्टर्ड।"],
    bn: ["ক্রেম ব্রুলে", "পোড়া চিনির মচমচে স্তরের নিচে ভ্যানিলা কাস্টার্ড।"],
    mr: ["क्रेम ब्रुले", "करपवलेल्या साखरेच्या कुरकुरीत थराखाली व्हॅनिला कस्टर्ड."],
    te: ["క్రీమ్ బ్రూలే", "కాల్చిన చక్కెర కరకరలాడే పొర కింద వెనీలా కస్టర్డ్."],
  }),
  dish({ slug: "gulab-jamun", category: "desserts", cuisine: "indian", price: 99, diet: "veg", when: ALL, allergens: ["gluten", "milk"], alt: "Two gulab jamun in syrup with a spoon" }, {
    en: ["Gulab jamun", "Two warm milk dumplings soaked in cardamom and rose syrup."],
    hi: ["गुलाब जामुन", "इलायची और गुलाब की चाशनी में डूबे दो गर्म गुलाब जामुन।"],
    bn: ["গোলাপ জাম", "এলাচ আর গোলাপের রসে ডোবানো দুটো গরম গোলাপ জাম।"],
    mr: ["गुलाबजाम", "वेलची आणि गुलाबाच्या पाकात मुरलेले दोन गरम गुलाबजाम."],
    te: ["గులాబ్ జామున్", "యాలకులు, గులాబీ పాకంలో నానిన రెండు వేడి గులాబ్ జామున్లు."],
  }),
  dish({ slug: "chocolate-brownie", category: "desserts", cuisine: "american", price: 179, diet: "egg", when: ALL, allergens: ["gluten", "milk", "egg", "nuts"], alt: "A fudgy chocolate brownie topped with nuts" }, {
    en: ["Walnut brownie", "Fudgy dark chocolate brownie with toasted walnuts. Add ice cream if you like."],
    hi: ["अखरोट ब्राउनी", "भुने अखरोट वाली मुलायम डार्क चॉकलेट ब्राउनी। चाहें तो आइसक्रीम के साथ।"],
    bn: ["আখরোট ব্রাউনি", "সেঁকা আখরোট দেওয়া নরম ডার্ক চকোলেট ব্রাউনি। চাইলে আইসক্রিমের সঙ্গে।"],
    mr: ["अक्रोड ब्राउनी", "भाजलेल्या अक्रोडांची मऊ डार्क चॉकलेट ब्राउनी. हवं तर आइसक्रीमसोबत."],
    te: ["వాల్‌నట్ బ్రౌనీ", "వేయించిన వాల్‌నట్స్‌తో మెత్తని డార్క్ చాక్లెట్ బ్రౌనీ. కావాలంటే ఐస్‌క్రీమ్‌తో."],
  }),
  dish({ slug: "mochi", category: "desserts", cuisine: "japanese", price: 199, diet: "vegan", when: ALL, tags: ["glutenFree", "new"], alt: "Pink and white daifuku mochi, one cut open to show red bean paste" }, {
    en: ["Daifuku mochi", "Three soft rice cakes filled with sweet red bean paste."],
    hi: ["दाइफ़ुकु मोची", "मीठे लाल बीन्स के पेस्ट से भरे तीन नरम चावल के केक।"],
    bn: ["দাইফুকু মোচি", "মিষ্টি লাল বিনের পুর দেওয়া তিনটে নরম চালের কেক।"],
    mr: ["दाइफुकू मोची", "गोड लाल बीन्सचं सारण भरलेले तीन मऊ तांदळाचे केक."],
    te: ["దైఫుకు మోచీ", "తీపి ఎర్ర బీన్స్ పేస్ట్ నింపిన మూడు మెత్తని బియ్యం కేకులు."],
  }),
];
