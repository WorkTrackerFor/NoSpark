// -------- Utility Functions --------
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// Sound helpers
function playSound(id) {
  if (!localStorage.getItem("sound") || localStorage.getItem("sound") === "on") {
    const sound = $(id);
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }
}

// -------- Tabs --------
$$(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    $$(".tab").forEach(t => t.classList.remove("active"));
    $("#" + btn.dataset.tab).classList.add("active");
    playSound("#sClick");
  });
});

// -------- Theme Toggle --------
const darkModeToggle = $("#darkModeToggle");
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  darkModeToggle.checked = dark;
}
darkModeToggle.addEventListener("change", () => {
  const dark = darkModeToggle.checked;
  applyTheme(dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
  playSound("#sClick");
});
applyTheme(localStorage.getItem("theme") === "dark");

// -------- Font Size --------
$("#fontSizeSel").addEventListener("change", e => {
  document.documentElement.style.fontSize = e.target.value + "px";
  localStorage.setItem("fontSize", e.target.value);
  playSound("#sClick");
});
if (localStorage.getItem("fontSize")) {
  document.documentElement.style.fontSize = localStorage.getItem("fontSize") + "px";
  $("#fontSizeSel").value = localStorage.getItem("fontSize");
}

// -------- Density --------
$("#densitySel").addEventListener("change", e => {
  document.body.dataset.density = e.target.value;
  localStorage.setItem("density", e.target.value);
  playSound("#sClick");
});
if (localStorage.getItem("density")) {
  document.body.dataset.density = localStorage.getItem("density");
  $("#densitySel").value = localStorage.getItem("density");
}

// -------- Sound Toggle --------
$("#soundToggle").addEventListener("change", e => {
  localStorage.setItem("sound", e.target.checked ? "on" : "off");
  playSound("#sClick");
});
if (localStorage.getItem("sound") === "off") {
  $("#soundToggle").checked = false;
}

// -------- Notes Storage --------
const notesInput = $("#notesInput");
if (localStorage.getItem("notes")) {
  notesInput.value = localStorage.getItem("notes");
}
notesInput.addEventListener("input", () => {
  localStorage.setItem("notes", notesInput.value);
});

// -------- Summarise Notes --------
$("#summariseBtn").addEventListener("click", () => {
  const text = notesInput.value.trim();
  if (!text) {
    playSound("#sError");
    return;
  }

  const sentences = text.split(/[.!?]\s/).filter(Boolean);
  const summarySentences = sentences.slice(0, 10); // bigger summary
  $("#summary").innerHTML = summarySentences
    .map(s => `<div class="card">${s.trim()}.</div>`)
    .join("");

  localStorage.setItem("summary", $("#summary").innerHTML);
  playSound("#sSuccess");
});
if (localStorage.getItem("summary")) {
  $("#summary").innerHTML = localStorage.getItem("summary");
}

// -------- Generate Questions & Answers --------
$("#flashBtn").addEventListener("click", () => {
  const text = notesInput.value.trim();
  if (!text) {
    playSound("#sError");
    return;
  }

  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const qaPairs = lines
    .filter(l => l.toLowerCase().startsWith("define"))
    .map(l => {
      const parts = l.split(":");
      if (parts.length >= 2) {
        return { q: parts[0].trim(), a: parts.slice(1).join(":").trim() };
      } else {
        return { q: l, a: "Answer not provided." };
      }
    });

  $("#flashcards").innerHTML = qaPairs
    .map(f => `
      <div class="flip-inner" style="height:auto; padding:14px; margin-bottom:12px;">
        <div>
          <div class="card-title">${f.q}</div>
          <div class="card-text">${f.a}</div>
        </div>
      </div>
    `).join("");

  localStorage.setItem("flashcards", $("#flashcards").innerHTML);
  playSound("#sSuccess");
});
if (localStorage.getItem("flashcards")) {
  $("#flashcards").innerHTML = localStorage.getItem("flashcards");
}

// -------- Clear Button --------
$("#clearBtn").addEventListener("click", () => {
  notesInput.value = "";
  $("#summary").innerHTML = "";
  $("#flashcards").innerHTML = "";
  localStorage.removeItem("notes");
  localStorage.removeItem("summary");
  localStorage.removeItem("flashcards");
  playSound("#sClick");
});

// -------- Import/Export --------
$("#exportBtn").addEventListener("click", () => {
  const data = {
    notes: notesInput.value,
    summary: $("#summary").innerHTML,
    flashcards: $("#flashcards").innerHTML
  };
  const blob =
