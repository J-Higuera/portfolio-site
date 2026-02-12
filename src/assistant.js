async function askAssistant(question) {
    const res = await fetch("/.netlify/functions/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data.answer;
} // <-- THIS was missing

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
