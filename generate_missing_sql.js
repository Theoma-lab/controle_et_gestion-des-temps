const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_FILE = 'PENNYLANE_THEOMA_Timesheets.xlsx';
const AUDIT_FILE = 'audit_report.json';

// Legacy format function matches my other scripts
function formatEmail(name) {
    if (!name) return null;
    const firstName = name.split(' ')[0].toLowerCase().trim();
    const cleanName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${cleanName}@theoma.fr`;
}

function main() {
    // 1. Read Excel
    const workbook = xlsx.readFile(path.join(__dirname, EXCEL_FILE));
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // 2. Extract All Employees from Excel
    const excelEmployees = new Map(); // email -> fullName
    rows.forEach(r => {
        const name = r['Collaborateur'];
        if (name) {
            const email = formatEmail(name);
            if (!excelEmployees.has(email)) {
                excelEmployees.set(email, name);
            }
        }
    });

    console.log(`Excel contains ${excelEmployees.size} unique employees.`);

    // 3. Read Active DB Employees (from Audit)
    let dbEmails = [];
    if (fs.existsSync(AUDIT_FILE)) {
        dbEmails = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
    } else {
        console.error("Audit file missing!");
        process.exit(1);
    }
    const dbSet = new Set(dbEmails);

    // 4. Find Missing
    const missing = [];
    excelEmployees.forEach((fullName, email) => {
        if (!dbSet.has(email)) {
            missing.push({ email, name: fullName });
        }
    });

    console.log(`Found ${missing.length} missing employees.`);

    // 5. Generate SQL
    if (missing.length > 0) {
        let sql = `-- Exécuter ce script dans l'éditeur SQL de Supabase pour ajouter les employés manquants\n\n`;
        sql += `INSERT INTO public.employees (email, name) VALUES\n`;

        const values = missing.map(m => {
            // Escape single quotes in names just in case
            const safeName = m.name.replace(/'/g, "''");
            return `('${m.email}', '${safeName}')`;
        });

        sql += values.join(',\n') + `\nON CONFLICT (email) DO NOTHING;`;

        fs.writeFileSync('missing_employees.sql', sql);
        console.log("SQL script generated: missing_employees.sql");
        console.log("Missing:", missing.map(m => m.name));
    } else {
        console.log("No missing employees found? Warning.");
    }
}

main();
