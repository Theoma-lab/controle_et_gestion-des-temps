const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function clean() {
    console.log("🧹 Force Cleaning...");

    while (true) {
        // Fetch chunk of IDs
        const { data, error } = await supabase.from('timesheets').select('id').limit(5000);

        if (error) { console.error("Fetch Error", error); break; }
        if (!data || data.length === 0) {
            console.log("✅ Database Empty.");
            break;
        }

        const ids = data.map(r => r.id);
        console.log(`🗑️ Deleting ${ids.length} rows...`);

        const { error: delError } = await supabase.from('timesheets').delete().in('id', ids);

        if (delError) { console.error("Delete Error", delError); break; }

        // Short pause
        await new Promise(r => setTimeout(r, 200));
    }
}

clean();
