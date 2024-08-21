const fromText = document.querySelector(".from-text"),
  toText = document.querySelector(".to-text"),
  exchangeIcon = document.querySelector(".exchange"),
  selectTag = document.querySelectorAll("select"),
  icons = document.querySelectorAll(".row i"),
   darkModeToggle = document.querySelector("#dark-mode");

  translateBtn = document.querySelector("button"),
  historyList = document.querySelector(".history-list");

selectTag.forEach((tag, id) => {
  for (let country_code in countries) {
    let selected = id == 0 ? (country_code == "en-GB" ? "selected" : "") : (country_code == "hi-IN" ? "selected" : "");
    let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

exchangeIcon.addEventListener("click", () => {
  let tempText = fromText.value,
    tempLang = selectTag[0].value;
  fromText.value = toText.value;
  toText.value = tempText;
  selectTag[0].value = selectTag[1].value;
  selectTag[1].value = tempLang;
});

fromText.addEventListener("keyup", () => {
  if (!fromText.value) {
    toText.value = "";
  }
});

translateBtn.addEventListener("click", () => {
  let text = fromText.value.trim(),
    translateFrom = selectTag[0].value,
    translateTo = selectTag[1].value;
  if (!text) return;
  toText.setAttribute("placeholder", "Translating...");
  let apiUrl = `https://api.mymemory.translated.net/get?q=${text}&langpair=${translateFrom}|${translateTo}`;
  fetch(apiUrl)
    .then((res) => res.json())
    .then((data) => {
      toText.value = data.responseData.translatedText;
      data.matches.forEach((data) => {
        if (data.id === 0) {
          toText.value = data.translation;
        }
      });
      toText.setAttribute("placeholder", "Translation");

      // Save to history
      saveHistory(text, translateFrom, toText.value, translateTo);
    });
});

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


darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    document.querySelectorAll('.container, .text-input textarea, .controls .row select').forEach(el => {
      el.classList.toggle('dark-mode');
    });
  });