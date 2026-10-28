// English texts. Keys are looked up with t("group.area.name"), e.g. t("text.controls.restart").
// {name} placeholders are filled in by t(), e.g. t("text.progress.lastAttempts", { count: 20 }).
const TRANSLATIONS_EN = {
  // Text people see on the page, including hover tooltips.
  text: {
    appTitle: "Typing Trainer",
    stats: {
      wpm: "WPM:",
      accuracy: "Accuracy:",
      final: "final",
    },
    tips: {
      finalAccuracy: "Accuracy after correcting mistakes",
      newText: "Enter works before you start typing or after finishing a text",
      charCount: "Number of characters in the text",
    },
    typing: {
      overlay: "Click here to start typing.",
    },
    controls: {
      restart: "Restart",
      newText: "New text",
      hideStats: "Hide statistics",
      showStats: "Show statistics",
    },
    keys: {
      escape: "Esc",
      enter: "Enter",
    },
    progress: {
      title: "Progress",
      lastAttempts: "last {count} attempts",
      empty: "Finish an exercise to see your progress here.",
      tooltip: "Attempt #{number} · {date}",
    },
    // Keys match the stat names used in the code and saved attempts.
    metrics: {
      wpm: "WPM",
      accuracy: "Accuracy",
      finalAccuracy: "Final accuracy",
      seconds: "Time",
      charCount: "Symbols",
    },
    averages: {
      wpm: "Average WPM:",
      accuracy: "Average accuracy:",
      finalAccuracy: "Average final accuracy:",
    },
  },

  // Text only screen readers announce.
  aria: {
    typingText: "Text to type. Start typing to begin.",
    statTabs: "Stat to show",
    chart: "{label} over the last {count} attempts. Latest {latest}. Use arrow keys to step through attempts.",
  },
};
