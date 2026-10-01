const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function todayISO(){ return new Date().toISOString().slice(0,10); }
function makeNumber(){
  const d = new Date(), y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0");
  const key=`euromed-reprise-${y}${m}${day}`;
  const n=(Number(localStorage.getItem(key)||0)+1); localStorage.setItem(key,n);
  return `BR-${y}${m}${day}-${String(n).padStart(3,"0")}`;
}
$("#dateBon").value=todayISO(); $("#bonNumero").value=makeNumber();

function addMaterial(data={}){
  const wrap=document.createElement("div"); wrap.className="material";
  wrap.innerHTML=`
    <div class="material-head"><div class="material-num">Matériel <span class="mat-index"></span></div><button class="remove" type="button">Supprimer</button></div>
    <div class="material-grid">
      <label>Désignation<input class="designation" placeholder="Ex. Lit médicalisé" value="${esc(data.designation||"")}"></label>
      <label>N° de série / lot<input class="serie" placeholder="Ex. SN123456" value="${esc(data.serie||"")}"></label>
      <label>État<select class="etat"><option>Bon état</option><option>À contrôler</option><option>Endommagé</option><option>Incomplet</option></select></label>
      <label>Accessoires repris<input class="accessoires" placeholder="Ex. potence, barrières..." value="${esc(data.accessoires||"")}"></label>
    </div>`;
  $("#materials").appendChild(wrap);
  if(data.etat) wrap.querySelector(".etat").value=data.etat;
  wrap.querySelector(".remove").onclick=()=>{wrap.remove(); refreshIndexes();};
  refreshIndexes();
}
function refreshIndexes(){ $$(".material").forEach((x,i)=>x.querySelector(".mat-index").textContent=i+1); }
function esc(s){return String(s).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
addMaterial();
$("#addMaterial").onclick=()=>addMaterial();

$$('input[name="motif"]').forEach(x=>x.addEventListener("change",()=>$("#motifAutreWrap").classList.toggle("hidden",x.value!=="Autre")));
$("#anomalie").onchange=()=>$("#photosArea").classList.toggle("hidden",!$("#anomalie").checked);

$("#photos").onchange=()=>{
 const p=$("#photoPreview"); p.innerHTML="";
 [...$("#photos").files].forEach(file=>{const r=new FileReader();r.onload=e=>{const img=document.createElement("img");img.src=e.target.result;p.appendChild(img)};r.readAsDataURL(file)});
};

function setupSignature(canvas){
 const ctx=canvas.getContext("2d"); let drawing=false;
 const resize=()=>{const ratio=window.devicePixelRatio||1, rect=canvas.getBoundingClientRect(), old=canvas.toDataURL(); canvas.width=rect.width*ratio;canvas.height=rect.height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.lineWidth=2;ctx.lineCap="round";ctx.strokeStyle="#18324a"; if(old && old!=="data:,"){const im=new Image();im.onload=()=>ctx.drawImage(im,0,0,rect.width,rect.height);im.src=old}};
 resize(); window.addEventListener("resize",resize);
 const pos=e=>{const r=canvas.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return [t.clientX-r.left,t.clientY-r.top]};
 const start=e=>{drawing=true;const [x,y]=pos(e);ctx.beginPath();ctx.moveTo(x,y);e.preventDefault()};
 const move=e=>{if(!drawing)return;const [x,y]=pos(e);ctx.lineTo(x,y);ctx.stroke();e.preventDefault()};
 const end=()=>drawing=false;
 canvas.addEventListener("pointerdown",start);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",end);canvas.addEventListener("pointerleave",end);
 return {clear:()=>ctx.clearRect(0,0,canvas.width,canvas.height),data:()=>canvas.toDataURL("image/png")};
}
const sigs={patient:setupSignature($("#sigPatient")),technicien:setupSignature($("#sigTechnicien"))};
$$(".clearSig").forEach(b=>b.onclick=()=>sigs[b.dataset.target==="sigPatient"?"patient":"technicien"].clear());

function getData(){
 const motif=$('input[name="motif"]:checked')?.value||"";
 return {
  numero:$("#bonNumero").value,date:$("#dateBon").value,
  patient:{nom:$("#nom").value.trim(),prenom:$("#prenom").value.trim(),telephone:$("#telephone").value.trim(),etablissement:$("#etablissement").value.trim(),adresse:$("#adresse").value.trim()},
  materiels:$$(".material").map(x=>({designation:x.querySelector(".designation").value.trim(),serie:x.querySelector(".serie").value.trim(),etat:x.querySelector(".etat").value,accessoires:x.querySelector(".accessoires").value.trim()})),
  motif:motif==="Autre"?$("#motifAutre").value.trim():""+motif,
  observations:$("#observations").value.trim(),anomalie:$("#anomalie").checked,
  signatures:{patient:sigs.patient.data(),technicien:sigs.technicien.data()},
  attestation:$("#attestation").checked
 };
}
function validateData(d){
 if(!d.patient.nom) return "Veuillez renseigner le nom du patient / client.";
 if(!d.materiels.length || d.materiels.some(m=>!m.designation)) return "Veuillez renseigner la désignation de chaque matériel.";
 if(!d.signatures.patient || !d.signatures.technicien) return "Les deux signatures sont nécessaires.";
 if(!d.attestation) return "Veuillez cocher l'attestation avant validation.";
 return "";
}
function showStatus(msg,ok=false){$("#status").textContent=msg;$("#status").className="status "+(ok?"ok":"error");$("#status").classList.remove("hidden");window.scrollTo({top:document.body.scrollHeight,behavior:"smooth"});}

async function buildPDF(){
 const d=getData(); const {jsPDF}=window.jspdf; const pdf=new jsPDF({unit:"mm",format:"a4"});
 const M=14; let y=15;
 pdf.setFillColor(20,120,212);pdf.roundedRect(M,y,44,14,3,3,"F");
 pdf.setTextColor(255);pdf.setFontSize(16);pdf.setFont("helvetica","bold");pdf.text("EUROMED",M+5,y+9);
 pdf.setTextColor(24,50,74);pdf.setFontSize(18);pdf.text("BON DE REPRISE",M+55,y+7);
 pdf.setFontSize(9);pdf.setFont("helvetica","normal");pdf.text(`N° ${d.numero}`,M+55,y+12);pdf.text(`Date : ${formatDate(d.date)}`,150,y+12);y+=23;
 section(pdf,"PATIENT / CLIENT",M,y); y+=7; 
 pdf.setFontSize(10); line(pdf,`Nom : ${d.patient.nom} ${d.patient.prenom}`,M,y); line(pdf,`Téléphone : ${d.patient.telephone||"—"}`,110,y);y+=6;
 line(pdf,`Établissement / service : ${d.patient.etablissement||"—"}`,M,y);y+=6;line(pdf,`Adresse : ${d.patient.adresse||"—"}`,M,y);y+=9;
 section(pdf,"MATÉRIEL REPRIS",M,y);y+=7;
 d.materiels.forEach((m,i)=>{ 
   const h=22;pdf.setDrawColor(210);pdf.roundedRect(M,y,182,h,2,2,"S");
   pdf.setFont("helvetica","bold");pdf.setFontSize(10);pdf.setTextColor(20,90,150);pdf.text(`${i+1}. ${m.designation||"Matériel"}`,M+4,y+6);
   pdf.setFont("helvetica","normal");pdf.setTextColor(30);pdf.setFontSize(8.5);pdf.text(`N° série / lot : ${m.serie||"—"}`,M+4,y+12);pdf.text(`État : ${m.etat}`,M+90,y+12);pdf.text(`Accessoires : ${m.accessoires||"—"}`,M+4,y+18);y+=h+4;
 });
 section(pdf,"MOTIF DE REPRISE",M,y);y+=7;pdf.setFontSize(10);pdf.text(d.motif||"Non précisé",M,y);y+=9;
 section(pdf,"OBSERVATIONS",M,y);y+=7;pdf.setFontSize(9);const obs=d.observations||"Aucune observation.";const lines=pdf.splitTextToSize(obs,175);pdf.text(lines,M,y);y+=Math.max(12,lines.length*4.5);
 if(d.anomalie){pdf.setFillColor(255,241,239);pdf.setDrawColor(232,120,110);pdf.roundedRect(M,y,182,10,2,2,"FD");pdf.setTextColor(180,50,40);pdf.setFont("helvetica","bold");pdf.text("ANOMALIE / MATÉRIEL ENDOMMAGÉ : photos jointes au dossier",M+4,y+6);pdf.setTextColor(30);y+=15}
 if(y>230){pdf.addPage();y=18}
 section(pdf,"SIGNATURES",M,y);y+=7;pdf.setFont("helvetica","normal");pdf.setFontSize(9);pdf.text("Patient / représentant",M,y);pdf.text("Technicien EuroMed",110,y);y+=2;
 try{pdf.addImage(d.signatures.patient,"PNG",M,y,82,38);pdf.addImage(d.signatures.technicien,"PNG",110,y,82,38)}catch(e){}
 y+=44;pdf.setFontSize(8);pdf.setTextColor(100);pdf.text("Le présent document atteste de la remise du matériel indiqué ci-dessus.",M,y);
 pdf.setDrawColor(210);pdf.line(M,285,196,285);pdf.setFontSize(7);pdf.text("EuroMed — 117 rue de Maubeuge F-59620 Aulnoye-Aymeries — +33.327.64.34.99 — www.euromed-materiel-medical.com",M,290);
 return {pdf,data:d};
}
function section(pdf,t,x,y){pdf.setFillColor(234,245,255);pdf.roundedRect(x,y,182,7,2,2,"F");pdf.setFont("helvetica","bold");pdf.setFontSize(9);pdf.setTextColor(7,85,163);pdf.text(t,x+4,y+4.8)}
function line(pdf,t,x,y){pdf.setTextColor(30);pdf.setFont("helvetica","normal");pdf.setFontSize(9);pdf.text(t,x,y)}
function formatDate(s){if(!s)return "—";const [y,m,d]=s.split("-");return `${d}/${m}/${y}`}

$("#previewBtn").onclick=async()=>{try{const {pdf}=await buildPDF();pdf.autoPrint();window.open(pdf.output("bloburl"),"_blank")}catch(e){showStatus("Impossible de générer l'aperçu : "+e.message)}};

$("#validateBtn").onclick=async()=>{
 const d=getData(), err=validateData(d); if(err){showStatus(err);return}
 try{
   const {pdf}=await buildPDF();
   const filename=`Bon-de-reprise_EUROMED_${(d.patient.nom||"patient").replace(/[^a-z0-9]/gi,"_")}_${d.date}.pdf`;
   pdf.save(filename);
   if(CONFIG.APPS_SCRIPT_URL){
     showStatus("PDF généré. Envoi à EuroMed en cours…",true);
     const payload={...d,pdfBase64:pdf.output("datauristring"),filename};
     const r=await fetch(CONFIG.APPS_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
     if(!r.ok) throw new Error("Le serveur d'envoi a répondu avec une erreur.");
     showStatus("Reprise validée et PDF envoyé avec succès.",true);
   }else showStatus("Reprise validée. Le PDF a été téléchargé. Configure CONFIG.APPS_SCRIPT_URL pour activer l'envoi automatique.",true);
 }catch(e){showStatus("Le bon a été généré localement, mais l'envoi automatique a échoué : "+e.message)}
};

$("#resetBtn").onclick=()=>{if(confirm("Créer un nouveau bon ? Les données actuelles seront effacées.")) location.reload();};
