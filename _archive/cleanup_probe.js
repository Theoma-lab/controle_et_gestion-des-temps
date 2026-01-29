const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function clean() {
    console.log("Cleaning up __PROBE__ records...");

    // Check count first
    const { count, error: countError } = await supabase
        .from('timesheets')
        .select('*', { count: 'exact', head: true })
        .eq('comment', '__PROBE__');

    if (countError) {
        console.error("Error counting:", countError);
        return;
    }
    console.log(`Found ${count} PROBE records.`);

    if (count > 0) {
        const { error } = await supabase
            .from('timesheets')
            .delete()
            .eq('comment', '__PROBE__');

        if (error) {
            console.error("Delete failed:", error);
        } else {
            console.log("Cleanup successful.");
        }
    }
}

clean();
