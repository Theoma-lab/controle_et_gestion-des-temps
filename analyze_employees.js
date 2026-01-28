const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// 1. Load Excel
const filePath = path.join(__dirname, 'PENNYLANE_THEOMA_Timesheets.xlsx');
console.log(`Lecture du fichier : ${filePath}`);

if (!fs.existsSync(filePath)) {
    console.error("Erreur : Le fichier Excel est introuvable !");
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log(`${rows.length} lignes trouvées dans le fichier.`);

// 2. Active Whitelist
const activeEmployees = [
    "alexia@theoma.fr", "alicia@theoma.fr", "alix@theoma.fr", "anne-cecile@theoma.fr",
    "anne-marie@theoma.fr", "arnaud@theoma.fr", "bertille@theoma.fr", "caroline@theoma.fr",
    "celia@theoma.fr", "charlotte@theoma.fr", "dorothee@theoma.fr", "hugo@theoma.fr",
    "kassandra@theoma.fr", "lise@theoma.fr", "margaux@theoma.fr", "marine@theoma.fr",
    "marion@theoma.fr", "melanie@theoma.fr", "natalie@theoma.fr", "nicolas@theoma.fr",
    "prune@theoma.fr", "randy@theoma.fr", "romain@theoma.fr", "stephanie@theoma.fr"
];

// Helper
function formatEmail(name) {
    if (!name) return null;
    const firstName = name.split(' ')[0].toLowerCase().trim();
    const cleanName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${cleanName}@theoma.fr`;
}

// 3. Extract & Compare
const foundEmails = new Set();
const employeesInFile = new Set();

rows.forEach(row => {
    const rawName = row['Collaborateur'];
    if (rawName) {
        employeesInFile.add(rawName);
        const email = formatEmail(rawName);
        if (email) foundEmails.add(email);
    }
});

const foundList = Array.from(foundEmails).sort();
const reportLines = [];
reportLines.push(`\n--- Analyse ---`);
reportLines.push(`Collaborateurs uniques trouvés (générés) : ${foundList.length}`);

const formerEmployees = foundList.filter(email => !activeEmployees.includes(email));

if (formerEmployees.length > 0) {
    reportLines.push(`\n⚠️ ANCIENS COLLABORATEURS DÉTECTÉS (${formerEmployees.length}) :`);
    reportLines.push("(Ces personnes sont dans le fichier Excel mais PAS dans votre liste active)");
    formerEmployees.forEach(e => reportLines.push(` - ${e}`));
} else {
    reportLines.push("\n✅ Aucun ancien collaborateur détecté. Tous les emails correspondent à la liste active.");
}

const missingActive = activeEmployees.filter(email => !foundEmails.has(email));
if (missingActive.length > 0) {
    reportLines.push(`\nℹ️ Collaborateurs actifs SANS saisie dans ce fichier (${missingActive.length}) :`);
    missingActive.forEach(e => reportLines.push(` - ${e}`));
}

const output = reportLines.join('\n');
console.log(output);
fs.writeFileSync('analysis_report.txt', output, 'utf8');

