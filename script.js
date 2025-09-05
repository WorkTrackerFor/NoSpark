// -------- Utility Functions --------
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// -------- Sounds --------
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

  // Split into paragraphs for bigger notes
  const paragraphs = text.split(/\n+/).filter(Boolean);
  const summaryText = paragraphs.slice(0, 8).join("\n\n"); // bigger summary
  $("#summary").textContent = summaryText;

  localStorage.setItem("summary", $("#summary").textContent);
  playSound("#sSuccess");
});
if (localStorage.getItem("summary")) {
  $("#summary").textContent = localStorage.getItem("summary");
}

// -------- Generate Q&A --------
function generateQA(text) {
  const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
  const qaPairs = [];

  lines.forEach(line => {
    if (/^(define)/i.test(line) || line.includes(":") || line.includes("-") || line.includes("(")) {
      let q = line;
      let a = "";
      if (line.includes(":")) {
        const parts = line.split(":");
        q = parts[0].trim();
        a = parts.slice(1).join(":").trim();
      } else if (line.includes("-")) {
        const parts = line.split("-");
        q = parts[0].trim();
        a = parts.slice(1).join("-").trim();
      } else if (line.includes("(") && line.includes(")")) {
        const parts = line.split("(");
        q = parts[0].trim();
        a = parts[1].replace(")", "").trim();
      } else if (/^(define)/i.test(line)) {
        const parts = line.split(" ");
        q = parts.slice(0, 2).join(" ");
        a = parts.slice(2).join(" ");
      }
      qaPairs.push({ q, a });
    }
  });

  return qaPairs;
}

$("#flashBtn").addEventListener("click", () => {
  const text = notesInput.value.trim();
  if (!text) {
    playSound("#sError");
    return;
  }

  const qaPairs = generateQA(text);
  const container = $("#flashcards");
  container.innerHTML = "";

  qaPairs.forEach(pair => {
    const qaDiv = document.createElement("div");
    qaDiv.className = "pane glass";
    qaDiv.style.marginBottom = "12px";

    qaDiv.innerHTML = `
      <div class="pane-head"><h3>Q: ${pair.q}</h3></div>
      <div style="padding: 10px 14px; background: rgba(255,255,255,0.65); border-radius: 12px; border:1px solid var(--stroke);">
        <strong>Answer:</strong> ${pair.a}
      </div>
    `;

    container.appendChild(qaDiv);
  });

  localStorage.setItem("flashcards", container.innerHTML);
  playSound("#sSuccess");
});

if (localStorage.getItem("flashcards")) {
  $("#flashcards").innerHTML = localStorage.getItem("flashcards");
}

// -------- Clear Button --------
$("#clearBtn").addEventListener("click", () => {
  notesInput.value = "";
  $("#summary").textContent = "";
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
    summary: $("#summary").textContent,
    flashcards: $("#flashcards").innerHTML
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "notes_data.json";
  a.click();
  URL.revokeObjectURL(url);
  playSound("#sSuccess");
});

$("#importBtn").addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const data = JSON.parse(ev.target.result);
      if (data.notes) {
        notesInput.value = data.notes;
        localStorage.setItem("notes", data.notes);
      }
      if (data.summary) {
        $("#summary").textContent = data.summary;
        localStorage.setItem("summary", data.summary);
      }
      if (data.flashcards) {
        $("#flashcards").innerHTML = data.flashcards;
        localStorage.setItem("flashcards", data.flashcards);
      }
      playSound("#sSuccess");
    };
    reader.readAsText(file);
  };
  input.click();
});
