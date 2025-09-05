document.addEventListener("DOMContentLoaded", () => {
  const notesInput = document.getElementById("notesInput");
  const summaryDiv = document.getElementById("summary");
  const qaDiv = document.getElementById("qaSection");
  const sClick = document.getElementById("sClick");
  const sSuccess = document.getElementById("sSuccess");
  const sError = document.getElementById("sError");

  // Play sound helper
  const playSound = (sound) => {
    if (!document.getElementById("soundToggle") || document.getElementById("soundToggle").checked) {
      if(sound) { sound.currentTime = 0; sound.play(); }
    }
  };

  // Tabs
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.getElementById(btn.dataset.tab).classList.add("active");
      playSound(sClick);
    });
  });

  // Theme toggle
  const darkModeToggle = document.getElementById("darkModeToggle");
  const applyTheme = (dark) => document.body.classList.toggle("dark", dark);
  if(localStorage.getItem("theme") === "dark") {
    applyTheme(true); darkModeToggle.checked = true;
  }
  darkModeToggle.addEventListener("change", () => {
    applyTheme(darkModeToggle.checked);
    localStorage.setItem("theme", darkModeToggle.checked ? "dark" : "light");
    playSound(sClick);
  });

  // Notes auto-save
  if(localStorage.getItem("notes")) notesInput.value = localStorage.getItem("notes");
  notesInput.addEventListener("input", () => localStorage.setItem("notes", notesInput.value));

  // Summarise button
  document.getElementById("summariseBtn").addEventListener("click", () => {
    const text = notesInput.value.trim();
    if(!text){ playSound(sError); return; }
    const sentences = text.split(/[.!?]\s/).filter(Boolean);
    summaryDiv.innerHTML = sentences.join(".<br>.");
    localStorage.setItem("summary", summaryDiv.innerHTML);
    playSound(sSuccess);
  });
  if(localStorage.getItem("summary")) summaryDiv.innerHTML = localStorage.getItem("summary");

  // Generate Q&A button
  document.getElementById("qaBtn").addEventListener("click", () => {
    const text = notesInput.value.trim();
    if(!text){ playSound(sError); return; }
    const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
    let qaPairs = [];

    lines.forEach(line => {
      if(/[:\-()]/.test(line) || line.toLowerCase().startsWith("define")) {
        let q = line, a = line;
        if(line.includes(":")) { [q,a] = line.split(":"); }
        else if(line.includes("-")) { [q,a] = line.split("-"); }
        else if(line.includes("(") && line.includes(")")) { 
          q = line; 
          a = line.split("(")[1].split(")")[0]; 
        }
        qaPairs.push({q: q.trim(), a: a.trim()});
      }
    });

    if(qaPairs.length === 0) qaDiv.innerHTML = "<i>No questions detected.</i>";
    else qaDiv.innerHTML = qaPairs.map(pair => `
      <div class="qa-card">
        <div class="qa-question">${pair.q}</div>
        <div class="qa-answer">${pair.a}</div>
      </div>
    `).join("");
    localStorage.setItem("qa", qaDiv.innerHTML);
    playSound(sSuccess);
  });
  if(localStorage.getItem("qa")) qaDiv.innerHTML = localStorage.getItem("qa");

  // Clear button
  document.getElementById("clearBtn").addEventListener("click", () => {
    notesInput.value = "";
    summaryDiv.innerHTML = "";
    qaDiv.innerHTML = "";
    localStorage.removeItem("notes");
    localStorage.removeItem("summary");
    localStorage.removeItem("qa");
    playSound(sClick);
  });

  // Import
  document.getElementById("importBtn").addEventListener("click", () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".txt";
    fileInput.onchange = e => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        notesInput.value = ev.target.result;
        localStorage.setItem("notes", notesInput.value);
        playSound(sSuccess);
      };
      reader.readAsText(file);
    };
    fileInput.click();
  });

  // Export
  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([notesInput.value], {type: "text/plain"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "notes.txt";
    link.click();
    playSound(sSuccess);
  });

});
