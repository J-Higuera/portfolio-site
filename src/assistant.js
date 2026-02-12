import { QA } from "./assistant_knowledge.js";

window.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("assistantInput");
    const sendBtn = document.getElementById("assistantSend");
    const messages = document.getElementById("assistantMessages");

    if (!input || !sendBtn || !messages) return;

    // ===== Chat-only scrolling (will NOT move the page) =====
    function scrollChatToBottom(smooth = true) {
        messages.scrollTo({
            top: messages.scrollHeight,
            behavior: smooth ? "smooth" : "auto",
        });
    }

    function scrollChatToMessageTop(el, smooth = true, topPadding = 8) {
        // Compute el's position inside the messages container and scroll ONLY that container.
        const containerRect = messages.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        // Where el currently appears inside the container viewport:
        const currentOffsetInside = elRect.top - containerRect.top;

        // Convert that into a scrollTop delta inside the container:
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

        // Keep the newest message visible in the chat window only
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

        // Scroll chat to show the "Thinking..." bubble
        scrollChatToBottom(true);

        try {
            await new Promise((r) => setTimeout(r, 250));
            const answer = localAnswer(question);
            thinking.textContent = answer;

            // Your request: make the answer clearly visible near the top of the chat window
            // (Still chat-only; will not move page)
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
