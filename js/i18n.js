// Translations. Each language lives in its own file in js/i18n/ and is registered here.
const LANGUAGES = { en: TRANSLATIONS_EN, lt: TRANSLATIONS_LT };
const FALLBACK_LANGUAGE = "en";
let language = FALLBACK_LANGUAGE;

// The saved choice first, then the browser's languages in order of preference, then English.
// "lt-LT" and "lt" both count as "lt".
function pickLanguage(saved) {
  const preferred = [saved, ...(navigator.languages ?? [navigator.language])];
  const codes = preferred
    .filter((code) => typeof code === "string")
    .map((code) => code.slice(0, 2).toLowerCase());
  return codes.find((code) => Object.hasOwn(LANGUAGES, code)) ?? FALLBACK_LANGUAGE;
}

// Unknown codes are ignored, so the page never ends up without a language.
// (Object.hasOwn rather than "in", which would also accept names like "constructor".)
function setLanguage(code) {
  if (typeof code === "string" && Object.hasOwn(LANGUAGES, code)) language = code;
}

// Anything but a string (a missing key, a number by mistake) finds nothing instead of throwing.
function lookup(translations, key) {
  if (typeof key !== "string") return undefined;
  return key.split(".").reduce((obj, part) => obj?.[part], translations);
}

// Text for a key like "text.controls.restart", with {name} placeholders filled from params.
// Missing in the current language → English; missing everywhere → the key itself, so it gets noticed.
function t(key, params = {}) {
  const value = lookup(LANGUAGES[language], key) ?? lookup(LANGUAGES[FALLBACK_LANGUAGE], key);
  if (typeof value !== "string") return String(key);
  return value.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);
}

// Fills every element marked in the HTML:
//   data-i18n="key"            → its text
//   data-i18n-title="key"      → its title (hover tooltip)
//   data-i18n-aria-label="key" → its aria-label (screen readers)
function applyTranslations() {
  document.documentElement.lang = language;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel));
  });
}
