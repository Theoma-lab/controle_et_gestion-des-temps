const { createClient } = require('@supabase/supabase-js');

// Config
const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const newEmployees = [
    "anais@theoma.fr", "christ-leroy@theoma.fr", "coumba@theoma.fr", "fanny@theoma.fr",
    "kelly@theoma.fr", "laura@theoma.fr", "leila@theoma.fr", "nasteho@theoma.fr",
    "regis@theoma.fr", "sanadati@theoma.fr", "sandra@theoma.fr", "sarah@theoma.fr"
];

async function insertEmployees() {
    console.log(`Préparation de l'insertion de ${newEmployees.length} employés...`);

    const payload = newEmployees.map(email => ({
        email: email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1), // Basic name gen
        role: 'user' // Default role
    }));

    // Using upsert just in case they exist
    const { data, error } = await supabase
        .from('employees')
        .upsert(payload, { onConflict: 'email' })
        .select();

    if (error) {
        console.error("Erreur lors de l'insertion des employés :", error);
    } else {
        console.log("Succès ! Employés insérés/mis à jour :", data.length);
    }
}

insertEmployees();
