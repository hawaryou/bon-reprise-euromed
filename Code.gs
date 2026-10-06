/**
 * EuroMed — Bon de reprise
 * Apps Script INDEPENDANT du Bon de livraison.
 * Déployer comme Application Web, exécuter en tant que vous-même,
 * accès : Toute personne disposant du lien / Anyone.
 */
const DEFAULT_INTERNAL_EMAIL = "valentineuromed@gmail.com";

function doGet() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body style="font-family:Arial;padding:20px">EuroMed — service Bon de reprise opérationnel.</body></html>'
  );
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    if (p.action !== "send_reprise") throw new Error("Action inconnue.");
    if (!p.pdfBase64) throw new Error("PDF manquant.");

    const filename = p.filename || "Bon-de-reprise-Euromed.pdf";
    const blob = Utilities.newBlob(
      Utilities.base64Decode(p.pdfBase64),
      MimeType.PDF,
      filename
    );

    let data = {};
    try { data = JSON.parse(p.data || "{}"); } catch (_) {}

    const internalEmail = String(p.internalEmail || DEFAULT_INTERNAL_EMAIL).trim();
    const patientEmail = String(p.patientEmail || "").trim();
    const patient = data.patient || {};
    const patientName = [patient.prenom, patient.nom].filter(Boolean).join(" ") || "Patient";
    const subject = "Bon de reprise EuroMed — " + (data.number || filename);

    const htmlBody =
      "<div style='font-family:Arial,sans-serif'>" +
      "<h2 style='color:#1769aa'>Bon de reprise EuroMed</h2>" +
      "<p><b>Patient :</b> " + escapeHtml_(patientName) + "</p>" +
      "<p><b>N° du bon :</b> " + escapeHtml_(data.number || "") + "</p>" +
      "<p><b>Date :</b> " + escapeHtml_(data.date || "") + "</p>" +
      "<p>Vous trouverez le bon de reprise signé en pièce jointe.</p>" +
      "<p>EUROMED<br>117 rue de Maubeuge<br>F-59620 Aulnoye-Aymeries<br>+33.327.64.34.99</p>" +
      "</div>";

    const recipients = [];
    if (internalEmail) recipients.push(internalEmail);
    if (patientEmail && patientEmail.toLowerCase() !== internalEmail.toLowerCase()) recipients.push(patientEmail);
    if (!recipients.length) throw new Error("Aucun destinataire.");

    recipients.forEach(function(email) {
      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: htmlBody,
        attachments: [blob],
        name: "EuroMed"
      });
    });

    return response_(true, "");
  } catch (err) {
    return response_(false, String(err && err.message ? err.message : err));
  }
}

function response_(ok, error) {
  const payload = JSON.stringify({type:"euromed-reprise-send",ok:ok,error:error||""});
  const html = '<!doctype html><html><body><script>' +
    'window.parent.postMessage(' + payload + ', "*");' +
    '</script></body></html>';
  return HtmlService.createHtmlOutput(html);
}

function escapeHtml_(s) {
  return String(s || "").replace(/[&<>"']/g, function(c) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c];
  });
}
