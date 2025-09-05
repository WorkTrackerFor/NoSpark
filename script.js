const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function playSound(id){}

// Tabs
$$(".tab-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    $$(".tab").forEach(t=>t.classList.remove("active"));
    $("#"+btn.dataset.tab).classList.add("active");
  });
});

// Theme Toggle
const darkModeToggle=$("#darkModeToggle");
function applyTheme(dark){
  document.body.classList.toggle("dark",dark);
  darkModeToggle.checked=dark;
}
darkModeToggle.addEventListener("change",()=>{
  applyTheme(darkModeToggle.checked);
  localStorage.setItem("theme",darkModeToggle.checked?"dark":"light");
});
applyTheme(localStorage.getItem("theme")==="dark");

// Font Size
$("#fontSizeSel").addEventListener("change",e=>{
  document.documentElement.style.fontSize=e.target.value+"px";
  localStorage.setItem("fontSize",e.target.value);
});
if(localStorage.getItem("fontSize")){
  document.documentElement.style.fontSize=localStorage.getItem("fontSize")+"px";
  $("#fontSizeSel").value=localStorage.getItem("fontSize");
}

// Density
$("#densitySel").addEventListener("change",e=>{
  document.body.dataset.density=e.target.value;
  localStorage.setItem("density",e.target.value);
});
if(localStorage.getItem("density")){
  document.body.dataset.density=localStorage.getItem("density");
  $("#densitySel").value=localStorage.getItem("density");
}

// Notes
const notesInput=$("#notesInput");
if(localStorage.getItem("notes")) notesInput.value=localStorage.getItem("notes");
notesInput.addEventListener("input",()=>{localStorage.setItem("notes",notesInput.value);});

// Summarise
$("#summariseBtn").addEventListener("click",()=>{
  const text=notesInput.value.trim();
  if(!text)return;
  const sentences=text.split(/[.!?]\s/).filter(Boolean);
  const summarySentences=sentences.slice(0,10);
  $("#summary").innerHTML=summarySentences.map(s=>`<div>${s}</div>`).join("");
  localStorage.setItem("summary",$("#summary").innerHTML);
});
if(localStorage.getItem("summary")) $("#summary").innerHTML=localStorage.getItem("summary");

// Generate QnA
$("#generateBtn").addEventListener("click",()=>{
  const text=notesInput.value.trim();
  if(!text)return;
  const lines=text.split("\n").map(l=>l.trim()).filter(Boolean);
  const qna=[];
  lines.forEach(l=>{
    if(/:|\(|\)|-/.test(l)){
      let parts=l.split(/:|-|\(|\)/).map(p=>p.trim()).filter(Boolean);
      if(parts.length>=2) qna.push({q:parts[0],a:parts.slice(1).join(":")});
    }
  });
  // fallback: first 5 sentences
  if(qna.length===0){
    const sents=text.split(/[.!?]\s/).filter(Boolean);
    for(let i=0;i<5 && i<sents.length;i++) qna.push({q:"Explain: "+sents[i].slice(0,50)+"...",a:sents[i]});
  }
  $("#qna").innerHTML=qna.map(f=>`<div><strong>${f.q}</strong><div>${f.a}</div></div>`).join("");
  localStorage.setItem("qna",$("#qna").innerHTML);
});
if(localStorage.getItem("qna")) $("#qna").innerHTML=localStorage.getItem("qna");

// Clear
$("#clearBtn").addEventListener("click",()=>{
  notesInput.value="";
  $("#summary").innerHTML="";
  $("#qna").innerHTML="";
  localStorage.removeItem("notes");
  localStorage.removeItem("summary");
  localStorage.removeItem("qna");
});

// Import/Export
$("#exportBtn").addEventListener("click",()=>{
  const data={notes:notesInput.value,summary:$("#summary").innerHTML,qna:$("#qna").innerHTML};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="notes_data.json";a.click();
  URL.revokeObjectURL(url);
});
$("#importBtn").addEventListener("click",()=>{
  const input=document.createElement("input");input.type="file";input.accept="application/json";
  input.onchange=e=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=ev=>{
      const data=JSON.parse(ev.target.result);
      if(data.notes){notesInput.value=data.notes;localStorage.setItem("notes",data.notes);}
      if(data.summary){$("#summary").innerHTML=data.summary;localStorage.setItem("summary",data.summary);}
      if(data.qna){$("#qna").innerHTML=data.qna;localStorage.setItem("qna",data.qna);}
    };
    reader.readAsText(file);
  };
  input.click();
});
