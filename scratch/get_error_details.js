async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/AI/symptom-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms: ["Fever", "Cough"] })
    });
    console.log("Status:", res.status);
    const contentType = res.headers.get("content-type");
    console.log("Content-Type:", contentType);
    const text = await res.text();
    if (contentType && contentType.includes("application/json")) {
      console.log("JSON Response:", JSON.parse(text));
    } else {
      console.log("Non-JSON Response (first 1000 chars):", text.slice(0, 1000));
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
