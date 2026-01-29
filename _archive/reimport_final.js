const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// --- CONFIGURATION ---
const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";
const FILE_PATH = 'PENNYLANE_THEOMA_Timesheets.xlsx';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function cleanString(str) {
    if (!str) return '';
    return str.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]/g, "");
}

// LEGACY FORMAT since we can't write to DB
function formatEmail(name) {
    if (!name) return null;
    const firstName = name.split(' ')[0].toLowerCase().trim();
    const cleanName = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return `${cleanName}@theoma.fr`;
}

function excelDateToJSDate(serial) {
    if (!serial) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString();
}

async function main() {
    console.log("🚀 Démarrage de l'import FINAL (Active Only)...");

    const excelPath = path.join(__dirname, FILE_PATH);
    if (!fs.existsSync(excelPath)) {
        console.error("❌ Fichier Excel introuvable !");
        process.exit(1);
    }
    const workbook = xlsx.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    console.log(`📂 ${rows.length} lignes lues.`);

    // 4. CLEAR TIMESHEETS
    console.log("🗑️  Suppression des anciennes données timesheets...");
    const { error: delError } = await supabase
        .from('timesheets')
        .delete()
        .gte('duration', 0);

    if (delError) {
        console.error("❌ Erreur lors du nettoyage :", delError);
        process.exit(1);
    }

    // 5. PREPARE TIMESHEETS DATA
    const timestamp = new Date().toISOString();

    // Map with CORRECT schema
    const payload = rows.map(row => {
        const rawName = row['Collaborateur'];
        if (!rawName) return null;

        // Use LEGACY email format to match DB
        const email = formatEmail(rawName);

        let dateVal = null;
        const rawDate = row['Date'];
        if (rawDate) {
            if (typeof rawDate === 'number') {
                dateVal = excelDateToJSDate(rawDate);
            } else {
                const d = new Date(rawDate);
                if (!isNaN(d.getTime())) dateVal = d.toISOString();
            }
        }

        let billable = false;
        const rawBill = row['Facturable'];
        if (rawBill === true || String(rawBill).toLowerCase() === 'true' || String(rawBill).toLowerCase() === 'oui') {
            billable = true;
        }

        // Duration: Temps (h) vs Durée
        // Duration: Temps (h) vs Durée
        let durationMins = 0;

        if (row['Temps (h)'] !== undefined) {
            // Temps (h) is DECIMAL HOURS (e.g. 1.5)
            durationMins = Math.round(parseFloat(row['Temps (h)']) * 60);
        } else if (row['Durée'] !== undefined) {
            // Durée is ALREADY MINUTES (e.g. 90) -> Do not multiply by 60!
            durationMins = Math.round(parseFloat(row['Durée']));
        }

        return {
            date: dateVal,
            employee_email: email,
            client: row['Client'] || null,
            year: row['Millésime'] ? parseInt(row['Millésime']) : null,
            comment: row['Note'] || row['Commentaire'] || null, // Handle both
            code: row['Code'] ? String(row['Code']) : null,
            mission_type: row['Type de Mission'] || null,
            activity: row['Activité'] || null,
            duration: durationMins,
            billable: billable,
            product: row['Produit'] || null,
            quantity: row['Quantité'] || 0,
            billing_status: row['Statut de facturation'] || row['Etat'] || null
        };
    }).filter(p => p && p.date && p.employee_email); // Remove nulls

    console.log(`📦 ${payload.length} fiches de temps prêtes à être insérées.`);

    // 6. INSERT IN BATCHES
    const BATCH_SIZE = 100;
    for (let i = 0; i < payload.length; i += BATCH_SIZE) {
        const batch = payload.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('timesheets').insert(batch);

        if (error) {
            console.error(`❌ Erreur (Lot ${Math.floor(i / BATCH_SIZE) + 1}):`, error);
        } else {
            console.log(`Iter ${Math.min(i + BATCH_SIZE, payload.length)}/${payload.length} ok`);
        }
    }

    // ... (after import loop)
    console.log("🎉 Import terminé !");

    // Save Name Map for Frontend
    const nameMap = {};
    rows.forEach(r => {
        const name = r['Collaborateur'];
        if (name) {
            const email = formatEmail(name);
            if (email) nameMap[email] = name;
        }
    });
    fs.writeFileSync('employee_map.json', JSON.stringify(nameMap, null, 2));
    console.log("💾 Map des noms sauvegardée dans employee_map.json");
}

main();
