const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'PENNYLANE_THEOMA_Timesheets.xlsx');

try {
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const employees = new Set();
    rows.forEach(row => {
        if (row['Collaborateur']) {
            employees.add(row['Collaborateur'].trim());
        }
    });

    const sortedEmployees = Array.from(employees).sort();

    const fs = require('fs');
    const outputPath = path.join(__dirname, 'employees.txt');

    let output = "Liste des employés trouvés :\n";
    output += "----------------------------\n";
    sortedEmployees.forEach(emp => output += emp + "\n");
    output += "----------------------------\n";
    output += `Total: ${sortedEmployees.length} employés\n`;

    fs.writeFileSync(outputPath, output, 'utf8');
    console.log("Fichier employees.txt généré avec succès.");

} catch (err) {
    console.error("Erreur:", err.message);
}
