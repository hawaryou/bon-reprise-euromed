/**
 * Google Apps Script — réception du Bon de reprise EuroMed
 * Déploiement : Web app / Exécuter en tant que vous / accès selon votre politique.
 *
 * Le projet GitHub envoie un JSON contenant pdfBase64.
 * Configure l'adresse email destinataire ci-dessous.
 */
const DESTINATAIRE = ""; // ex. "maintenance@euromed-materiel-medical.com"

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const base64 = String(data.pdfBase64 || "").split(",").pop();
    if (!base64) throw new Error("PDF absent");

    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      MimeType.PDF,
      data.filename || "Bon-de-reprise-Euromed.pdf"
    );

    const p = data.patient || {};
    const sujet = `Bon de reprise EuroMed — ${data.numero || ""}`;
    const corps =
      "Bonjour,\n\n" +
      "Veuillez trouver ci-joint le bon de reprise EuroMed.\n\n" +
      `N° : ${data.numero || ""}\n` +
      `Date : ${data.date || ""}\n` +
      `Patient : ${p.nom || ""} ${p.prenom || ""}\n` +
      `Motif : ${data.motif || ""}\n\n` +
      "Cordialement,\nEuroMed";

    if (DESTINATAIRE) {
      MailApp.sendEmail({
        to: DESTINATAIRE,
        subject: sujet,
        body: corps,
        attachments: [blob]
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({ok:true, message:"Bon reçu"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok:false, error:String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
