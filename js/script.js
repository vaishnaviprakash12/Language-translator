const fromText = document.querySelector(".from-text"),
  toText = document.querySelector(".to-text"),
  exchangeIcon = document.querySelector(".exchange"),
  selectTag = document.querySelectorAll("select"),
  icons = document.querySelectorAll(".row i"),
  darkModeToggle = document.querySelector("#dark-mode"),
  translateBtn = document.querySelector("button"),
  historyList = document.querySelector(".history-list");

// Your MyMemory API key
const apiKey = '9d9fd961ba1c9176f65f';

// Populate the language selection dropdowns
selectTag.forEach((tag, id) => {
  for (let country_code in countries) {
    let selected = id === 0 ? (country_code === "en-GB" ? "selected" : "") : (country_code === "hi-IN" ? "selected" : "");
    let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

// Exchange text and languages
exchangeIcon.addEventListener("click", () => {
  let tempText = fromText.value,
    tempLang = selectTag[0].value;
  fromText.value = toText.value;
  toText.value = tempText;
  selectTag[0].value = selectTag[1].value;
  selectTag[1].value = tempLang;
});

// Clear the translation output if input is empty
fromText.addEventListener("keyup", () => {
  if (!fromText.value) {
    toText.value = "";
  }
});

// Function to transliterate Hindi written in English letters to Hindi script
function transliterateToHindi(input) {
  const translitMap = {
    'Namaste': 'नमस्ते',
    'Aap': 'आप',
    'Hindi': 'हिन्दी',
    'English': 'अंग्रेज़ी',
    // Add more mappings as needed
  };
  
  return translitMap[input] || input;
}

// Normalize input text
function normalizeText(text) {
  return text.trim().toLowerCase(); // Convert to lowercase and trim whitespace
}

// Filter out inappropriate content from the translation
function filterTranslation(text) {
  const inappropriateWords = ['inappropriateWord1', 'inappropriateWord2']; // Add words to filter
  let filteredText = text;

  inappropriateWords.forEach(word => {
    if (filteredText.toLowerCase().includes(word.toLowerCase())) {
      filteredText = "Content not available.";
    }
  });

  return filteredText;
}

// Translation logic
translateBtn.addEventListener("click", () => {
  let text = normalizeText(fromText.value),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;

  if (!text) return;

  // Handle specific terms before making the API request
  if (text === 'hindi' || text === 'english') {
    toText.value = transliterateToHindi(text.charAt(0).toUpperCase() + text.slice(1)); // Capitalize first letter
    return;
  }

  // Apply transliteration if translating from English to Hindi
  if (translateFrom === 'en-GB' && translateTo === 'hi-IN') {
    text = transliterateToHindi(text);
  }

  toText.setAttribute("placeholder", "Translating...");
  let apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${translateFrom}|${translateTo}&key=${apiKey}`;
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      if (data.responseData) {
        let translatedText = data.responseData.translatedText;
        toText.value = filterTranslation(translatedText); // Filter the translation
      } else {
        toText.value = "Translation not available.";
      }
      toText.setAttribute("placeholder", "Translation");

      // Save to history
      saveHistory(text, translateFrom, toText.value, translateTo);
    })
    .catch((error) => {
      console.error('Error:', error);
      toText.setAttribute("placeholder", "Translation failed");
    });
});

// Icon functionality (copy to clipboard and voice output)
icons.forEach((icon) => {
  icon.addEventListener("click", ({ target }) => {
    if (target.classList.contains("fa-copy")) {
      // Copy to clipboard logic
      if (target.id === "from-copy") {
        navigator.clipboard.writeText(fromText.value);
      } else {
        navigator.clipboard.writeText(toText.value);
      }
    } else if (target.classList.contains("fa-volume-up")) {
      // Voice output logic
      let utterance;
      if (target.id === "from-volume") {
        utterance = new SpeechSynthesisUtterance(fromText.value);
        utterance.lang = selectTag[0].value; // Speak in the language selected on the left
      } else {
        utterance = new SpeechSynthesisUtterance(toText.value);
        utterance.lang = selectTag[1].value; // Speak in the language selected on the right
      }
      speechSynthesis.speak(utterance);
    }
  });
});

// Save history function
function saveHistory(fromText, fromLang, toText, toLang) {
  const listItem = document.createElement("li");
  listItem.textContent = `${fromText} (${countries[fromLang]}) -> ${toText} (${countries[toLang]})`;
  historyList.appendChild(listItem);
}

// Dark mode toggle functionality
darkModeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
  document.querySelectorAll('.container, .text-input textarea, .controls .row select').forEach(el => {
    el.classList.toggle('dark-mode');
  });
});
