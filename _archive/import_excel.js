const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// --- CONFIG ---
const FILE_PATH = path.join(__dirname, 'PENNYLANE_THEOMA_Timesheets.xlsx');
// TODO: Replace with user's actual Supabase URL/KEY if they changed, or keep existing if valid
const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

function excelDateToJSDate(serial) {
    var utc_days = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0]; // YYYY-MM-DD
}

function formatEmail(name) {
    if (!name) return null;
    const firstName = name.split(' ')[0].toLowerCase().trim();
    const cleanName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${cleanName}@theoma.fr`;
}

async function runImport() {
    console.log("Lecture du fichier Excel...");
    const workbook = XLSX.readFile(FILE_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`${rows.length} lignes trouvées.`);

    // Whitelist provided by user
    const activeEmployees = [
        "alexia@theoma.fr", "alicia@theoma.fr", "alix@theoma.fr", "anne-cecile@theoma.fr",
        "anne-marie@theoma.fr", "arnaud@theoma.fr", "bertille@theoma.fr", "caroline@theoma.fr",
        "celia@theoma.fr", "charlotte@theoma.fr", "dorothee@theoma.fr", "hugo@theoma.fr",
        "kassandra@theoma.fr", "lise@theoma.fr", "margaux@theoma.fr", "marine@theoma.fr",
        "marion@theoma.fr", "melanie@theoma.fr", "natalie@theoma.fr", "nicolas@theoma.fr",
        "prune@theoma.fr", "randy@theoma.fr", "romain@theoma.fr", "stephanie@theoma.fr",
        // New employees added on user request (28/01)
        "anais@theoma.fr", "christ-leroy@theoma.fr", "coumba@theoma.fr", "fanny@theoma.fr",
        "kelly@theoma.fr", "laura@theoma.fr", "leila@theoma.fr", "nasteho@theoma.fr",
        "regis@theoma.fr", "sanadati@theoma.fr", "sandra@theoma.fr", "sarah@theoma.fr"
    ];

    const payload = rows.map(row => {
        // Safe conversions
        const dateVal = row['Date'] ? excelDateToJSDate(row['Date']) : null;
        let billable = false;
        if (row['Facturable'] === true || String(row['Facturable']).toLowerCase() === 'true') {
            billable = true;
        }

        return {
            date: dateVal,
            employee_email: formatEmail(row['Collaborateur']),
            client: row['Client'] || null,
            year: row['Millésime'] ? parseInt(row['Millésime']) : null,
            comment: row['Commentaire'] || null,
            code: row['Code'] ? String(row['Code']) : null,
            mission_type: row['Type de Mission'] || null,
            activity: row['Activité'] || null,
            duration: row['Durée'] || 0,
            billable: billable,
            product: row['Produit'] || null,
            quantity: row['Quantité'] || 0,
            billing_status: row['Statut de facturation'] || null
        };
    }).filter(p => {
        // Keep if valid date, email exists, AND email is in the active list
        return p.date && p.employee_email && activeEmployees.includes(p.employee_email);
    });

    console.log(`Préparation de ${payload.length} lignes à insérer...`);

    // Batch insert (Supabase limit is typically loose, but chunking is safer for large datasets)
    const CHUNK_SIZE = 1000;
    for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
        const chunk = payload.slice(i, i + CHUNK_SIZE);
        console.log(`Insertion lot ${i / CHUNK_SIZE + 1}...`);

        const { error } = await sbClient
            .from('timesheets')
            .insert(chunk);

        if (error) {
            console.error("Erreur d'import du lot:", error);
            // Break or continue? Let's stop to inspect.
            break;
        }
    }

    console.log("Import terminé !");
}

runImport();
