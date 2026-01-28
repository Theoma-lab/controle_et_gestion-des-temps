const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error selecting:", error);
    } else {
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("Table is empty, cannot inspect columns easily via Select *.");
        }
    }
}

inspect();
