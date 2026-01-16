// ===== CONFIG =====
const SUPABASE_URL = "https://eufyjhghzsjcobcmhlfa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RqFecRbooAkyilPvdFmrdg_IbbYcIPr";
const SOURCE = "llumina-waitlist-2026";
// ==================

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("waitlist-form");
const emailInput = document.getElementById("email-input");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("status");

function setStatus(msg, isError = false) {
    statusEl.textContent = msg;
    statusEl.className = `text-[11px] text-center min-h-[1.25rem] mt-4 font-bold uppercase tracking-tight ${isError ? "text-red-500" : "text-zinc-400"}`;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    const email = emailInput.value.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setStatus("Invalid email format.", true);
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Joining...";

    try {
        const { error } = await db.from("waitlist").insert({
            email: email,
            source: SOURCE
        });

        if (!error) {
            window.location.href = "/thank-you/";
            return;
        }

        if (error.code === "23505") {
            setStatus("You're already on the list.");
        } else {
            setStatus("Error: " + error.message, true);
        }

    } catch (err) {
        setStatus("Network error. Try again.", true);
    } finally {
        if (statusEl.textContent !== "") {
            submitBtn.disabled = false;
            submitBtn.textContent = "Join Waitlist";
        }
    }
});