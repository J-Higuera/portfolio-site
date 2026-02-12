export async function handler(event) {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method Not Allowed" };
        }

        const { question, history } = JSON.parse(event.body || "{}");
        if (!question || typeof question !== "string") {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing question." }) };
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return { statusCode: 500, body: JSON.stringify({ error: "Missing OPENAI_API_KEY on server." }) };
        }

        const model = process.env.OPENAI_MODEL || "gpt-5-mini";
        const knowledge = process.env.PORTFOLIO_KNOWLEDGE || "";

        const system = [
            "You are Juan Higuera's portfolio assistant for recruiters and hiring managers.",
            "Answer ONLY using the provided PORTFOLIO FACTS.",
            "If the answer isn't in the facts, say you don't have that info.",
            "Keep responses concise, professional, and specific."
        ].join(" ");

        // Keep a small history window (optional)
        const safeHistory = Array.isArray(history) ? history.slice(-6) : [];

        const input = [
            { role: "system", content: system },
            { role: "developer", content: `PORTFOLIO FACTS:\n${knowledge}` },
            ...safeHistory,
            { role: "user", content: question }
        ];

        const resp = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                input,
                max_output_tokens: 280
            })
        });

        if (!resp.ok) {
            const err = await resp.text();
            return { statusCode: resp.status, body: JSON.stringify({ error: err }) };
        }

        const data = await resp.json();

        // Most convenient field:
        const answer =
            (data.output_text ||
                data.output?.map(o => o.content?.map(c => c.text).join("")).join("\n") ||
                "").trim();

        return {
            statusCode: 200,
            body: JSON.stringify({ answer })
        };
    } catch (e) {
        return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
    }
}
