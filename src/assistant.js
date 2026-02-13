import { QA } from "./assistant_knowledge.js";

window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("assistantInput");
    const sendBtn = document.getElementById("assistantSend");
    const messages = document.getElementById("assistantMessages");

    if (!input || !sendBtn || !messages) return;

    function isYes(qNorm) {
        return ["yes", "y", "yeah", "yep", "sure", "ok", "okay", "please", "correct"].includes(qNorm);
    }
    function isNo(qNorm) {
        return ["no", "n", "nope", "nah"].includes(qNorm);
    }

    // ===== Memory (so follow-ups like "tell me more" work) =====
    let lastIntentId = null;
    let pending = null; // { type: "choose_topic" }

    // ===== Chat-only scrolling (will NOT move the page) =====
    function scrollChatToBottom(smooth = true) {
        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: smooth ? "smooth" : "auto",
        });
    }

    function scrollChatToMessageTop(el, smooth = true, topPadding = 8) {
        const containerRect = messages.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const currentOffsetInside = elRect.top - containerRect.top;
        const targetScrollTop = messages.scrollTop + currentOffsetInside - topPadding;

        messages.scrollTo({
            top: targetScrollTop,
            behavior: smooth ? "smooth" : "auto",
        });
    }

    function addMessage(text, type) {
        const msg = document.createElement("div");
        msg.className = `assistant-message assistant-message--${type}`;
        msg.textContent = text;
        messages.appendChild(msg);
        scrollChatToBottom(true);
        return msg;
    }

    // ===== Matching logic =====
    function normalize(s) {
        return (s || "")
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function scoreMatch(question, keywords) {
        const q = normalize(question);
        let score = 0;

        for (const k of keywords || []) {
            const kk = normalize(k);
            if (!kk) continue;

            if (q.includes(kk)) score += 3;

            for (const word of kk.split(" ")) {
                if (word.length > 2 && q.includes(word)) score += 1;
            }
        }

        return score;
    }

    function bestMatchFor(text) {
        let best = null;
        let bestScore = 0;

        for (const item of QA) {
            const s = scoreMatch(text, item.keywords);
            if (s > bestScore) {
                bestScore = s;
                best = item;
            }
        }

        return { best, bestScore };
    }

    function formatWithFollowups(item, baseText) {
        const followups = Array.isArray(item.followups) ? item.followups : [];
        if (!followups.length) return baseText;

        return baseText + "\n\nTry asking:\n• " + followups.slice(0, 4).join("\n• ");
    }

    function fallbackHelp() {
        return (
            "I can answer questions like:\n" +
            "• projects\n" +
            "• tech stack\n" +
            "• what roles is Juan looking for?\n" +
            "• how can I contact Juan?\n\n" +
            "Tip: you can also say “tell me more about AI Movie Assistant”."
        );
    }

    function localAnswer(question) {
        const qNorm = normalize(question);

        // --- Pending conversation state handling (THIS WAS MISSING) ---
        if (pending?.type === "choose_topic") {
            if (isYes(qNorm)) {
                return "Cool — type one: projects, tech stack, roles, or contact.";
            }
            if (isNo(qNorm)) {
                pending = null;
                return "No worries. You can ask about projects, tech stack, roles, or contact anytime.";
            }
            if (qNorm === "tech" || qNorm === "tech stack" || qNorm.includes("stack")) {
                question = "tech stack";
            }
            // Treat their reply as the topic (e.g. "projects", "stack", "contact")
            const { best, bestScore } = bestMatchFor(question);
            if (best && bestScore > 0) {
                pending = null;
                lastIntentId = best.id;
                return formatWithFollowups(best, best.answer);
            }

            return "I didn’t catch that. Try: projects, tech stack, roles, or contact.";
        }

        // --- Greeting / small talk ---
        const greetings = ["hi", "hello", "hey", "yo", "sup", "good morning", "good afternoon", "good evening"];
        if (greetings.includes(qNorm)) {
            pending = { type: "choose_topic" };

            return (
                "Hey! I’m Juan’s virtual assistant. What would you like to know?\n\n" +
                "Type one:\n" +
                "• projects\n" +
                "• tech stack\n" +
                "• roles\n" +
                "• contact"
            );
        }

        // If the message is super short and not meaningful, guide gently
        if (qNorm.length <= 2) {
            return "Try: projects, tech stack, roles, or contact.";
        }

        // --- A) Handle: "tell me more about X" ---
        const about = qNorm.match(/\b(tell me more about|more about|details about|explain)\s+(.+)\b/);
        if (about && about[2]) {
            const topic = about[2].trim();
            const { best, bestScore } = bestMatchFor(topic);

            if (best && bestScore > 0) {
                pending = null;
                lastIntentId = best.id;
                const detailed = best.details || best.answer;
                return formatWithFollowups(best, detailed);
            }

            return "I’m not sure which project/topic you mean. Try: “AI Movie Assistant”, “Port Scanner”, or “Expense Tracker”.";
        }

        // --- B) Handle follow-up without topic: "tell me more" / "details" ---
        const isFollowup = ["tell me more", "more", "details", "expand", "explain", "go deeper"].some(
            (p) => qNorm === p || qNorm.includes(p)
        );

        if (isFollowup && lastIntentId) {
            const prev = QA.find((x) => x.id === lastIntentId);
            if (prev) {
                const detailed = prev.details || prev.answer;
                return formatWithFollowups(prev, detailed);
            }
        }

        // --- C) Normal match ---
        const { best, bestScore } = bestMatchFor(question);
        if (!best || bestScore <= 0) return fallbackHelp();

        pending = null;
        lastIntentId = best.id;
        return formatWithFollowups(best, best.answer);
    }

    // ===== Send handler =====
    async function handleSend() {
        const question = input.value.trim();
        if (!question) return;

        addMessage(question, "user");
        input.value = "";

        const thinking = document.createElement("div");
        thinking.className = "assistant-message assistant-message--bot";
        thinking.textContent = "Thinking...";
        messages.appendChild(thinking);
        scrollChatToBottom(true);

        try {
            await new Promise((r) => setTimeout(r, 180));
            const answer = localAnswer(question);
            thinking.textContent = answer;

            // Show the answer clearly (chat-only)
            scrollChatToMessageTop(thinking, true, 10);
        } catch (err) {
            thinking.textContent = "Sorry, something went wrong.";
            console.error(err);
            scrollChatToBottom(true);
        }
    }

    sendBtn.addEventListener("click", handleSend);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSend();
    });
});
