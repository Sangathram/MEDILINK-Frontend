import React, { useEffect, useRef, useState } from "react";

/*
===========================================================
 MEDILINK AI ASSISTANT
===========================================================

Main flow:

Patient:
"I have fever"

AI:
"How many days have you had the fever?
Today, 1 day, 2 days, or more?"

Patient:
"Today"

AI:
"Have you eaten anything today?"

Patient:
"Yes"

AI:
"Do you have breathing problem, chest pain,
fainting, severe weakness, or repeated vomiting?"

Patient:
"No"

AI:
"I can show you the available fever medicine
in MEDILINK."

For fever lasting 2-3+ days:
AI recommends medical evaluation.

IMPORTANT:
The assistant does NOT invent medicine dosage.
It opens the medicine available in MEDILINK,
where the stored medicine instructions can be shown.
===========================================================
*/


/* ========================================================
   LANGUAGE
======================================================== */

const LANGUAGES = {
  en: {
    name: "English",
    speech: "en-IN",
  },

  te: {
    name: "తెలుగు",
    speech: "te-IN",
  },

  hi: {
    name: "हिन्दी",
    speech: "hi-IN",
  },
};


/* ========================================================
   HEALTHCARE PRODUCTS
======================================================== */

const PRODUCT_ALIASES = {
  banana: [
    "banana",
    "bananas",
    "केला",
    "केले",
    "banana kavali",
    "naku banana kavali",
    "నాకు అరటిపండు కావాలి",
    "అరటిపండు",
    "అరటి పండు",
  ],

  apple: [
    "apple",
    "apples",
    "सेब",
    "apple kavali",
    "నాకు ఆపిల్ కావాలి",
    "ఆపిల్",
  ],

  orange: [
    "orange",
    "oranges",
    "संतरा",
    "orange kavali",
    "నాకు ఆరెంజ్ కావాలి",
    "ఆరెంజ్",
  ],

  pomegranate: [
    "pomegranate",
    "anar",
    "anaar",
    "अनार",
    "danimma",
    "దానిమ్మ",
    "నాకు దానిమ్మ కావాలి",
  ],

  bandage: [
    "bandage",
    "bandages",
    "बैंडेज",
    "पट्टी",
    "bandage kavali",
    "నాకు బ్యాండేజ్ కావాలి",
    "బ్యాండేజ్",
  ],

  gauze: [
    "gauze",
    "गॉज",
    "gauze kavali",
    "గాజ్",
  ],

  "medical tape": [
    "medical tape",
    "medical tapes",
    "मेडिकल टेप",
    "medical tape kavali",
    "మెడికల్ టేప్",
  ],

  "energy drink": [
    "energy drink",
    "energy drinks",
    "एनर्जी ड्रिंक",
    "energy drink kavali",
    "ఎనర్జీ డ్రింక్",
  ],

  ors: [
    "ors",
    "oral rehydration",
    "oral rehydration solution",
    "ओआरएस",
    "ors kavali",
    "ఓఆర్ఎస్",
  ],

  "coconut water": [
    "coconut water",
    "नारियल पानी",
    "coconut water kavali",
    "కొబ్బరి నీళ్లు",
    "కొబ్బరి నీరు",
  ],
};


/* ========================================================
   MEDICINES
======================================================== */

const MEDICINE_ALIASES = {
  paracetamol: [
    "paracetamol",
    "paracetamol tablet",
    "paracetamol tablets",
    "crocin",
    "calpol",
    "पैरासिटामोल",
    "paracetamol kavali",
    "పారాసెటమాల్",
  ],

  amoxicillin: [
    "amoxicillin",
    "amoxicillin tablet",
    "amoxicillin tablets",
    "अमोक्सिसिलिन",
    "amoxicillin kavali",
    "అమోక్సిసిలిన్",
  ],
};


/* ========================================================
   NORMALIZE
======================================================== */

function normalizeText(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[“”‘’]/g, "'")
    .replace(/[.,!?;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function containsAny(text, values) {
  const normalized = normalizeText(text);

  return values.some((item) => {
    const value = normalizeText(item);

    return (
      value.length > 0 &&
      normalized.includes(value)
    );
  });
}


/* ========================================================
   AUTOMATIC LANGUAGE DETECTION
======================================================== */

function detectLanguage(text = "") {
  const value = String(text);

  /*
    Telugu Unicode
  */
  if (/[\u0C00-\u0C7F]/.test(value)) {
    return "te";
  }

  /*
    Hindi Unicode
  */
  if (/[\u0900-\u097F]/.test(value)) {
    return "hi";
  }

  const normalized = normalizeText(value);

  const teluguWords = [
    "naku",
    "naaku",
    "kavali",
    "ledu",
    "undi",
    "vachindi",
    "jwaram",
    "jvaram",
    "jwaram vachindi",
    "neellu",
    "neellu tagutunna",
    "tinnanu",
    "tinaledu",
    "tagalenu",
    "kashtam",
    "oopiri",
    "upiri",
    "gundelo",
    "balahinanga",
    "vanti",
    "rojulu",
    "roju",
  ];

  const hindiWords = [
    "mujhe",
    "mujhko",
    "mera",
    "meri",
    "hai",
    "hain",
    "bukhar",
    "bukhaar",
    "aaya",
    "aayi",
    "chahiye",
    "nahi",
    "nahin",
    "khaya",
    "khayi",
    "khana",
    "paani",
    "pee",
    "pi",
    "sakta",
    "sakti",
    "dikkat",
    "saans",
    "seene",
    "dard",
    "kamzori",
    "ulti",
  ];

  const teScore = teluguWords.reduce(
    (count, word) =>
      count + (normalized.includes(word) ? 1 : 0),
    0
  );

  const hiScore = hindiWords.reduce(
    (count, word) =>
      count + (normalized.includes(word) ? 1 : 0),
    0
  );

  if (teScore > hiScore && teScore > 0) {
    return "te";
  }

  if (hiScore > teScore && hiScore > 0) {
    return "hi";
  }

  return "en";
}


/* ========================================================
   FEVER DETECTION
======================================================== */

function containsFever(text = "") {
  return containsAny(text, [
    "fever",
    "i have fever",
    "i am suffering from fever",
    "i am having fever",
    "got fever",
    "got a fever",
    "fever came",
    "fever started",
    "temperature",
    "high temperature",

    // Hindi
    "bukhar",
    "bukhaar",
    "mujhe bukhar",
    "mujhe bukhaar",
    "aaj bukhar aaya",
    "aaj bukhaar aaya",
    "bukhar aaya",
    "bukhar hai",

    // Telugu
    "జ్వరం",
    "నాకు జ్వరం",
    "జ్వరం వచ్చింది",
    "జ్వరం ఉంది",
    "jwaram",
    "jvaram",
    "jwaram vachindi",
  ]);
}


/* ========================================================
   OTHER SYMPTOMS
======================================================== */

function containsBodyPain(text = "") {
  return containsAny(text, [
    "body pain",
    "body pains",
    "body ache",
    "body aches",
    "muscle pain",
    "शरीर में दर्द",
    "बदन दर्द",
    "శరీరం నొప్పి",
    "ఒళ్ళు నొప్పులు",
  ]);
}


function containsCough(text = "") {
  return containsAny(text, [
    "cough",
    "coughing",
    "खांसी",
    "खाँसी",
    "దగ్గు",
  ]);
}


function containsCold(text = "") {
  return containsAny(text, [
    "cold",
    "runny nose",
    "सर्दी",
    "జలుబు",
  ]);
}


function containsHeadache(text = "") {
  return containsAny(text, [
    "headache",
    "head pain",
    "सिर दर्द",
    "తలనొప్పి",
  ]);
}


/* ========================================================
   WARNING SYMPTOMS
======================================================== */

function detectWarningSymptom(text = "") {
  const normalized = normalizeText(text);

  /*
    BREATHING
  */

  if (
    containsAny(normalized, [
      "difficulty breathing",
      "difficult breathing",
      "difficult in breathing",
      "breathing difficulty",
      "breathing problem",
      "problem breathing",
      "trouble breathing",
      "cannot breathe",
      "can't breathe",
      "cant breathe",
      "shortness of breath",
      "short of breath",
      "not able to breathe",
      "suffocating",
      "breath problem",

      "saans lene mein dikkat",
      "saans lene me dikkat",
      "saans ki dikkat",
      "saans nahi aa rahi",
      "saans nahi aati",
      "सांस लेने में दिक्कत",
      "सांस लेने में परेशानी",
      "सांस नहीं आ रही",

      "శ్వాస తీసుకోవడంలో ఇబ్బంది",
      "ఊపిరి తీసుకోవడం కష్టం",
      "ఊపిరి సరిగ్గా రావడం లేదు",
      "ఊపిరి రావడం లేదు",
    ])
  ) {
    return "breathing";
  }


  /*
    CHEST PAIN
  */

  if (
    containsAny(normalized, [
      "chest pain",
      "chest hurts",
      "chest is hurting",
      "pain in chest",

      "seene mein dard",
      "seene me dard",
      "सीने में दर्द",

      "ఛాతి నొప్పి",
      "ఛాతీలో నొప్పి",
    ])
  ) {
    return "chest";
  }


  /*
    FAINTING
  */

  if (
    containsAny(normalized, [
      "faint",
      "fainted",
      "fainting",
      "passed out",
      "pass out",
      "lost consciousness",

      "बेहोश",
      "बेहोशी",

      "స్పృహ తప్పింది",
      "స్పృహ తప్పడం",
      "స్పృహ పోయింది",
    ])
  ) {
    return "fainting";
  }


  /*
    SEVERE WEAKNESS
  */

  if (
    containsAny(normalized, [
      "severe weakness",
      "very weak",
      "extremely weak",
      "too weak",
      "extreme weakness",
      "can't stand",
      "cannot stand",
      "unable to stand",

      "bahut kamzori",
      "bahut kamjori",
      "bahut weakness",
      "बहुत कमजोरी",
      "बहुत कमज़ोरी",

      "చాలా బలహీనంగా",
      "తీవ్రమైన బలహీనత",
      "నిలబడలేకపోతున్నాను",

      /*
        Speech recognition mistake
      */
      "service weakness",
    ])
  ) {
    return "weakness";
  }


  /*
    REPEATED VOMITING
  */

  if (
    containsAny(normalized, [
      "repeated vomiting",
      "vomiting again and again",
      "vomiting repeatedly",
      "can't stop vomiting",
      "cannot stop vomiting",
      "continuous vomiting",
      "keep vomiting",
      "keeps vomiting",
      "vomiting many times",

      "bar bar ulti",
      "baar baar ulti",
      "बार बार उल्टी",
      "बार-बार उल्टी",

      "పదే పదే వాంతులు",
      "ఆగకుండా వాంతులు",
      "చాలా సార్లు వాంతులు",
    ])
  ) {
    return "vomiting";
  }

  return null;
}


/* ========================================================
   YES / NO
======================================================== */

function isNo(text = "") {
  const normalized = normalizeText(text);

  if (!normalized) {
    return false;
  }

  return (
    normalized === "no" ||
    normalized.startsWith("no no") ||
    normalized.includes("no problem") ||
    normalized.includes("nothing") ||
    normalized.includes("none") ||
    normalized.includes("no symptoms") ||
    normalized.includes("not at all") ||
    normalized.includes("i don't have") ||
    normalized.includes("i do not have") ||

    normalized.includes("లేదు") ||
    normalized.includes("లేవు") ||
    normalized.includes("ఏమీ లేదు") ||

    normalized.includes("नहीं") ||
    normalized.includes("कोई नहीं") ||
    normalized.includes("कुछ नहीं")
  );
}


function isYes(text = "") {
  const normalized = normalizeText(text);

  if (!normalized) {
    return false;
  }

  return (
    normalized === "yes" ||
    normalized === "yeah" ||
    normalized === "yep" ||
    normalized === "haan" ||
    normalized === "han" ||
    normalized === "ha" ||
    normalized.includes("yes i") ||
    normalized.includes("i have") ||
    normalized.includes("i can") ||
    normalized.includes("i ate") ||
    normalized.includes("i eat") ||
    normalized.includes("ate something") ||

    normalized.includes("खाया") ||
    normalized.includes("खा लिया") ||
    normalized.includes("हां") ||
    normalized.includes("हाँ") ||

    normalized.includes("అవును") ||
    normalized.includes("తిన్నాను") ||
    normalized.includes("తిన్నా") ||
    normalized.includes("తాగగలను")
  );
}


/* ========================================================
   FOOD ANSWER
======================================================== */

function detectFoodAnswer(text = "") {
  const normalized = normalizeText(text);

  /*
    NO FOOD
  */

  if (
    containsAny(normalized, [
      "didn't eat",
      "did not eat",
      "not eaten",
      "haven't eaten",
      "have not eaten",
      "i did not eat anything",
      "i didn't eat anything",
      "nothing eaten",
      "no food",
      "couldn't eat",
      "cannot eat",
      "can't eat",
      "don't feel like eating",
      "no appetite",

      "khana nahi khaya",
      "maine nahi khaya",
      "kuch nahi khaya",
      "खाना नहीं खाया",
      "कुछ नहीं खाया",

      "తినలేదు",
      "ఏమీ తినలేదు",
      "తినలేకపోతున్నాను",
      "ఆకలి లేదు",
    ])
  ) {
    return "no";
  }


  /*
    YES FOOD
  */

  if (
    containsAny(normalized, [
      "i ate",
      "i have eaten",
      "i ate something",
      "i ate food",
      "i had food",
      "had breakfast",
      "had lunch",
      "had dinner",
      "i ate a little",
      "ate little",

      "thoda khaya",
      "maine khaya",
      "khana khaya",
      "खाना खाया",
      "मैंने खाया",
      "थोड़ा खाया",

      "తిన్నాను",
      "తిన్నా",
      "కొంచెం తిన్నాను",
      "భోజనం చేశాను",
    ])
  ) {
    return "yes";
  }


  if (isNo(normalized)) {
    return "no";
  }

  if (isYes(normalized)) {
    return "yes";
  }

  return null;
}


/* ========================================================
   DURATION
======================================================== */

function detectDuration(text = "") {
  const normalized = normalizeText(text);

  if (!normalized) {
    return null;
  }


  /*
    TODAY
  */

  if (
    containsAny(normalized, [
      "today",
      "today only",
      "just today",
      "since today",
      "this morning",
      "from morning",
      "since morning",

      "aaj",
      "aaj se",
      "आज",
      "आज से",

      "ఈరోజు",
      "ఈ రోజు",
      "ఈరోజు నుంచి",
      "ఈ రోజు నుంచి",
    ])
  ) {
    return {
      value: 0,
      unit: "today",
      label: "today",
    };
  }


  /*
    HOURS
  */

  let match = normalized.match(
    /(\d+(?:\.\d+)?)\s*(hour|hours|hr|hrs|h)\b/i
  );

  if (match) {
    const value = Number(match[1]);

    return {
      value,
      unit: "hours",
      label: `${value} hour${value === 1 ? "" : "s"}`,
    };
  }


  /*
    DAYS
  */

  match = normalized.match(
    /(\d+(?:\.\d+)?)\s*(day|days|d)\b/i
  );

  if (match) {
    const value = Number(match[1]);

    return {
      value,
      unit: "days",
      label: `${value} day${value === 1 ? "" : "s"}`,
    };
  }


  /*
    WEEKS
  */

  match = normalized.match(
    /(\d+(?:\.\d+)?)\s*(week|weeks|wk|wks)\b/i
  );

  if (match) {
    const value = Number(match[1]);

    return {
      value,
      unit: "weeks",
      label: `${value} week${value === 1 ? "" : "s"}`,
    };
  }


  /*
    BARE NUMBER

    Example:
    Patient says "2"

    In the duration question,
    interpret as 2 days.
  */

  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    const value = Number(normalized);

    if (value >= 0 && value <= 100) {
      return {
        value,
        unit: "days",
        label:
          value === 0
            ? "today"
            : `${value} day${value === 1 ? "" : "s"}`,
      };
    }
  }


  /*
    ENGLISH NUMBER WORDS
  */

  const englishNumbers = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  for (const [word, value] of Object.entries(
    englishNumbers
  )) {
    if (
      normalized === word ||
      normalized.includes(`${word} day`) ||
      normalized.includes(`${word} days`)
    ) {
      return {
        value,
        unit: "days",
        label: `${value} day${value === 1 ? "" : "s"}`,
      };
    }
  }


  /*
    HINDI
  */

  if (
    containsAny(normalized, [
      "ek din",
      "एक दिन",
    ])
  ) {
    return {
      value: 1,
      unit: "days",
      label: "1 day",
    };
  }

  if (
    containsAny(normalized, [
      "do din",
      "दो दिन",
    ])
  ) {
    return {
      value: 2,
      unit: "days",
      label: "2 days",
    };
  }

  if (
    containsAny(normalized, [
      "teen din",
      "तीन दिन",
    ])
  ) {
    return {
      value: 3,
      unit: "days",
      label: "3 days",
    };
  }


  /*
    TELUGU
  */

  if (
    containsAny(normalized, [
      "oka roju",
      "ఒక రోజు",
    ])
  ) {
    return {
      value: 1,
      unit: "days",
      label: "1 day",
    };
  }

  if (
    containsAny(normalized, [
      "rendu rojulu",
      "rendu rojuluga",
      "రెండు రోజులు",
      "రెండు రోజులుగా",
    ])
  ) {
    return {
      value: 2,
      unit: "days",
      label: "2 days",
    };
  }

  if (
    containsAny(normalized, [
      "moodu rojulu",
      "మూడు రోజులు",
      "మూడు రోజులుగా",
    ])
  ) {
    return {
      value: 3,
      unit: "days",
      label: "3 days",
    };
  }

  return null;
}


/* ========================================================
   QUANTITY
======================================================== */

function detectQuantity(text = "") {
  const normalized = normalizeText(text);

  const match = normalized.match(
    /(?:want|need|give|send|buy|get|order|need)\s+(\d+)\b/i
  );

  if (match) {
    return Number(match[1]);
  }

  return 1;
}


/* ========================================================
   FIND PRODUCT / MEDICINE
======================================================== */

function findAlias(text, aliases) {
  const normalized = normalizeText(text);

  for (const [name, values] of Object.entries(
    aliases
  )) {
    if (
      values.some((alias) =>
        normalized.includes(
          normalizeText(alias)
        )
      )
    ) {
      return name;
    }
  }

  return null;
}


function detectProductRequest(text = "") {
  const product = findAlias(
    text,
    PRODUCT_ALIASES
  );

  if (!product) {
    return null;
  }

  return {
    type: "HEALTHCARE",
    product,
    quantity: detectQuantity(text),
  };
}


function detectMedicineRequest(text = "") {
  const product = findAlias(
    text,
    MEDICINE_ALIASES
  );

  if (!product) {
    return null;
  }

  return {
    type: "MEDICINE",
    product,
    quantity: detectQuantity(text),
  };
}


/* ========================================================
   TRANSLATIONS
======================================================== */

const TEXT = {
  en: {
    welcome:
      "Hello! I am MEDILINK AI Assistant. Speak naturally in English, Telugu, or Hindi. Tell me what is troubling you.",

    feverDuration:
      "Okay. How many days have you had the fever? Today, 1 day, 2 days, or more?",

    feverDurationAgain:
      "Please tell me simply. For example: today, 2 hours, 1 day, or 2 days.",

    food:
      "Okay. Have you eaten anything today?",

    foodAgain:
      "Tell me simply: yes, no, I ate a little, or I did not eat.",

    warning:
      "Do you have any breathing problem, chest pain, fainting, severe weakness, or repeated vomiting?",

    warningAgain:
      "Tell me what you are feeling. You can say breathing problem, chest pain, weakness, vomiting, or no such problem.",

    urgentBreathing:
      "Breathing difficulty can be serious. Please seek urgent medical attention now.",

    urgentChest:
      "Chest pain can be serious. Please seek urgent medical attention now.",

    urgentFainting:
      "Fainting can be serious. Please seek urgent medical attention now.",

    urgentWeakness:
      "Severe weakness can be a warning sign. Please seek medical attention promptly.",

    urgentVomiting:
      "Repeated vomiting can cause dehydration. Please seek medical care, especially if you cannot keep fluids down.",

    shortFever:
      "Your fever has just started. Rest, drink fluids, and eat light food if you can. I can show you the available fever medicine in MEDILINK.",

    oneDayFever:
      "Your fever has been present for about a day. Rest, drink fluids, and eat light food if you can. I can show you the available fever medicine in MEDILINK.",

    longerFever:
      "Your fever has continued for 2 days or more. Please consult a doctor and get checked, especially if the fever is continuing or you are getting worse.",

    noFood:
      "You have not eaten today. Try a small amount of light food if you can tolerate it. After eating, I can show you the available fever medicine in MEDILINK.",

    medicine:
      "I can show you the available fever medicine in MEDILINK. Please check the medicine instructions and follow the label or pharmacist's advice.",

    product:
      "I found your request. I am opening the related MEDILINK healthcare product.",

    medicineSearch:
      "I found the medicine you mentioned. I am opening MEDILINK medicine search.",

    unclear:
      "I did not understand that fully. Please tell me in simple words.",
  },

  te: {
    welcome:
      "హలో! నేను MEDILINK AI Assistant. మీరు తెలుగులో సహజంగా మాట్లాడవచ్చు. మీకు ఏమి ఇబ్బంది ఉందో చెప్పండి.",

    feverDuration:
      "సరే. మీకు జ్వరం ఎన్ని రోజులుగా ఉంది? ఈరోజు నుంచా, 1 రోజు, 2 రోజులు లేదా అంతకంటే ఎక్కువా?",

    feverDurationAgain:
      "సులభంగా చెప్పండి. ఉదాహరణకు ఈరోజు, 2 గంటలు, 1 రోజు లేదా 2 రోజులు.",

    food:
      "సరే. మీరు ఈరోజు ఏమైనా తిన్నారా?",

    foodAgain:
      "సులభంగా చెప్పండి: అవును, లేదు, కొంచెం తిన్నాను లేదా ఏమీ తినలేదు.",

    warning:
      "మీకు ఊపిరి తీసుకోవడంలో ఇబ్బంది, ఛాతి నొప్పి, స్పృహ తప్పడం, తీవ్రమైన బలహీనత లేదా పదే పదే వాంతులు ఉన్నాయా?",

    warningAgain:
      "మీకు ఏమి ఇబ్బంది ఉందో చెప్పండి. ఊపిరి ఇబ్బంది, ఛాతి నొప్పి, బలహీనత, వాంతులు లేదా అలాంటి సమస్య ఏమీ లేదు అని చెప్పవచ్చు.",

    urgentBreathing:
      "ఊపిరి తీసుకోవడంలో ఇబ్బంది తీవ్రమైన సమస్య కావచ్చు. దయచేసి వెంటనే వైద్య సహాయం తీసుకోండి.",

    urgentChest:
      "ఛాతి నొప్పి తీవ్రమైన సమస్య కావచ్చు. దయచేసి వెంటనే వైద్య సహాయం తీసుకోండి.",

    urgentFainting:
      "స్పృహ తప్పడం తీవ్రమైన సమస్య కావచ్చు. దయచేసి వెంటనే వైద్య సహాయం తీసుకోండి.",

    urgentWeakness:
      "తీవ్రమైన బలహీనత ప్రమాద సూచన కావచ్చు. దయచేసి త్వరగా వైద్య సహాయం తీసుకోండి.",

    urgentVomiting:
      "పదే పదే వాంతులు వల్ల శరీరంలో నీరు తగ్గవచ్చు. దయచేసి వైద్య సహాయం తీసుకోండి.",

    shortFever:
      "జ్వరం ఇప్పుడే మొదలైంది. విశ్రాంతి తీసుకోండి, ద్రవాలు తాగండి మరియు వీలైతే తేలికపాటి ఆహారం తీసుకోండి. MEDILINK లో అందుబాటులో ఉన్న జ్వరం మందులను చూపించగలను.",

    oneDayFever:
      "మీకు సుమారు ఒక రోజు నుంచి జ్వరం ఉంది. విశ్రాంతి తీసుకోండి, ద్రవాలు తాగండి మరియు తేలికపాటి ఆహారం తీసుకోండి. MEDILINK లో అందుబాటులో ఉన్న జ్వరం మందులను చూపించగలను.",

    longerFever:
      "మీకు 2 రోజులు లేదా అంతకంటే ఎక్కువగా జ్వరం ఉంది. దయచేసి డాక్టర్‌ను సంప్రదించి చెక్ చేయించుకోండి, ముఖ్యంగా జ్వరం కొనసాగితే లేదా పరిస్థితి మరింతగా పెరిగితే.",

    noFood:
      "మీరు ఈరోజు ఏమీ తినలేదు. వీలైతే కొంచెం తేలికపాటి ఆహారం తీసుకోండి. తిన్న తర్వాత MEDILINK లో అందుబాటులో ఉన్న జ్వరం మందులను చూపించగలను.",

    medicine:
      "MEDILINK లో అందుబాటులో ఉన్న జ్వరం మందులను చూపించగలను. మందుపై ఉన్న సూచనలు లేదా ఫార్మసిస్ట్ సలహాను పాటించండి.",

    product:
      "మీకు కావాల్సిన ఉత్పత్తి అర్థమైంది. సంబంధిత MEDILINK ఆరోగ్య ఉత్పత్తిని తెరుస్తున్నాను.",

    medicineSearch:
      "మీరు చెప్పిన మందు అర్థమైంది. MEDILINK మందుల శోధనను తెరుస్తున్నాను.",

    unclear:
      "అది నాకు పూర్తిగా అర్థం కాలేదు. మీకు ఏమి ఇబ్బంది ఉందో సులభంగా చెప్పండి.",
  },

  hi: {
    welcome:
      "नमस्ते! मैं MEDILINK AI Assistant हूँ। आप हिंदी में सामान्य तरीके से बोल सकते हैं। आपको क्या परेशानी है बताइए।",

    feverDuration:
      "ठीक है। आपको बुखार कितने दिनों से है? आज से, 1 दिन, 2 दिन या उससे ज्यादा?",

    feverDurationAgain:
      "आसान तरीके से बताइए। जैसे आज से, 2 घंटे, 1 दिन या 2 दिन।",

    food:
      "ठीक है। क्या आपने आज कुछ खाया है?",

    foodAgain:
      "आसान तरीके से बताइए: हाँ, नहीं, थोड़ा खाया या कुछ नहीं खाया।",

    warning:
      "क्या आपको सांस लेने में परेशानी, सीने में दर्द, बेहोशी, बहुत ज्यादा कमजोरी या बार-बार उल्टी हो रही है?",

    warningAgain:
      "आपको जो परेशानी हो रही है वह बताइए। जैसे सांस की दिक्कत, सीने में दर्द, कमजोरी, उल्टी या ऐसी कोई परेशानी नहीं है।",

    urgentBreathing:
      "सांस लेने में परेशानी गंभीर हो सकती है। कृपया तुरंत चिकित्सा सहायता लें।",

    urgentChest:
      "सीने में दर्द गंभीर हो सकता है। कृपया तुरंत चिकित्सा सहायता लें।",

    urgentFainting:
      "बेहोशी गंभीर समस्या का संकेत हो सकती है। कृपया तुरंत चिकित्सा सहायता लें।",

    urgentWeakness:
      "बहुत ज्यादा कमजोरी गंभीर संकेत हो सकती है। कृपया जल्दी चिकित्सा सहायता लें।",

    urgentVomiting:
      "बार-बार उल्टी होने से शरीर में पानी की कमी हो सकती है। कृपया चिकित्सा सहायता लें।",

    shortFever:
      "बुखार अभी शुरू हुआ है। आराम करें, तरल पदार्थ लें और अगर संभव हो तो हल्का खाना खाएँ। मैं MEDILINK में उपलब्ध बुखार की दवा दिखा सकता हूँ।",

    oneDayFever:
      "आपको लगभग एक दिन से बुखार है। आराम करें, तरल पदार्थ लें और हल्का खाना खाएँ। मैं MEDILINK में उपलब्ध बुखार की दवा दिखा सकता हूँ।",

    longerFever:
      "आपको 2 दिन या उससे ज्यादा समय से बुखार है। कृपया डॉक्टर से सलाह लें और जांच करवाएं, खासकर अगर बुखार जारी है या हालत खराब हो रही है।",

    noFood:
      "आपने आज कुछ नहीं खाया है। अगर संभव हो तो थोड़ा हल्का खाना खाएँ। खाना खाने के बाद मैं MEDILINK में उपलब्ध बुखार की दवा दिखा सकता हूँ।",

    medicine:
      "मैं MEDILINK में उपलब्ध बुखार की दवा दिखा सकता हूँ। दवा पर दिए गए निर्देशों या फार्मासिस्ट की सलाह का पालन करें।",

    product:
      "आपकी जरूरत समझ गया। मैं संबंधित MEDILINK स्वास्थ्य उत्पाद खोल रहा हूँ।",

    medicineSearch:
      "आपने जिस दवा का नाम बताया वह समझ गया। मैं MEDILINK दवा खोज खोल रहा हूँ।",

    unclear:
      "मुझे यह पूरी तरह समझ नहीं आया। आपको क्या परेशानी हो रही है, आसान शब्दों में बताइए।",
  },
};


function getText(language, key) {
  return (
    TEXT[language]?.[key] ||
    TEXT.en[key]
  );
}


/* ========================================================
   SPEECH OUTPUT
======================================================== */

function speakText(text, language) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  try {
    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(text);

    const speechLanguage =
      LANGUAGES[language]?.speech || "en-IN";

    utterance.lang = speechLanguage;

    /*
      Keep English and Hindi behavior normal.
      Telugu gets a slightly slower rate so the words
      are clearer where the browser provides a Telugu
      voice.
    */

    utterance.rate =
      language === "te"
        ? 0.82
        : 0.9;

    utterance.pitch = 1;

    const voices =
      window.speechSynthesis.getVoices();

    /*
      Prefer exact Indian language voices.
    */

    let matchingVoice = voices.find(
      (voice) =>
        voice.lang?.toLowerCase() ===
        speechLanguage.toLowerCase()
    );

    /*
      If exact Telugu-India voice isn't available,
      use any Telugu voice.

      This is the browser's limitation; the app
      cannot manufacture a Telangana-specific voice.
    */

    if (!matchingVoice) {
      const languagePrefix =
        speechLanguage
          .split("-")[0]
          .toLowerCase();

      matchingVoice = voices.find(
        (voice) =>
          voice.lang
            ?.toLowerCase()
            .startsWith(languagePrefix)
      );
    }

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(
      utterance
    );
  } catch (error) {
    console.error(
      "Speech output error:",
      error
    );
  }
}


/* ========================================================
   COMPONENT
======================================================== */

function AiHealthAssistant() {

  const [messages, setMessages] =
    useState([
      {
        id: Date.now(),
        sender: "ai",
        text: getText(
          "en",
          "welcome"
        ),
        language: "en",
        time: new Date(),
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [language, setLanguage] =
    useState("en");

  const [listening, setListening] =
    useState(false);


  /*
    Fever stages:

    null
    fever_duration
    fever_food
    fever_warning
  */

  const [healthStage, setHealthStage] =
    useState(null);


  const [feverData, setFeverData] =
    useState({
      duration: null,
      food: null,
      warning: null,
    });


  const recognitionRef =
    useRef(null);

  const processingVoiceRef =
    useRef(false);


  /* ======================================================
     ADD MESSAGE
  ====================================================== */

  const addMessage = (
    sender,
    text,
    lang = language
  ) => {

    const message = {
      id:
        Date.now() +
        "-" +
        Math.random(),

      sender,

      text,

      language: lang,

      time: new Date(),
    };

    setMessages(
      (previous) => [
        ...previous,
        message,
      ]
    );


    if (sender === "ai") {
      setTimeout(() => {
        speakText(
          text,
          lang
        );
      }, 100);
    }
  };


  /* ======================================================
     PRODUCT EVENT
  ====================================================== */

  const openProductInPatientCare = (
    request,
    originalText
  ) => {

    window.dispatchEvent(
      new CustomEvent(
        "medilink-product-search",
        {
          detail: {
            query:
              request.product,

            quantity:
              request.quantity,

            originalText,
          },
        }
      )
    );
  };


  /* ======================================================
     MEDICINE EVENT
  ====================================================== */

  const openMedicineSearch = (
    request,
    originalText
  ) => {

    window.dispatchEvent(
      new CustomEvent(
        "medilink-medicine-search",
        {
          detail: {
            query:
              request.product,

            quantity:
              request.quantity,

            originalText,
          },
        }
      )
    );
  };


  /* ======================================================
     FEVER MEDICINE SEARCH
  ======================================================

     This searches for a common fever medicine in
     MEDILINK without inventing a dosage.

     If your medicine database uses another name,
     add that name to MEDICINE_ALIASES or modify the
     event handler in App.jsx.jsx.
  */

  const openFeverMedicine = (
    detectedLanguage
  ) => {

    addMessage(
      "ai",
      getText(
        detectedLanguage,
        "medicine"
      ),
      detectedLanguage
    );

    window.dispatchEvent(
      new CustomEvent(
        "medilink-medicine-search",
        {
          detail: {
            query: "paracetamol",
            originalText:
              "fever medicine",
            healthReason:
              "fever",
          },
        }
      )
    );
  };


  /* ======================================================
     START FEVER
  ====================================================== */

  const startFeverConversation = (
    detectedLanguage
  ) => {

    setLanguage(
      detectedLanguage
    );

    setFeverData({
      duration: null,
      food: null,
      warning: null,
    });

    setHealthStage(
      "fever_duration"
    );

    addMessage(
      "ai",
      getText(
        detectedLanguage,
        "feverDuration"
      ),
      detectedLanguage
    );
  };


  /* ======================================================
     WARNING
  ====================================================== */

  const handleWarningSymptom = (
    symptom,
    detectedLanguage
  ) => {

    let key =
      "urgentBreathing";

    if (symptom === "chest") {
      key = "urgentChest";
    }

    if (symptom === "fainting") {
      key = "urgentFainting";
    }

    if (symptom === "weakness") {
      key = "urgentWeakness";
    }

    if (symptom === "vomiting") {
      key = "urgentVomiting";
    }

    setFeverData(
      (previous) => ({
        ...previous,
        warning: symptom,
      })
    );

    setHealthStage(null);

    addMessage(
      "ai",
      getText(
        detectedLanguage,
        key
      ),
      detectedLanguage
    );
  };


  /* ======================================================
     FEVER CONVERSATION
  ====================================================== */

  const handleFeverConversation = (
    text,
    detectedLanguage
  ) => {

    /*
    ------------------------------------------------------
    STEP 1: DURATION
    ------------------------------------------------------
    */

    if (
      healthStage ===
      "fever_duration"
    ) {

      const duration =
        detectDuration(text);

      if (!duration) {

        addMessage(
          "ai",
          getText(
            detectedLanguage,
            "feverDurationAgain"
          ),
          detectedLanguage
        );

        return;
      }


      setFeverData(
        (previous) => ({
          ...previous,
          duration,
        })
      );


      setHealthStage(
        "fever_food"
      );


      addMessage(
        "ai",
        getText(
          detectedLanguage,
          "food"
        ),
        detectedLanguage
      );

      return;
    }


    /*
    ------------------------------------------------------
    STEP 2: FOOD
    ------------------------------------------------------
    */

    if (
      healthStage ===
      "fever_food"
    ) {

      const food =
        detectFoodAnswer(text);

      if (!food) {

        addMessage(
          "ai",
          getText(
            detectedLanguage,
            "foodAgain"
          ),
          detectedLanguage
        );

        return;
      }


      setFeverData(
        (previous) => ({
          ...previous,
          food,
        })
      );


      /*
        User requested only food before medicine,
        so there is NO extra fluids questionnaire.
      */

      setHealthStage(
        "fever_warning"
      );


      addMessage(
        "ai",
        getText(
          detectedLanguage,
          "warning"
        ),
        detectedLanguage
      );

      return;
    }


    /*
    ------------------------------------------------------
    STEP 3: WARNING CHECK
    ------------------------------------------------------
    */

    if (
      healthStage ===
      "fever_warning"
    ) {

      /*
        Check actual symptoms first.

        Example:
        "difficult in breathing"

        No need for patient to say "yes".
      */

      const warning =
        detectWarningSymptom(text);

      if (warning) {

        handleWarningSymptom(
          warning,
          detectedLanguage
        );

        return;
      }


      /*
        Patient says no serious symptoms.
      */

      if (isNo(text)) {

        const duration =
          feverData.duration;


        setHealthStage(null);


        /*
        -----------------------------------------------
        2 DAYS OR MORE
        -----------------------------------------------
        */

        if (
          duration &&
          duration.unit === "days" &&
          duration.value >= 2
        ) {

          addMessage(
            "ai",
            getText(
              detectedLanguage,
              "longerFever"
            ),
            detectedLanguage
          );

          return;
        }


        /*
        -----------------------------------------------
        FOOD = NO
        -----------------------------------------------
        */

        if (
          feverData.food ===
          "no"
        ) {

          addMessage(
            "ai",
            getText(
              detectedLanguage,
              "noFood"
            ),
            detectedLanguage
          );

          /*
            Do not automatically prescribe.
            We wait until the patient has eaten.
          */

          return;
        }


        /*
        -----------------------------------------------
        TODAY
        -----------------------------------------------
        */

        if (
          duration?.unit ===
            "today" ||
          duration?.value === 0
        ) {

          addMessage(
            "ai",
            getText(
              detectedLanguage,
              "shortFever"
            ),
            detectedLanguage
          );


          /*
            Open relevant medicine
            in MEDILINK.
          */

          setTimeout(() => {
            openFeverMedicine(
              detectedLanguage
            );
          }, 400);

          return;
        }


        /*
        -----------------------------------------------
        1 DAY
        -----------------------------------------------
        */

        if (
          duration?.unit ===
            "days" &&
          duration.value === 1
        ) {

          addMessage(
            "ai",
            getText(
              detectedLanguage,
              "oneDayFever"
            ),
            detectedLanguage
          );


          setTimeout(() => {
            openFeverMedicine(
              detectedLanguage
            );
          }, 400);

          return;
        }


        /*
        Default
        */

        addMessage(
          "ai",
          getText(
            detectedLanguage,
            "medicine"
          ),
          detectedLanguage
        );

        setTimeout(() => {
          openFeverMedicine(
            detectedLanguage
          );
        }, 400);

        return;
      }


      /*
        Natural language that is not clearly
        yes/no and doesn't mention a warning.
      */

      addMessage(
        "ai",
        getText(
          detectedLanguage,
          "warningAgain"
        ),
        detectedLanguage
      );

      return;
    }
  };


  /* ======================================================
     DIRECT PRODUCT / MEDICINE SEARCH
  ====================================================== */

  const handleDirectSearch = (
    text,
    detectedLanguage
  ) => {

    const product =
      detectProductRequest(text);

    if (product) {

      addMessage(
        "ai",
        getText(
          detectedLanguage,
          "product"
        ),
        detectedLanguage
      );

      openProductInPatientCare(
        product,
        text
      );

      return true;
    }


    const medicine =
      detectMedicineRequest(text);

    if (medicine) {

      addMessage(
        "ai",
        getText(
          detectedLanguage,
          "medicineSearch"
        ),
        detectedLanguage
      );

      openMedicineSearch(
        medicine,
        text
      );

      return true;
    }

    return false;
  };


  /* ======================================================
     BACKEND AI
  ====================================================== */

  const askBackendAI = async (
    message,
    detectedLanguage
  ) => {

    const token =
      localStorage.getItem(
        "token"
      ) ||
      sessionStorage.getItem(
        "token"
      );


    try {

      setLoading(true);


      const response =
        await fetch(
          "http://localhost:8080/api/ai/chat",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            body: JSON.stringify({
              message: `
MEDILINK AI HEALTH ASSISTANT

Patient language:
${LANGUAGES[detectedLanguage]?.name || "English"}

Patient message:
${message}

RULES:

- Understand normal everyday speech.
- Ask only one short question at a time.
- Use simple language.
- Do not diagnose.
- Do not invent medicine doses.
- Do not prescribe automatically.
- If serious warning symptoms are mentioned,
  recommend urgent medical care.
- Reply in the patient's language.
- Understand Telugu spoken naturally.
- Understand Telugu written in English letters.
- Understand Hindi spoken naturally.
- Understand Hindi written in English letters.
- Do not force the patient to answer using exact words.
- Do not give a long questionnaire.
              `,
            }),
          }
        );


      if (!response.ok) {
        throw new Error(
          `AI request failed: ${response.status}`
        );
      }


      const data =
        await response.json();


      const answer =
        data?.reply ||
        data?.response ||
        data?.message ||
        data?.content;


      if (answer) {

        addMessage(
          "ai",
          answer,
          detectedLanguage
        );

      } else {

        addMessage(
          "ai",
          getText(
            detectedLanguage,
            "unclear"
          ),
          detectedLanguage
        );
      }

    } catch (error) {

      console.error(
        "MEDILINK AI error:",
        error
      );

      addMessage(
        "ai",
        getText(
          detectedLanguage,
          "unclear"
        ),
        detectedLanguage
      );

    } finally {

      setLoading(false);
    }
  };


  /* ======================================================
     SEND
  ====================================================== */

  const sendMessage = async (
    textOverride = null
  ) => {

    const text =
      typeof textOverride === "string"
        ? textOverride.trim()
        : input.trim();


    if (
      !text ||
      loading
    ) {
      return;
    }


    setInput("");


    /*
      Automatically identify language.
    */

    const detectedLanguage =
      detectLanguage(text);


    setLanguage(
      detectedLanguage
    );


    /*
      Show patient message.
    */

    addMessage(
      "user",
      text,
      detectedLanguage
    );


    /*
      Existing health conversation.
    */

    if (healthStage) {

      handleFeverConversation(
        text,
        detectedLanguage
      );

      return;
    }


    /*
      Emergency symptoms at any point.
    */

    const warning =
      detectWarningSymptom(text);

    if (warning) {

      handleWarningSymptom(
        warning,
        detectedLanguage
      );

      return;
    }


    /*
      Medicine/product search.
    */

    if (
      handleDirectSearch(
        text,
        detectedLanguage
      )
    ) {
      return;
    }


    /*
      Fever.
    */

    if (containsFever(text)) {

      startFeverConversation(
        detectedLanguage
      );

      return;
    }


    /*
      Other symptoms.
    */

    if (
      containsBodyPain(text) ||
      containsCough(text) ||
      containsCold(text) ||
      containsHeadache(text)
    ) {

      await askBackendAI(
        text,
        detectedLanguage
      );

      return;
    }


    /*
      General AI.
    */

    await askBackendAI(
      text,
      detectedLanguage
    );
  };


  /* ======================================================
     VOICE RECOGNITION
  ====================================================== */

  const startVoiceRecognition = () => {

    if (listening) {
      stopVoiceRecognition();
      return;
    }


    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

      addMessage(
        "ai",
        "Voice input is not supported by this browser. Please use Chrome or type your message.",
        "en"
      );

      return;
    }


    processingVoiceRef.current =
      false;

    setListening(true);


    const recognition =
      new SpeechRecognition();


    /*
      Keep English behavior the same
      as your working version.
    */

    recognition.lang =
      "en-IN";

    recognition.continuous =
      false;

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      3;


    recognition.onstart = () => {
      setListening(true);
    };


    recognition.onresult = (
      event
    ) => {

      if (
        processingVoiceRef.current
      ) {
        return;
      }


      const results =
        event.results;


      if (!results?.length) {
        return;
      }


      const result =
        results[
          results.length - 1
        ];


      const transcript =
        result?.[0]?.transcript?.trim();


      if (!transcript) {
        return;
      }


      processingVoiceRef.current =
        true;


      const detectedLanguage =
        detectLanguage(
          transcript
        );


      setLanguage(
        detectedLanguage
      );


      setListening(false);


      sendMessage(
        transcript
      );
    };


    recognition.onerror = (
      event
    ) => {

      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);
    };


    recognition.onend = () => {

      setListening(false);

      recognitionRef.current =
        null;
    };


    recognitionRef.current =
      recognition;


    try {

      recognition.start();

    } catch (error) {

      console.error(
        "Could not start microphone:",
        error
      );

      setListening(false);
    }
  };


  const stopVoiceRecognition = () => {

    try {
      recognitionRef.current?.stop();
    } catch (error) {
      console.error(error);
    }

    recognitionRef.current =
      null;

    setListening(false);

    processingVoiceRef.current =
      false;
  };


  /* ======================================================
     CLEANUP
  ====================================================== */

  useEffect(() => {

    return () => {

      try {
        recognitionRef.current?.stop();
      } catch (error) {
        console.error(error);
      }


      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {

        window.speechSynthesis.cancel();
      }
    };

  }, []);


  /* ======================================================
     LOAD VOICES
  ======================================================

     Chrome sometimes loads speech voices after the
     component starts. Calling getVoices() and listening
     for voiceschanged improves Telugu voice selection.
  */

  useEffect(() => {

    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }


    const loadVoices =
      () => {
        window.speechSynthesis
          .getVoices();
      };


    loadVoices();


    window.speechSynthesis
      .addEventListener(
        "voiceschanged",
        loadVoices
      );


    return () => {

      window.speechSynthesis
        .removeEventListener(
          "voiceschanged",
          loadVoices
        );
    };

  }, []);


  /* ======================================================
     CLEAR
  ====================================================== */

  const clearChat = () => {

    stopVoiceRecognition();

    setHealthStage(null);

    setFeverData({
      duration: null,
      food: null,
      warning: null,
    });

    setLanguage("en");


    setMessages([
      {
        id: Date.now(),
        sender: "ai",
        text: getText(
          "en",
          "welcome"
        ),
        language: "en",
        time: new Date(),
      },
    ]);
  };


  /* ======================================================
     ENTER
  ====================================================== */

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();
    }
  };


  /* ======================================================
     QUICK BUTTONS
  ====================================================== */

  const quickQuestions = [
    "I have fever",
    "I am suffering from fever",
    "I want banana",
    "I need ORS",
  ];


  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="medilink-ai-wrapper">

      <div className="medilink-ai-card">

        {/* HEADER */}

        <div className="medilink-ai-header">

          <div>

            <div className="medilink-ai-title">
              🤖 MEDILINK AI Assistant
            </div>

            <div className="medilink-ai-subtitle">
              Speak naturally • English • తెలుగు • हिन्दी
            </div>

          </div>


          <button
            type="button"
            className="medilink-clear-button"
            onClick={clearChat}
          >
            Clear
          </button>

        </div>


        {/* LANGUAGE */}

        <div className="medilink-language-box">

          <span>🌐</span>

          <span>
            Automatic language detection
          </span>

          <strong>
            {LANGUAGES[
              language
            ]?.name}
          </strong>

        </div>


        {/* CHAT */}

        <div className="medilink-ai-messages">

          {messages.map(
            (message) => (

              <div
                key={message.id}
                className={`medilink-message-row ${
                  message.sender ===
                  "user"
                    ? "user-row"
                    : "ai-row"
                }`}
              >

                <div
                  className={`medilink-message ${
                    message.sender ===
                    "user"
                      ? "user-message"
                      : "ai-message"
                  }`}
                >

                  <div className="medilink-message-text">
                    {message.text}
                  </div>


                  <div className="medilink-message-time">

                    {message.time
                      ? message.time.toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : ""}

                  </div>

                </div>

              </div>
            )
          )}


          {loading && (

            <div className="medilink-message-row ai-row">

              <div className="medilink-message ai-message">

                <div className="medilink-typing">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            </div>
          )}

        </div>


        {/* QUICK ACTIONS */}

        <div className="medilink-quick-actions">

          {quickQuestions.map(
            (question) => (

              <button
                key={question}
                type="button"
                onClick={() =>
                  sendMessage(
                    question
                  )
                }
              >
                {question}
              </button>

            )
          )}

        </div>


        {/* INPUT */}

        <div className="medilink-input-area">

          <textarea
            value={input}
            onChange={(event) =>
              setInput(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Speak or type naturally..."
            rows={2}
            disabled={loading}
          />


          <button
            type="button"
            className={`medilink-mic-button ${
              listening
                ? "mic-active"
                : ""
            }`}
            onClick={
              listening
                ? stopVoiceRecognition
                : startVoiceRecognition
            }
            title={
              listening
                ? "Stop listening"
                : "Speak"
            }
          >
            {listening
              ? "⏹️"
              : "🎤"}
          </button>


          <button
            type="button"
            className="medilink-send-button"
            onClick={() =>
              sendMessage()
            }
            disabled={
              loading ||
              !input.trim()
            }
          >
            ➤
          </button>

        </div>


        {/* LISTENING */}

        {listening && (

          <div className="medilink-listening">

            🎙️ Listening... Speak normally.

          </div>
        )}


        {/* SAFETY */}

        <div className="medilink-ai-safety">

          ⚕️ General health information only.
          For serious symptoms, seek medical care.

        </div>

      </div>


      {/* ==================================================
          CSS
      ================================================== */}

      <style>{`

        .medilink-ai-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }


        .medilink-ai-card {
          width: 100%;
          max-width: 900px;
          background: #ffffff;
          border-radius: 18px;
          box-shadow:
            0 8px 30px rgba(
              0,
              0,
              0,
              0.10
            );
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }


        .medilink-ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 18px 20px;

          background:
            linear-gradient(
              135deg,
              #0f766e,
              #0ea5a4
            );

          color: white;
        }


        .medilink-ai-title {
          font-size: 20px;
          font-weight: 700;
        }


        .medilink-ai-subtitle {
          font-size: 13px;
          margin-top: 4px;
          opacity: 0.9;
        }


        .medilink-clear-button {
          border: none;
          background:
            rgba(
              255,
              255,
              255,
              0.18
            );

          color: white;

          padding:
            8px 13px;

          border-radius: 8px;

          cursor: pointer;

          font-weight: 600;
        }


        .medilink-clear-button:hover {
          background:
            rgba(
              255,
              255,
              255,
              0.28
            );
        }


        .medilink-language-box {
          display: flex;
          align-items: center;
          gap: 8px;

          padding:
            10px 16px;

          background:
            #f0fdfa;

          border-bottom:
            1px solid #ccfbf1;

          color:
            #115e59;

          font-size: 13px;
        }


        .medilink-language-box strong {
          margin-left: auto;

          background:
            white;

          padding:
            5px 10px;

          border-radius:
            15px;

          border:
            1px solid #99f6e4;
        }


        .medilink-ai-messages {
          height: 480px;

          overflow-y: auto;

          padding: 18px;

          background:
            #f8fafc;

          box-sizing:
            border-box;
        }


        .medilink-message-row {
          display: flex;
          margin-bottom: 13px;
        }


        .ai-row {
          justify-content:
            flex-start;
        }


        .user-row {
          justify-content:
            flex-end;
        }


        .medilink-message {
          max-width: 78%;

          padding:
            11px 14px;

          border-radius:
            15px;

          line-height:
            1.5;

          font-size:
            14px;
        }


        .ai-message {
          background:
            white;

          border:
            1px solid #e2e8f0;

          color:
            #1e293b;

          border-bottom-left-radius:
            4px;
        }


        .user-message {
          background:
            #0f766e;

          color:
            white;

          border-bottom-right-radius:
            4px;
        }


        .medilink-message-text {
          white-space:
            pre-wrap;

          word-break:
            break-word;
        }


        .medilink-message-time {
          font-size:
            10px;

          margin-top:
            5px;

          opacity:
            0.6;

          text-align:
            right;
        }


        .medilink-quick-actions {
          display:
            flex;

          gap:
            8px;

          padding:
            10px 15px;

          overflow-x:
            auto;

          border-top:
            1px solid #e2e8f0;

          background:
            white;
        }


        .medilink-quick-actions button {
          white-space:
            nowrap;

          border:
            1px solid #cbd5e1;

          background:
            #f8fafc;

          padding:
            7px 11px;

          border-radius:
            20px;

          cursor:
            pointer;

          font-size:
            12px;

          color:
            #334155;
        }


        .medilink-quick-actions button:hover {
          background:
            #f1f5f9;
        }


        .medilink-input-area {
          display:
            flex;

          align-items:
            flex-end;

          gap:
            8px;

          padding:
            12px 15px;

          background:
            white;

          border-top:
            1px solid #e2e8f0;
        }


        .medilink-input-area textarea {
          flex:
            1;

          resize:
            none;

          border:
            1px solid #cbd5e1;

          border-radius:
            12px;

          padding:
            11px 12px;

          font-family:
            inherit;

          font-size:
            14px;

          outline:
            none;

          min-height:
            45px;

          box-sizing:
            border-box;
        }


        .medilink-input-area textarea:focus {
          border-color:
            #0f766e;

          box-shadow:
            0 0 0 2px
            rgba(
              15,
              118,
              110,
              0.08
            );
        }


        .medilink-mic-button,
        .medilink-send-button {
          width:
            45px;

          height:
            45px;

          border-radius:
            50%;

          border:
            none;

          cursor:
            pointer;

          flex-shrink:
            0;

          font-size:
            18px;
        }


        .medilink-mic-button {
          background:
            #e0f2fe;
        }


        .medilink-mic-button:hover {
          background:
            #bae6fd;
        }


        .medilink-mic-button.mic-active {
          background:
            #fee2e2;

          animation:
            medilink-pulse
            1.2s infinite;
        }


        .medilink-send-button {
          background:
            #0f766e;

          color:
            white;
        }


        .medilink-send-button:disabled {
          opacity:
            0.45;

          cursor:
            not-allowed;
        }


        .medilink-listening {
          text-align:
            center;

          padding:
            7px;

          background:
            #ecfeff;

          color:
            #155e75;

          font-size:
            12px;

          font-weight:
            600;
        }


        .medilink-ai-safety {
          padding:
            10px 15px;

          background:
            #fffbeb;

          border-top:
            1px solid #fde68a;

          color:
            #92400e;

          font-size:
            11px;

          line-height:
            1.4;

          text-align:
            center;
        }


        .medilink-typing {
          display:
            flex;

          gap:
            4px;

          align-items:
            center;

          height:
            18px;
        }


        .medilink-typing span {
          width:
            6px;

          height:
            6px;

          border-radius:
            50%;

          background:
            #64748b;

          animation:
            medilink-bounce
            1.2s infinite;
        }


        .medilink-typing span:nth-child(2) {
          animation-delay:
            0.15s;
        }


        .medilink-typing span:nth-child(3) {
          animation-delay:
            0.3s;
        }


        @keyframes medilink-bounce {

          0%,
          60%,
          100% {
            transform:
              translateY(0);
          }

          30% {
            transform:
              translateY(-5px);
          }
        }


        @keyframes medilink-pulse {

          0% {
            box-shadow:
              0 0 0 0
              rgba(
                239,
                68,
                68,
                0.35
              );
          }

          70% {
            box-shadow:
              0 0 0 10px
              rgba(
                239,
                68,
                68,
                0
              );
          }

          100% {
            box-shadow:
              0 0 0 0
              rgba(
                239,
                68,
                68,
                0
              );
          }
        }


        @media (max-width: 700px) {

          .medilink-ai-wrapper {
            padding:
              8px;
          }


          .medilink-ai-card {
            border-radius:
              12px;
          }


          .medilink-ai-messages {
            height:
              55vh;

            min-height:
              400px;
          }


          .medilink-message {
            max-width:
              88%;

            font-size:
              14px;
          }


          .medilink-ai-title {
            font-size:
              17px;
          }


          .medilink-ai-subtitle {
            font-size:
              11px;
          }

        }


        @media (max-width: 450px) {

          .medilink-ai-header {
            align-items:
              flex-start;
          }


          .medilink-clear-button {
            font-size:
              11px;

            padding:
              6px 9px;
          }


          .medilink-language-box {
            font-size:
              11px;
          }


          .medilink-message {
            max-width:
              92%;
          }


          .medilink-mic-button,
          .medilink-send-button {
            width:
              42px;

            height:
              42px;
          }

        }

      `}</style>
    </div>
  );
}


export default AiHealthAssistant;