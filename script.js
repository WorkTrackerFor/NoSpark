document.addEventListener("DOMContentLoaded", () => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const notesInput = $("#notesInput");
  const summaryDiv = $("#summary");
  const qaDiv = $("#qaSection");

  const playSound = id => {
    if (!localStorage.getItem("sound") || localStorage.getItem("sound")==="on") {
      const s = $(id);
      if(s){s.currentTime=0;s.play();}
    }
  }

  // Tabs
  $$(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      $$(".tab").forEach(t => t.classList.remove("active"));
      $("#" + btn.dataset.tab).classList.add("active");
      playSound("#sClick");
    });
  });

  // Theme
  const darkModeToggle = $("#darkModeToggle");
  function applyTheme(dark){document.body.classList.toggle("dark", dark);darkModeToggle.checked=dark;}
  darkModeToggle.addEventListener("change", () => {
    applyTheme(darkModeToggle.checked);
    localStorage.setItem("theme", darkModeToggle.checked ? "dark":"light");
    playSound("#sClick");
  });
  applyTheme(localStorage.getItem("theme")==="dark");

  // Sound
  $("#soundToggle").addEventListener("change", e=>{
    localStorage.setItem("sound", e.target.checked?"on":"off"); playSound("#sClick");
  });
  if(localStorage.getItem("sound")==="off") $("#soundToggle").checked=false;

  // Notes storage
  if(localStorage.getItem("notes")) notesInput.value = localStorage.getItem("notes");
  notesInput.addEventListener("input", () => localStorage.setItem("notes", notesInput.value));

  // Summarise
  $("#summariseBtn").addEventListener("click", () => {
    const text = notesInput.value.trim();
    if(!text){playSound("#sError");return;}
    const sentences = text.split(/[.!?]\s/).filter(Boolean);
    summaryDiv.innerHTML = sentences.join(".<br>.");
    localStorage.setItem("summary", summaryDiv.innerHTML);
    playSound("#sSuccess");
  });
  if(localStorage.getItem("summary")) summaryDiv.innerHTML = localStorage.getItem("summary");

  // Generate Q&A
  $("#qaBtn").addEventListener("click", () => {
    const text = notesInput.value.trim();
    if(!text){playSound("#sError"); return;}
    const lines = text.split(/\n/).map(l=>l.trim()).filter(Boolean);
    let qaPairs = [];

    lines.forEach(line=>{
      if(/[:\-()]/.test(line) || line.toLowerCase().startsWith("define")) {
        let q=line, a=line;
        if(line.includes(":")){ [q,a]=line.split(":"); }
        else if(line.includes("-")){ [q,a]=line.split("-"); }
        else if(line.includes("(") && line.includes(")")){ q=line; a=line.split("(")[1].split(")")[0]; }
        qaPairs.push({q:q.trim(),a:a.trim()});
      }
    });

    qaDiv.innerHTML = qaPairs.map(pair=>`
      <div class="qa-card">
        <div class="qa-question">${pair.q}</div>
        <div class="qa-answer">${pair.a}</div>
      </div>
    `).join("");
    localStorage.setItem("qa", qaDiv.innerHTML);
    playSound("#sSuccess");
  });
  if(localStorage.getItem("qa")) qaDiv.innerHTML = localStorage.getItem("qa");

  // Clear
  $("#clearBtn").addEventListener("click", ()=>{
    notesInput.value="";
    summaryDiv.innerHTML="";
    qaDiv.innerHTML="";
    localStorage.removeItem("notes");
    localStorage.removeItem("summary");
    localStorage.removeItem("qa");
    playSound("#sClick");
  });

  // Import/Export
  $("#exportBtn").
