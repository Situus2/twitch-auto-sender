(function () {
  // Domyślne ustawienia – można je zmienić przez stronę opcji
  const defaultConfig = {
    interval: 2, // co ile sekund wysyłamy wiadomość
    alternateModification: true, // czy modyfikować co drugą wiadomość
    modificationMode: "duplicate" // opcje: "random", "duplicate", "underscore"
  };

  let config = defaultConfig;
  chrome.storage.sync.get(defaultConfig, (items) => {
    config = items;
    console.log("Wczytano ustawienia:", config);
  });

  // Dodajemy nasłuchiwanie na zmiany w chrome.storage, aby aktualizować konfigurację w locie
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      for (let key in changes) {
        config[key] = changes[key].newValue;
      }
      console.log("Zaktualizowano ustawienia:", config);
    }
  });

  // Identyfikator interwału automatycznego wysyłania
  let autoSendIntervalId = null;
  // Licznik wysłanych wiadomości – do modyfikacji co drugiej wiadomości
  let messageCount = 0;
  // Zapamiętana wiadomość do wysyłania
  let autoMessage = "";
  // Flaga, która zapobiega jednoczesnemu wykonywaniu wysyłania
  let isSending = false;

  // Pomocnicza funkcja pobierająca aktualne pole czatu
  function getChatInput() {
    return document.querySelector('[data-a-target="chat-input"]');
  }

  // Pomocnicza funkcja pobierająca przycisk wysyłania
  function getSendButton() {
    return document.querySelector('[data-a-target="chat-send-button"]');
  }

  // Funkcja losująca losową literę (do modyfikacji wiadomości w trybie "random")
  function getRandomLetter() {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    return letters.charAt(Math.floor(Math.random() * letters.length));
  }

  /**
   * Funkcja symulująca wpisywanie tekstu w polu czatu.
   * Dla każdego znaku wywołuje zdarzenia: keydown, keypress, input i keyup.
   *
   * @param {string} text - tekst do wpisania
   * @param {Function} callback - funkcja wywoływana po zakończeniu wpisywania
   */
  function simulateTyping(text, callback) {
    function getCurrentInput(previousInput) {
      if (!previousInput || !previousInput.isConnected) {
        previousInput = getChatInput();
      }
      return previousInput;
    }

    let chatInput = getCurrentInput(null);
    if (!chatInput) {
      console.error("Nie znaleziono pola czatu przy rozpoczęciu symulacji wpisywania.");
      if (callback) callback();
      return;
    }
    chatInput.focus();
    chatInput.click();

    let index = 0;
    function typeNext() {
      if (index < text.length) {
        chatInput = getCurrentInput(chatInput);
        if (!chatInput) {
          console.error("Nie znaleziono pola czatu podczas wpisywania. Przerywam wpisywanie.");
          if (callback) callback();
          return;
        }
        const char = text[index];

        // Symulacja zdarzeń klawiaturowych
        const keyDownEvent = new KeyboardEvent("keydown", { key: char, bubbles: true });
        chatInput.dispatchEvent(keyDownEvent);

        const keyPressEvent = new KeyboardEvent("keypress", { key: char, bubbles: true });
        chatInput.dispatchEvent(keyPressEvent);

        // Aktualizacja zawartości pola – dla elementów z atrybutem "value" lub contentEditable
        if ("value" in chatInput) {
          chatInput.value += char;
        } else if (chatInput.isContentEditable) {
          chatInput.innerText += char;
        }

        chatInput.dispatchEvent(new Event("input", { bubbles: true }));

        const keyUpEvent = new KeyboardEvent("keyup", { key: char, bubbles: true });
        chatInput.dispatchEvent(keyUpEvent);

        index++;
        setTimeout(typeNext, 5); // opóźnienie 100 ms między kolejnymi znakami
      } else {
        if (callback) callback();
      }
    }
    typeNext();
  }

  /**
   * Funkcja klikająca przycisk wysyłania wiadomości.
   * Jeśli przycisk nie zostanie znaleziony, próbuje ponownie po 500 ms.
   */
  function clickSendButton() {
    const sendButton = getSendButton();
    if (sendButton) {
      sendButton.click();
    } else {
      console.error("Nie znaleziono przycisku wysyłania. Próba ponownie za 500ms...");
      setTimeout(clickSendButton, 500);
    }
  }

  /**
   * Funkcja wysyłająca wiadomość.
   * Sprawdza, czy nie trwa już wysyłanie (flaga isSending) oraz korzysta z zapamiętanej wiadomości (autoMessage).
   * Jeśli włączona jest opcja alternateModification, modyfikuje wiadomość zgodnie z ustawionym trybem:
   * - "random"    – dodaje losowy znak lub podłogę,
   * - "duplicate" – powiela ostatni znak,
   * - "underscore"– dodaje stałą podłogę.
   *
   * Następnie czyści pole czatu, symuluje wpisywanie i klika przycisk wysyłania.
   */
  function sendMessage() {
    if (isSending) {
      console.log("Wysyłanie już trwa, pomijam to wywołanie.");
      return;
    }
    isSending = true;
    console.log("Wywołanie sendMessage – liczba wysłanych:", messageCount);

    if (!autoMessage || autoMessage.trim() === "") {
      console.warn("Brak wiadomości do wysłania.");
      isSending = false;
      return;
    }

    let modifiedText = autoMessage;
    if (config.alternateModification && (messageCount % 2 === 1)) {
      switch (config.modificationMode) {
        case "duplicate":
          if (autoMessage.length > 0) {
            modifiedText = autoMessage + autoMessage.slice(-1);
          }
          break;
        case "underscore":
          modifiedText = autoMessage + "_";
          break;
        case "random":
        default:
          modifiedText = autoMessage + (Math.random() < 0.5 ? "_" : getRandomLetter());
          break;
      }
    }
    messageCount++;

    const chatInput = getChatInput();
    if (!chatInput) {
      console.error("Nie znaleziono pola czatu. Próba ponownie za 500ms...");
      setTimeout(() => {
        isSending = false;
        sendMessage();
      }, 500);
      return;
    }

    // Czyścimy pole czatu – zarówno wartość, jak i ewentualny contentEditable
    if ("value" in chatInput) {
      chatInput.value = "";
    } else if (chatInput.isContentEditable) {
      chatInput.innerText = "";
    }

    simulateTyping(modifiedText, () => {
      clickSendButton();
      isSending = false;
    });
  }

  /**
   * Funkcja przełączająca tryb automatycznego wysyłania.
   * Przy włączeniu:
   *   - pobiera wiadomość z pola czatu i zapisuje ją jako autoMessage,
   *   - zmienia wygląd przycisku (tekst oraz kolor na czerwony),
   *   - wysyła wiadomość natychmiast oraz ustawia interwał wysyłania.
   * Przy wyłączeniu:
   *   - zatrzymuje interwał wysyłania,
   *   - resetuje autoMessage,
   *   - zmienia wygląd przycisku (tekst oraz kolor na zielony).
   *
   * @param {HTMLElement} button - przycisk Auto Send
   */
  function toggleAutoSend(button) {
    if (autoSendIntervalId === null) {
      const chatInput = getChatInput();
      if (!chatInput) {
        console.error("Nie znaleziono pola czatu.");
        return;
      }
      // Pobieramy wiadomość z pola – sprawdzamy zarówno właściwość value, jak i innerText
      let messageFromInput = "";
      if ("value" in chatInput) {
        messageFromInput = chatInput.value;
      } else if (chatInput.isContentEditable) {
        messageFromInput = chatInput.innerText;
      }
      if (!messageFromInput || messageFromInput.trim() === "") {
        console.warn("Wpisz wiadomość, aby rozpocząć auto-send.");
        return;
      }
      autoMessage = messageFromInput;

      // Zmieniamy wygląd przycisku – stan włączony (czerwony)
      button.textContent = "Stop Auto Send";
      button.style.backgroundColor = "red";

      // Natychmiast wysyłamy wiadomość oraz ustawiamy interwał wysyłania
      sendMessage();
      autoSendIntervalId = setInterval(sendMessage, config.interval * 1000);
    } else {
      // Wyłączamy auto-send
      clearInterval(autoSendIntervalId);
      autoSendIntervalId = null;
      autoMessage = "";

      // Zmieniamy wygląd przycisku – stan wyłączony (zielony)
      button.textContent = "Start Auto Send";
      button.style.backgroundColor = "green";
    }
  }

  /**
   * Funkcja dodająca przycisk Auto Send do interfejsu czatu.
   * Przycisk zostanie umieszczony obok oryginalnego przycisku wysyłania.
   */
  function addAutoSendButton() {
    const sendButton = getSendButton();
    if (!sendButton) {
      console.warn("Przycisk wysyłania nie został jeszcze znaleziony – spróbuję później...");
      return;
    }
    if (document.getElementById("auto-send-button")) return;

    const autoSendButton = document.createElement("button");
    autoSendButton.id = "auto-send-button";
    autoSendButton.textContent = "Start Auto Send";
    autoSendButton.style.backgroundColor = "green"; // stan wyłączony – zielony
    autoSendButton.style.color = "white";
    autoSendButton.style.marginLeft = "5px";
    autoSendButton.style.border = "none";
    autoSendButton.style.padding = "5px 10px";
    autoSendButton.style.cursor = "pointer";
    autoSendButton.addEventListener("click", () => {
      toggleAutoSend(autoSendButton);
    });

    // Wstawiamy przycisk obok przycisku wysyłania
    sendButton.parentNode.insertBefore(autoSendButton, sendButton.nextSibling);
  }

  // Obserwujemy zmiany w DOM, aby dodać przycisk, gdy elementy czatu staną się dostępne
  const observer = new MutationObserver((mutationsList, observer) => {
    addAutoSendButton();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Dodatkowo próbujemy dodać przycisk co 2 sekundy (w razie opóźnionego ładowania czatu)
  const initInterval = setInterval(() => {
    addAutoSendButton();
  }, 2000);
  setTimeout(() => {
    clearInterval(initInterval);
  }, 30000);
})();
