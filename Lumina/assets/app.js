// ===== llumina Production Config =====
const SUPABASE_URL = "https://eufyjhghzsjcobcmhlfa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RqFecRbooAkyilPvdFmrdg_IbbYcIPr";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("waitlist-form");
const emailInput = document.getElementById("email-input");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");
const hpField = document.getElementById("website-hp");

function setStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.className = `text-[11px] text-center min-h-[1.25rem] mt-4 font-bold uppercase tracking-tight ${isError ? "text-red-500" : "text-zinc-400"}`;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    // 1. HONEYPOT CHECK (Stops basic bot spam)
    if (hpField.value !== "") return; 

    const email = emailInput.value.trim().toLowerCase();

    // 2. COOLDOWN CHECK (Stops clicking-spam)
    const lastSub = localStorage.getItem("llumina_waitlist_attempt");
    const now = Date.now();
    if (lastSub && (now - lastSub) < 15000) { // 15 second delay
        setStatus("Slow down. Please wait a moment.", true);
        return;
    }

    // 3. EMAIL VALIDATION
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setStatus("Invalid email format.", true);
        return;
    }

    // 4. PREPARE UI
    submitBtn.disabled = true;
    submitBtn.textContent = "Joining...";

    try {
        const { error } = await db.from("waitlist").insert({
            email: email,
            source: "llumina-waitlist-2026"
        });

        // Save attempt time to trigger cooldown regardless of result
        localStorage.setItem("llumina_waitlist_attempt", Date.now());

        if (!error) {
            // SUCCESS: Redirect using absolute path
            window.location.href = "/lumina/thank-you/";
            return;
        }

        // 5. HANDLE DUPLICATES & ERRORS
        if (error.code === "23505") {
            setStatus("You are already on the list.");
        } else {
            console.error(error.message);
            setStatus("Something went wrong.", true);
        }

    } catch (err) {
        setStatus("Network error. Try again.", true);
    } finally {
        // Re-enable button after a small delay to prevent double-firing
        setTimeout(() => {
            if (statusEl.textContent !== "") {
                submitBtn.disabled = false;
                submitBtn.textContent = "Join Waitlist";
            }
        }, 2000);
    }
});
