// Builds practice texts from random words. Pure logic: no DOM access, so it can be tested on its own.

// Keeps only words made of lowercase letters (any alphabet, so ą, č, š... count), without duplicates.
// A typo in a list (a capital, a comma, a space) can then never reach the practice text.
function cleanWords(words) {
  const valid = words.filter((word) => typeof word === "string" && /^\p{Ll}+$/u.test(word));
  return [...new Set(valid)];
}

// Random words joined by single spaces, as close to targetLength characters (spaces included) as it gets.
// Always at least one word, and never the same word twice in a row.
// random can be swapped for a fixed sequence in tests; by default it's Math.random.
function generateText(words, targetLength, random = Math.random) {
  if (words.length === 0) return "";

  let text = "";
  let previous = null;
  for (;;) {
    let word;
    do {
      word = words[Math.floor(random() * words.length)];
    } while (word === previous && words.length > 1);

    const candidate = text === "" ? word : `${text} ${word}`;
    if (candidate.length > targetLength && text !== "") {
      // This word goes past the target: keep whichever is closer, with or without it.
      return candidate.length - targetLength < targetLength - text.length ? candidate : text;
    }
    text = candidate;
    previous = word;
    if (text.length >= targetLength) return text;
  }
}
