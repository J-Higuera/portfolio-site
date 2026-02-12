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

    async function askAssistant(question) {
        const res = await fetch("/.netlify/functions/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data.answer;
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
            const answer = await askAssistant(question);
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
