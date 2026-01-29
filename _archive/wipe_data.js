const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function wipe() {
    console.log("🔥 Wiping ALL Timesheets...");

    // Delete in batches to avoid timeout?
    // Or just try a broad delete. "id is not null"
    const { error, count } = await supabase
        .from('timesheets')
        .delete({ count: 'exact' })
        .neq('id', 0); // Assuming integer ID > 0, or UUID. neq 0 is usually a safe "Delete All" for Supabase if no PK arg.

    // Standard "Delete All" in Supabase client usually requires a filter.
    // .or('id.neq.0') ?
    // .gt('duration', -1) work before?

    if (error) {
        console.error("❌ Wipe Error:", error);
    } else {
        console.log(`✅ Deleted rows. Error: ${error}`);
    }

    // Verify
    const { count: finalCount } = await supabase.from('timesheets').select('*', { count: 'exact', head: true });
    console.log(`📉 Count after wipe: ${finalCount}`);
}

wipe();
