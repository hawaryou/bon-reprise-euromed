/**
 * EUROMED — Apps Script INDEPENDANT du Bon de reprise
 *
 * Ce script ne gère QUE le Bon de reprise.
 * Il est volontairement séparé du script du Bon de livraison.
 *
 * Déploiement :
 * 1. Créer un nouveau projet Google Apps Script.
 * 2. Remplacer Code.gs par ce fichier.
 * 3. Déployer > Nouveau déploiement > Application Web.
 * 4. Exécuter en tant que : Moi.
 * 5. Qui a accès : Tout le monde.
 * 6. Copier l'URL /exec dans config.js.
 */

const DEFAULT_INTERNAL_EMAIL = "valentineuromed@gmail.com";

function doGet() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><body><script>document.body.textContent="EuroMed — service Bon de reprise actif";</script></body></html>'
  );
}

function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    if (p.action !== "send_reprise") {
      return responsePage_(false, "Action inconnue.");
    }

    const filename = p.filename || "Bon-de-reprise-Euromed.pdf";
    const pdfBase64 = String(p.pdfBase64 || "").trim();
    if (!pdfBase64) throw new Error("PDF manquant.");

    const data = p.data ? JSON.parse(p.data) : {};
    const blob = Utilities.newBlob(
      Utilities.base64Decode(pdfBase64),
      MimeType.PDF,
      filename
    );

    const internalEmail = String(p.internalEmail || DEFAULT_INTERNAL_EMAIL).trim();
    const patientEmail = String(p.patientEmail || "").trim();
    const patient = data.patient || {};
    const patientName = [patient.prenom, patient.nom].filter(Boolean).join(" ") || "Patient";
    const bonNumber = data.number || data.bonNumber || "";
    const subject = "Bon de reprise EuroMed — " + (bonNumber || filename);

    const htmlBody =
      "<div style='font-family:Arial,sans-serif'>" +
      "<h2 style='color:#1769aa'>Bon de reprise EuroMed</h2>" +
      "<p><b>Patient :</b> " + escapeHtml_(patientName) + "</p>" +
      "<p><b>N° du bon :</b> " + escapeHtml_(bonNumber) + "</p>" +
      "<p><b>Date :</b> " + escapeHtml_(data.date || "") + "</p>" +
      "<p>Vous trouverez le bon de reprise signé en pièce jointe.</p>" +
      "<p>EUROMED<br>117 rue de Maubeuge<br>F-59620 Aulnoye-Aymeries<br>+33.327.64.34.99</p>" +
      "</div>";

    const recipients = [];
    if (internalEmail) recipients.push(internalEmail);
    if (patientEmail && patientEmail.toLowerCase() !== internalEmail.toLowerCase()) {
      recipients.push(patientEmail);
    }
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

    return responsePage_(true, "");
  } catch (err) {
    return responsePage_(false, String(err && err.message ? err.message : err));
  }
}

function responsePage_(ok, error) {
  const payload = JSON.stringify({
    type: "euromed-reprise-send",
    ok: !!ok,
    error: error || ""
  });

  const safe = payload.replace(/\\/g, "\\\\").replace(/</g, "\\u003c");
  const html =
    "<!doctype html><html><body><script>" +
    "window.parent.postMessage(" + safe + ", '*');" +
    "</script></body></html>";

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function escapeHtml_(s) {
  return String(s || "").replace(/[&<>\"']/g, function(c) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c];
  });
}
