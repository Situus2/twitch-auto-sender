document.addEventListener('DOMContentLoaded', () => {
  // Domyślna konfiguracja
  const defaultConfig = {
    interval: 2,
    alternateModification: true,
    modificationMode: "duplicate", // Opcje: "random", "duplicate", "underscore"
    language: "en" // Opcje: "en" lub "pl"
  };

  // Słownik tłumaczeń dla strony ustawień
  const optionsTranslations = {
    en: {
      title: "Twitch Chat Auto Sender Settings",
      sendingInterval: "Sending interval (seconds):",
      modifyEveryOther: "Modify every other message:",
      modificationMode: "Modification mode:",
      optionRandom: "Random (random letter or underscore)",
      optionDuplicate: "Duplicate last character",
      optionUnderscore: "Append underscore",
      language: "Language:",
      save: "Save"
    },
    pl: {
      title: "Ustawienia Twitch Chat Auto Sender",
      sendingInterval: "Interwał wysyłania (w sekundach):",
      modifyEveryOther: "Modyfikuj co drugą wiadomość:",
      modificationMode: "Tryb modyfikacji:",
      optionRandom: "Losowy (losowa litera lub podłoga)",
      optionDuplicate: "Powiel ostatni znak",
      optionUnderscore: "Dodaj podłogę",
      language: "Język:",
      save: "Zapisz"
    }
  };

  // Funkcja aktualizująca interfejs ustawień wg wybranego języka
  function updateOptionsUI(lang) {
    const t = optionsTranslations[lang] || optionsTranslations.en;
    document.getElementById('pageTitle').textContent = t.title;
    document.getElementById('headerTitle').textContent = t.title;
    document.getElementById('labelIntervalText').textContent = t.sendingInterval;
    document.getElementById('labelModifyEveryOtherText').textContent = t.modifyEveryOther;
    document.getElementById('labelModificationModeText').textContent = t.modificationMode;
    document.getElementById('labelLanguageText').textContent = t.language;
    document.getElementById('saveButton').textContent = t.save;

    // Aktualizacja opcji w selektorze trybu modyfikacji
    const modificationModeSelect = document.getElementById('modificationMode');
    modificationModeSelect.options[0].text = t.optionRandom;
    modificationModeSelect.options[1].text = t.optionDuplicate;
    modificationModeSelect.options[2].text = t.optionUnderscore;

    // Aktualizacja opcji w selektorze języka
    const languageSelect = document.getElementById('language');
    if (lang === 'pl') {
      languageSelect.options[0].text = "Angielski";
      languageSelect.options[1].text = "Polski";
    } else {
      languageSelect.options[0].text = "English";
      languageSelect.options[1].text = "Polish";
    }
  }

  // Ładowanie zapisanych ustawień i ustawianie wartości pól formularza
  chrome.storage.sync.get(defaultConfig, (items) => {
    document.getElementById('interval').value = items.interval;
    document.getElementById('alternateModification').checked = items.alternateModification;
    document.getElementById('modificationMode').value = items.modificationMode;
    document.getElementById('language').value = items.language;
    updateOptionsUI(items.language);
  });

  // Aktualizacja interfejsu na bieżąco przy zmianie języka w selektorze
  document.getElementById('language').addEventListener('change', (e) => {
    updateOptionsUI(e.target.value);
  });

  // Obsługa formularza – zapis ustawień
  document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const interval = parseFloat(document.getElementById('interval').value) || defaultConfig.interval;
    const alternateModification = document.getElementById('alternateModification').checked;
    const modificationMode = document.getElementById('modificationMode').value;
    const language = document.getElementById('language').value;
    chrome.storage.sync.set({
      interval: interval,
      alternateModification: alternateModification,
      modificationMode: modificationMode,
      language: language
    }, () => {
      alert('Settings saved!');
    });
  });
});
