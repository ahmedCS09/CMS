import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { diagnosis } = await req.json();

        const prompt = `
        You are a healthcare assistant.

        Based on the following diagnosis, suggest a safe and general diet plan.

        Diagnosis: ${diagnosis}

        Provide:
        - Recommended foods
        - Foods to avoid
        - Simple daily diet plan

        Keep it general and not medical advice.

        ⚠️ Always include disclaimer: This is not a medical diagnosis.
        `;

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "poolside/laguna-m.1:free",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
            console.error("OpenRouter Error Data:", data);
            throw new Error(data.error?.message || "Failed to fetch from OpenRouter");
        }

        return NextResponse.json({
            diet: data.choices[0].message.content
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}