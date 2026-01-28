const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://xvqwgndjznvewqgalpaq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2cXdnbmRqem52ZXdxZ2FscGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MjA4NTMsImV4cCI6MjA4NDk5Njg1M30.TlnYV7VgsmV7kOsGlRoFdInLhie8TnLnGOpLMe411ZA";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function clean() {
    console.log("🧹 Desintegrating all ghosts...");

    const patterns = ['__PROBE__', '__PROBE_CHECK__', '__PROBE_DEBUG__'];

    for (const p of patterns) {
        const { error, count } = await supabase
            .from('timesheets')
            .delete({ count: 'exact' })
            .eq('comment', p);

        if (error) console.error(`Error deleting ${p}:`, error);
        else console.log(`Deleted ${count} rows with comment '${p}'`);
    }

    // Safety catch-all using like logic if possible, but exact match is safer for now as I know the keys.
    // __PROBE% is not easily doable with simple delete without filtering, but iterating known keys is fine.

    console.log("✨ Cleanup complete.");
}

clean();
