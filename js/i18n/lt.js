// Lithuanian texts. Same keys as en.js; anything missing here falls back to English.
// Sentences with a changing count avoid words that would need a plural form.
const TRANSLATIONS_LT = {
  // Text people see on the page, including hover tooltips.
  text: {
    appTitle: "Rašymo treniruoklis",
    stats: {
      wpm: "Ž/min:",
      accuracy: "Tikslumas:",
      final: "galutinis",
    },
    tips: {
      finalAccuracy: "Tikslumas ištaisius klaidas",
      newText: "Enter veikia prieš pradedant rašyti arba baigus tekstą",
      charCount: "Simbolių skaičius tekste",
    },
    typing: {
      overlay: "Spustelėkite čia ir pradėkite rašyti.",
    },
    controls: {
      restart: "Iš naujo",
      newText: "Naujas tekstas",
      hideStats: "Slėpti statistiką",
      showStats: "Rodyti statistiką",
    },
    keys: {
      escape: "Esc",
      enter: "Enter",
    },
    progress: {
      title: "Pažanga",
      lastAttempts: "paskutiniai {count} bandymų",
      empty: "Atlikite pratimą ir čia matysite savo pažangą.",
      tooltip: "Bandymas Nr. {number} · {date}",
    },
    // Keys match the stat names used in the code and saved attempts.
    metrics: {
      wpm: "Ž/min",
      accuracy: "Tikslumas",
      finalAccuracy: "Galutinis tikslumas",
      seconds: "Laikas",
      charCount: "Simboliai",
    },
    averages: {
      wpm: "Vidutinis ž/min:",
      accuracy: "Vidutinis tikslumas:",
      finalAccuracy: "Vidutinis galutinis tikslumas:",
    },
  },

  // Text only screen readers announce.
  aria: {
    typingText: "Tekstas, kurį reikia perrašyti. Pradėkite rašyti.",
    statTabs: "Rodomas rodiklis",
    languageSwitch: "Kalba",
    chart: "{label}, paskutinių bandymų skaičius: {count}. Naujausias: {latest}. Bandymus galite peržiūrėti rodyklių klavišais.",
  },
};
