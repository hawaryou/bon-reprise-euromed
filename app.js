const $=id=>document.getElementById(id);
let photos=[],generated={};

document.addEventListener("DOMContentLoaded",()=>{
 $("bonDate").value=new Date().toISOString().slice(0,10);
 $("bonNumber").value=makeNumber();
 addMaterial();
 $("addMaterial").onclick=addMaterial;
 $("anomalie").onchange=e=>$("photoArea").classList.toggle("hidden",!e.target.checked);
 document.querySelectorAll('input[name="motif"]').forEach(r=>r.onchange=()=>$("motifAutre").classList.toggle("hidden",r.value!=="Autre"||!r.checked));
 $("photoInput").onchange=handlePhotos;
 $("validateBtn").onclick=validate;
 $("resetBtn").onclick=()=>{if(confirm("Réinitialiser le bon ?"))location.reload()};
 $("downloadBtn").onclick=downloadPdf;
 $("sendBtn").onclick=sendEmail;
 $("closeModal").onclick=()=>$("resultModal").classList.add("hidden");
 document.querySelectorAll(".clear").forEach(b=>b.onclick=()=>clearSig($(b.dataset.target)));
 setupSig($("patientSignature"));setupSig($("technicianSignature"));
});
function makeNumber(){return`BR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`}
function addMaterial(){
 const tr=document.createElement("tr");
 tr.innerHTML=`<td><input class="m-nameperson" placeholder="Nom"></td><td><input class="m-qty" type="number" min="1" value="1"></td><td><input class="m-product" placeholder="Matériel repris"></td><td><input class="m-serial" placeholder="N° série / lot"></td><td><select class="m-state"><option>Bon état</option><option>À contrôler</option><option>Endommagé</option><option>Incomplet</option></select></td><td><button type="button" class="remove">×</button></td>`;
 tr.querySelector(".remove").onclick=()=>{if($("materials").children.length>1)tr.remove();else alert("Conservez au moins une ligne.");};
 $("materials").appendChild(tr);
}
function setupSig(c){
 const ctx=c.getContext("2d");let down=false,last=null;
 function resize(){const r=c.getBoundingClientRect(),d=devicePixelRatio||1;c.width=r.width*d;c.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);ctx.lineWidth=2;ctx.lineCap="round";ctx.strokeStyle="#173d58"}
 setTimeout(resize,50);addEventListener("resize",resize);
 const p=e=>{const r=c.getBoundingClientRect(),q=e.touches?e.touches[0]:e;return{x:q.clientX-r.left,y:q.clientY-r.top}};
 const start=e=>{e.preventDefault();down=true;last=p(e)},move=e=>{if(!down)return;e.preventDefault();const q=p(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(q.x,q.y);ctx.stroke();last=q},end=()=>down=false;
 c.onmousedown=start;c.onmousemove=move;addEventListener("mouseup",end);c.ontouchstart=start;c.ontouchmove=move;c.ontouchend=end;
}
function clearSig(id){const c=$(id);c.getContext("2d").clearRect(0,0,c.width,c.height)}
function hasSig(id){const c=$(id),d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>10)return true;return false}
async function handlePhotos(e){photos=[];$("photoPreview").innerHTML="";for(const f of e.target.files){const d=await imageData(f);photos.push(d);const im=document.createElement("img");im.src=d;$("photoPreview").appendChild(im)}}
function imageData(file){return new Promise(res=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const max=1400,s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.82))};im.src=fr.result};fr.readAsDataURL(file)})}
function data(){
 const materials=[...$("materials").children].map(r=>({name:r.querySelector(".m-nameperson").value,qty:r.querySelector(".m-qty").value,product:r.querySelector(".m-product").value,serial:r.querySelector(".m-serial").value,state:r.querySelector(".m-state").value}));
 let motif=document.querySelector('input[name="motif"]:checked')?.value||"";
 if(motif==="Autre")motif=$("motifAutre").value;
 return {number:$("bonNumber").value,date:$("bonDate").value,patient:{nom:$("patientNom").value,prenom:$("patientPrenom").value,adresse:$("patientAdresse").value,tel:$("patientTel").value,etab:$("patientEtab").value,email:$("patientEmail").value},materials,motif,anomaly:$("anomalie").checked,observations:$("observations").value,technician:$("technicien").value,patientSig:$("patientSignature").toDataURL(),techSig:$("technicianSignature").toDataURL(),photos}}
function validate(){
 const d=data();
 if(!d.patient.nom&&!d.patient.prenom)return alert("Renseignez le nom ou le prénom du patient.");
 if(d.materials.some(x=>!x.product))return alert("Renseignez la désignation de chaque matériel repris.");
 if(!d.technician)return alert("Renseignez le technicien EuroMed.");
 if(!hasSig("patientSignature")||!hasSig("technicianSignature"))return alert("Les deux signatures sont nécessaires.");
 $("status").textContent="Génération du PDF…";
 buildPdf(d).then(x=>{generated=x;$("resultText").textContent=`${x.filename} est prêt.`;$("resultModal").classList.remove("hidden");$("status").textContent=""}).catch(e=>{console.error(e);$("status").textContent="Erreur PDF";alert(e.message)})
}
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function fmt(s){const [y,m,d]=s.split("-");return`${d}/${m}/${y}`}
async function buildPdf(d){
 const {jsPDF}=window.jspdf,pdf=new jsPDF({unit:"mm",format:"a4"}),M=12,W=186,blue=[12,91,155],light=[237,246,252];
 let y=12;
 pdf.setFillColor(...blue);pdf.roundedRect(M,y,W,23,2,2,"F");pdf.setTextColor(255);pdf.setFont("helvetica","bold");pdf.setFontSize(19);pdf.text("EUROMED",M+5,y+9);pdf.setFontSize(15);pdf.text("BON DE REPRISE",M+63,y+9);pdf.setFont("helvetica","normal");pdf.setFontSize(7.5);pdf.text("Document de reprise — EuroMed",M+63,y+15);pdf.text(`Date : ${fmt(d.date)}`,M+143,y+8);pdf.text(`N° : ${d.number}`,M+143,y+14);y+=28;
 pdf.setTextColor(75);pdf.setFontSize(7.5);pdf.text("+33.327.64.34.99",M,y);pdf.text("www.euromed-materiel-medical.com",M+48,y);pdf.text("117 rue de Maubeuge F-59620 Aulnoye-Aymeries",M+105,y);y+=7;
 y=sec(pdf,"PATIENT / CLIENT",y,blue);
 y=fields(pdf,[["Nom",d.patient.nom],["Prénom",d.patient.prenom],["Adresse",d.patient.adresse],["Téléphone",d.patient.tel],["Établissement / service",d.patient.etab],["E-mail",d.patient.email]],y);
 y+=4;y=sec(pdf,"MATÉRIEL REPRIS",y,blue);
 pdf.setFillColor(...light);pdf.rect(M,y,W,8,"F");pdf.setTextColor(40);pdf.setFont("helvetica","bold");pdf.setFontSize(7);pdf.text("Nom",M+2,y+5);pdf.text("Qté",M+42,y+5);pdf.text("Dénomination du matériel repris",M+53,y+5);pdf.text("N° de série / lot",M+112,y+5);pdf.text("État",M+154,y+5);y+=8;pdf.setFont("helvetica","normal");
 d.materials.forEach(x=>{let a=[x.name,x.qty,x.product,x.serial,x.state],xs=[M+2,M+42,M+53,M+112,M+154],ws=[38,10,59,40,30],lines=a.map((v,i)=>pdf.splitTextToSize(v||"—",ws[i]-3)),h=Math.max(10,...lines.map(q=>q.length*3.5+4));if(y+h>278){pdf.addPage();y=15}pdf.rect(M,y,W,h);lines.forEach((q,i)=>pdf.text(q,xs[i],y+4));y+=h});
 y+=4;y=sec(pdf,"REPRISE",y,blue);pdf.setFontSize(8);pdf.setTextColor(40);pdf.setFont("helvetica","bold");pdf.text(d.motif||"Non renseigné",M,y+5);y+=10;
 y=sec(pdf,"ÉTAT / OBSERVATIONS",y,blue);pdf.setTextColor(...(d.anomaly?[201,54,54]:[29,155,104]));pdf.setFontSize(8);pdf.text(d.anomaly?"ANOMALIE OU DOMMAGE CONSTATÉ":"Aucune anomalie signalée",M,y+5);y+=8;pdf.setTextColor(40);pdf.setFont("helvetica","normal");let ol=pdf.splitTextToSize(d.observations||"Aucune observation.",W-4),oh=Math.max(17,ol.length*4+6);pdf.rect(M,y,W,oh);pdf.text(ol,M+2,y+5);y+=oh+4;
 if(d.photos.length){y=sec(pdf,"PHOTOS DE REPRISE",y,blue);for(const p of d.photos){if(y+56>278){pdf.addPage();y=15}pdf.addImage(p,"JPEG",M,y,72,50);y+=54}}
 if(y+70>278){pdf.addPage();y=15}y=sec(pdf,"RÉCEPTION DE LA REPRISE",y,blue);pdf.setFont("helvetica","normal");pdf.setFontSize(8);pdf.setTextColor(50);pdf.text("Le matériel indiqué ci-dessus a été repris par EuroMed à la date indiquée sur le présent document.",M,y+5);pdf.setFont("helvetica","bold");pdf.text(`Technicien EuroMed : ${d.technician}`,M,y+11);y+=16;
 y=sec(pdf,"SIGNATURES",y,blue);pdf.setFont("helvetica","normal");pdf.setFontSize(7);pdf.setTextColor(95);pdf.text("Je soussigné(e), reconnais avoir remis à EuroMed le matériel indiqué sur le présent bon de reprise.",M,y+5);y+=9;pdf.rect(M,y,88,48);pdf.rect(M+98,y,88,48);pdf.setFont("helvetica","bold");pdf.setTextColor(...blue);pdf.text("Signature du patient / représentant",M+2,y+6);pdf.text("Signature du technicien EuroMed",M+100,y+6);pdf.addImage(d.patientSig,"PNG",M+4,y+11,80,31);pdf.addImage(d.techSig,"PNG",M+102,y+11,80,31);
 pdf.setFont("helvetica","normal");pdf.setFontSize(6.5);pdf.setTextColor(100);pdf.text("EuroMed · +33.327.64.34.99 · www.euromed-materiel-medical.com · 117 rue de Maubeuge F-59620 Aulnoye-Aymeries",M,291);
 const filename=`Bon-de-reprise_EUROMED_${(d.patient.nom||"Patient").replace(/[^a-z0-9]/gi,"-")}_${d.date.split("-").reverse().join("-")}.pdf`;
 return{blob:pdf.output("blob"),base64:pdf.output("datauristring").split(",")[1],filename,data:d}
}
function sec(pdf,t,y,c){pdf.setFillColor(...c);pdf.roundedRect(12,y,186,7,1.5,1.5,"F");pdf.setTextColor(255);pdf.setFont("helvetica","bold");pdf.setFontSize(7.5);pdf.text(t,15,y+4.8);return y+11}
function fields(pdf,fs,y){let x=12;fs.forEach((f,i)=>{let w=i%2?88:88;if(i%2===0&&i>0){y+=13;x=12}else{x=i%2?110:12}pdf.setFont("helvetica","bold");pdf.setFontSize(7);pdf.setTextColor(100);pdf.text(f[0],x,y);pdf.setFont("helvetica","normal");pdf.setTextColor(40);pdf.text(pdf.splitTextToSize(f[1]||"—",w-3),x,y+4);if(i===fs.length-1)y+=13});return y}
function downloadPdf(){if(!generated.blob)return;const a=document.createElement("a");a.href=URL.createObjectURL(generated.blob);a.download=generated.filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
let sendWaiting=false;
let sendStarted=0;

function sendEmail(){
 if(!generated.base64)return;
 if(!CONFIG.APPS_SCRIPT_URL||CONFIG.APPS_SCRIPT_URL.includes("COLLE_ICI")){
   $("sendStatus").innerHTML='<span class="error">Configurez d’abord l’URL Google Apps Script du Bon de reprise dans config.js.</span>';
   return;
 }
 const d=generated.data;
 const btn=$("sendBtn");
 btn.disabled=true;
 btn.textContent="Envoi en cours…";
 $("sendStatus").textContent="Envoi en cours…";
 sendWaiting=true;
 sendStarted=Date.now();
 const frame=$("appsScriptSendFrame");
 frame.onload=()=>{ if(sendWaiting && Date.now()-sendStarted>400) finishSend(true,""); };
 const form=document.createElement("form");
 form.method="POST";
 form.action=CONFIG.APPS_SCRIPT_URL;
 form.target="appsScriptSendFrame";
 form.style.display="none";
 const fields={action:"send_reprise",filename:generated.filename,pdfBase64:generated.base64,internalEmail:CONFIG.INTERNAL_EMAIL,patientEmail:d.patient.email||"",data:JSON.stringify(d)};
 Object.entries(fields).forEach(([name,value])=>{const input=document.createElement("input");input.type="hidden";input.name=name;input.value=value;form.appendChild(input)});
 document.body.appendChild(form);
 try{form.submit();}catch(e){finishSend(false,"Impossible de contacter Google Apps Script.");return}
 form.remove();
 // Fallback : si le navigateur ne déclenche pas l’événement iframe, on considère l’envoi lancé après 8 s.
 setTimeout(()=>{if(sendWaiting)finishSend(true,"")},8000);
}

function finishSend(ok,error){
 if(!sendWaiting)return;
 sendWaiting=false;
 const btn=$("sendBtn");
 btn.disabled=false;
 if(ok){
   btn.textContent="✓ Envoyé";
   btn.classList.add("sent");
   $("sendStatus").innerHTML='<span class="success">✓ Envoyé</span>';
   $("status").textContent="Bon de reprise envoyé.";
   setTimeout(()=>{btn.textContent="📧 Envoyer maintenant";btn.classList.remove("sent")},4000);
 }else{
   btn.textContent="📧 Envoyer maintenant";
   $("sendStatus").innerHTML='<span class="error">Échec de l’envoi : '+esc(error||"Erreur inconnue.")+'</span>';
 }
}
