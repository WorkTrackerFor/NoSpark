const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function playSound(id) {
  if (!localStorage.getItem("sound") || localStorage.getItem("sound")==="on") {
    const sound = $(id);
    if(sound){ sound.currentTime=0; sound.play(); }
  }
}

// Tabs
$$(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    $$(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    $$(".tab").forEach(t=>t.classList.remove("active"));
    $("#"+btn.dataset.tab).classList.add("active");
    playSound("#sClick");
  });
});

// Theme Toggle
const darkModeToggle = $("#darkModeToggle");
function applyTheme(dark){
  document.body.classList.toggle("dark", dark);
  darkModeToggle.checked = dark;
}
darkModeToggle.addEventListener("change", ()=>{
  const dark = darkModeToggle.checked;
  applyTheme(dark);
  localStorage.setItem("theme", dark?"dark":"light");
  playSound("#sClick");
});
applyTheme(localStorage.getItem("theme")==="dark");

// Font size
$("#fontSizeSel").addEventListener("change", e=>{
  document.documentElement.style.fontSize = e.target.value+"px";
  localStorage.setItem("fontSize", e.target.value);
  playSound("#sClick");
});
if(localStorage.getItem("fontSize")){
  document.documentElement.style.fontSize = localStorage.getItem("fontSize")+"px";
  $("#fontSizeSel").value = localStorage.getItem("fontSize");
}

// Density
$("#densitySel").addEventListener("change", e=>{
  document.body.dataset.density = e.target.value;
  localStorage.setItem("density", e.target.value);
  playSound("#sClick");
});
if(localStorage.getItem("density")){
  document.body.dataset.density = localStorage.getItem("density");
  $("#densitySel").value = localStorage.getItem("density");
}

// Sound Toggle
$("#soundToggle").addEventListener("change", e=>{
  localStorage.setItem("sound", e.target.checked?"on":"off");
  playSound("#sClick");
});
if(localStorage.getItem("sound")==="off") $("#soundToggle").checked=false;

// Notes Storage
const notesInput = $("#notesInput");
if(localStorage.getItem("notes")) notesInput.value = localStorage.getItem("notes");
notesInput.addEventListener("input", ()=>localStorage.setItem("notes", notesInput.value));

// Summarise Notes
$("#summariseBtn").addEventListener("click", ()=>{
  const text = notesInput.value.trim();
  if(!text){ playSound("#sError"); return; }
  const sentences = text.split(/[.!?]\s/).filter(Boolean);
  const summarySentences = sentences.slice(0, 10);
  $("#summary").innerHTML = summarySentences.map(s=>`<div class="card">${s.trim()}.</div>`).join("");
  localStorage.setItem("summary", $("#summary").innerHTML);
  playSound("#sSuccess");
});
if(localStorage.getItem("summary")) $("#summary").innerHTML = localStorage.getItem("summary");

// Generate Q&A
function generateQA(text){
  const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
  const qaPairs = [];
  lines.forEach(line=>{
    if(line.includes(":")||line.includes("-")||line.includes("(")||line.toLowerCase().startsWith("define")){
      const q = line.split(/[:\-()]/)[0].trim();
      const a = line.slice(q.length).replace(/^[:\-()]+/,"").trim();
      if(q && a) qaPairs.push({q,a});
    }
  });
  return qaPairs;
}
$("#qaBtn").addEventListener("click", ()=>{
  const text = notesInput.value.trim();
  if(!text){ playSound("#sError"); return; }
  const qaPairs = generateQA(text);
  $("#qaSection").innerHTML = qaPairs.map(f=>`
    <div class="card">
      <div class="card-title">${f.q}</div>
      <div class="card-text">${f.a}</div>
    </div>
  `).join("");
  localStorage.setItem("qaSection", $("#qaSection").innerHTML);
  playSound("#sSuccess");
});
if(localStorage.getItem("qaSection")){
  $("#qaSection").innerHTML = localStorage.getItem("qaSection");
}

// Clear Button
$("#clearBtn").addEventListener("click", ()=>{
  notesInput.value = "";
  $("#summary").innerHTML = "";
  $("#qaSection").innerHTML = "";
  localStorage.removeItem("notes");
  localStorage.removeItem("summary");
  localStorage.removeItem("qaSection");
  playSound("#sClick");
});

// Import/Export
$("#exportBtn").addEventListener("click", ()=>{
  const data = {
    notes: notesInput.value,
    summary: $("#summary").innerHTML,
    qaSection: $("#qaSection").innerHTML
  };
  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="notes_data.json"; a.click();
  URL.revokeObjectURL(url);
  playSound("#sSuccess");
});

$("#importBtn").addEventListener("click", ()=>{
  const input = document.createElement("input"); input.type="file"; input.accept="application/json";
  input.onchange = e=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = ev=>{
      const data = JSON.parse(ev.target.result);
      if(data.notes){ notesInput.value = data.notes; localStorage.setItem("notes", data.notes); }
      if(data.summary){ $("#summary").innerHTML = data.summary; localStorage.setItem("summary", data.summary);}
      if(data.qaSection){ $("#qaSection").innerHTML = data.qaSection; localStorage.setItem("qaSection", data.qaSection);}
      playSound("#sSuccess");
    };
    reader.readAsText(file);
  };
  input.click();
});
