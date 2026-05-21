async function getErrorHtml() {
  try {
    const response = await fetch("http://localhost:3000/api/AI/symptom-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symptoms: ["Fever", "Cough"]
      })
    });
    const text = await response.text();
    const fs = require('fs');
    fs.writeFileSync('scratch/error.html', text);
    console.log("Error HTML saved to scratch/error.html");
  } catch (err) {
    console.error("Failed:", err.message);
  }
}
getErrorHtml();
