const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../node_modules/lucide-react/dist/esm/icons/award.js.map');

console.log("Checking if file exists...");
if (fs.existsSync(filePath)) {
  console.log("File exists. Attempting to read...");
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log("Success! Read", content.length, "characters.");
  } catch (err) {
    console.error("Read failed:", err.message);
  }
} else {
  console.log("File does not exist at:", filePath);
}
