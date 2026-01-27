const fs = require('fs');
const path = require('path');

const employeesListPath = path.join(__dirname, 'employees.txt');

function formatEmail(name) {
    if (!name) return "unknown@theoma.fr";
    // "Alix Sonam" -> "alix"
    const firstName = name.split(' ')[0].toLowerCase().trim();
    // Remove accents
    const cleanName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${cleanName}@theoma.fr`;
}

try {
    const content = fs.readFileSync(employeesListPath, 'utf8');
    const lines = content.split('\n');
    let started = false;

    let output = "Vérification des emails générés :\n";
    output += "Nom complet  ->  Email généré\n";
    output += "-----------------------------------\n";

    lines.forEach(line => {
        if (line.includes('----') && !started) {
            started = true;
            return;
        }
        if (line.includes('Total:')) started = false;

        if (started && line.trim() && !line.includes('----')) {
            const name = line.trim();
            const email = formatEmail(name);
            output += `${name.padEnd(25)} -> ${email}\n`;
        }
    });

    fs.writeFileSync(path.join(__dirname, 'emails_check.txt'), output, 'utf8');
    console.log("Fichier emails_check.txt généré.");

} catch (err) {
    console.error("Erreur:", err.message);
}
