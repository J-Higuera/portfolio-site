import { QA } from "./assistant_knowledge.js";

window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("assistantInput");
    const sendBtn = document.getElementById("assistantSend");
    const messages = document.getElementById("assistantMessages");

    if (!input || !sendBtn || !messages) return;

    function addMessage(text, type) {
        const msg = document.createElement("div");
        msg.className = `assistant-message assistant-message--${type}`;
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

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

        for (const k of keywords) {
            const kk = normalize(k);
            if (!kk) continue;

            if (q.includes(kk)) score += 3;

            for (const word of kk.split(" ")) {
                if (word.length > 2 && q.includes(word)) score += 1;
            }
        }

        return score;
    }

    function localAnswer(question) {
        let best = null;
        let bestScore = 0;

        for (const item of QA) {
            const s = scoreMatch(question, item.keywords);
            if (s > bestScore) {
                bestScore = s;
                best = item;
            }
        }

        if (!best || bestScore < 3) {
            return (
                "I can answer questions like:\n" +
                "• What tech stack does Juan use?\n" +
                "• What projects has he built?\n" +
                "• What roles is he looking for?\n" +
                "• How can I contact him?"
            );
        }

        return best.answer;
    }


    sendBtn.addEventListener("click", async () => {
        const question = input.value.trim();
        if (!question) return;

        addMessage(question, "user");
        input.value = "";

        const thinking = document.createElement("div");
        thinking.className = "assistant-message assistant-message--bot";
        thinking.textContent = "Thinking...";
        messages.appendChild(thinking);
        messages.scrollTop = messages.scrollHeight;

        try {
            await new Promise(r => setTimeout(r, 300)); // small delay for UX
            const answer = localAnswer(question);
            thinking.textContent = answer;
        } catch (err) {
            thinking.textContent = "Sorry, something went wrong.";
            console.error(err);
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendBtn.click();
    });
});
