import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { symptoms } = await req.json();

        if (!symptoms || symptoms.length === 0) {
            return NextResponse.json({ message: "No symptoms provided" }, { status: 400 });
        }

        // Convert array → string
        const symptomText = symptoms.join(", ");

        // Prompt
        const prompt = `
You are a medical assistant.

User symptoms: ${symptomText}

Provide response in this format:

Possible Conditions:
- Condition 1
- Condition 2
- Condition 3

Explanation:
Short explanation of what these symptoms may indicate.

Recommendation:
What type of doctor to consult.

⚠️ Always include disclaimer: This is not a medical diagnosis.
`;

        // Validating the OpenRouter API Key presence
        if (!process.env.OPENROUTER_API_KEY) {
            console.error("Missing OPENROUTER_API_KEY in environment variables");
            return NextResponse.json({ message: "AI Configuration error: OpenRouter Key missing" }, { status: 500 });
        }

        // Building the request body
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        };

        console.log("🚀 Sending request to OpenRouter...");
        console.log(JSON.stringify(requestBody));

        // OpenRouter API call - Upgraded to Stable v1
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": process.env.FRONTEND_URL, // optional
                "X-Title": "Clinic AI System" // optional
            },
            body: JSON.stringify({
                model: process.env.OPENROUTER_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a medical assistant. Suggest possible conditions but always include a disclaimer."
                    },
                    {
                        role: "user",
                        content: `Symptoms: ${symptomText}`
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("❌ OpenRouter API Error:", JSON.stringify(errorBody, null, 2));
            return NextResponse.json({
                message: `AI Error: ${errorBody.error?.message || "Unknown API Error"}`,
                details: errorBody
            }, { status: response.status });
        }

        const data = await response.json();
        const result =
            data?.choices?.[0]?.message?.content ||
            "No response from AI";

        return NextResponse.json({ result });

    } catch (error) {
        console.error("🔥 AI Assistant Logic Error:", error);
        return NextResponse.json(
            { message: `Critical Error: ${error.message}` },
            { status: 500 }
        );
    }
}