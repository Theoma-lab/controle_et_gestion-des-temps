const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const sbClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRead() {
    console.log("Test de lecture sur la table 'timesheets'...");
    const { data, error } = await sbClient
        .from('timesheets')
        .select('*')
        .limit(5);

    if (error) {
        console.error("Erreur de lecture (probablement RLS) :", error.message);
        console.log("Code:", error.code);
    } else {
        console.log("Lecture réussie !");
        console.log(`${data.length} lignes récupérées.`);
        console.log("Exemple:", data[0]);
    }
}

testRead();
