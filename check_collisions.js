const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const excelPath = path.join(__dirname, 'PENNYLANE_THEOMA_Timesheets.xlsx');

if (!fs.existsSync(excelPath)) {
    console.error("Fichier Excel introuvable:", excelPath);
    process.exit(1);
}

const workbook = xlsx.readFile(excelPath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const rows = xlsx.utils.sheet_to_json(sheet);

// Map generated email -> List of original names
const collisionMap = {};

function formatEmailOld(name) {
    if (!name) return null;
    const firstName = name.split(' ')[0].toLowerCase().trim();
    const cleanName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${cleanName}@theoma.fr`;
}

rows.forEach(row => {
    const rawName = row['Collaborateur'];
    if (!rawName) return;

    const email = formatEmailOld(rawName);
    if (!collisionMap[email]) {
        collisionMap[email] = new Set();
    }
    collisionMap[email].add(rawName);
});

console.log("Analyis of Name Collisions (First Name Only):");
let collisionCount = 0;
Object.entries(collisionMap).forEach(([email, names]) => {
    if (names.size > 1) {
        console.log(`\n⚠️  COLLISION DETECTED for ${email}:`);
        names.forEach(n => console.log(`   - ${n}`));
        collisionCount++;
    }
});

if (collisionCount === 0) {
    console.log("\nNo collisions found based on first name only.");
} else {
    console.log(`\nFound ${collisionCount} email addresses representing multiple people.`);
}
