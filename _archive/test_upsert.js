const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("Testing Upsert...");
    const payload = [{
        email: "test.debug@theoma.fr",
        name: "Test Debug",
        role: "user"
    }];

    const { data, error } = await supabase
        .from('employees')
        .upsert(payload, { onConflict: 'email' })
        .select();

    if (error) {
        console.error("Upsert Error:", error);
    } else {
        console.log("Upsert Success:", data);

        // Cleanup
        await supabase.from('employees').delete().eq('email', 'test.debug@theoma.fr');
    }
}

run();
