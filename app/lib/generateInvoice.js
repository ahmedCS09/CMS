import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export default function generateInvoice(data, filePath) {
  return new Promise((resolve, reject) => {
    try {
      console.log(`🛠️ Starting PDF generation for ${data.name}...`);
      
      // Use Courier as it's sometimes more reliably available in some environments
      const doc = new PDFDocument({
        font: null
      });

      const fontPath = path.join(process.cwd(), 'public/fonts/PDFFont.otf');
      
      const stream = fs.createWriteStream(filePath);

      stream.on("error", (err) => {
        console.error("❌ PDF Stream Error:", err);
        reject(err);
      });

      doc.pipe(stream);
      doc.font(fontPath);

      // Try setting font explicitly to see if it bypasses the Helvetica fault
      try {
        doc.font('Courier');
      } catch (fErr) {
        console.warn("⚠️ Could not set Courier font, falling back to default:", fErr.message);
      }

      doc.fontSize(25).text("Medical Invoice", { align: "center", underline: true });
      doc.moveDown();

      doc.fontSize(14).text(`Medicine: ${data.name}`);
      doc.text(`Quantity: ${data.quantity}`);
      doc.text(`Price: $${data.price}`);
      doc.moveDown();
      
      doc.fontSize(16).text(`Total Amount: $${data.total}`, { bold: true });

      doc.end();

      stream.on("finish", () => {
        console.log(`📄 PDF generated successfully at: ${filePath}`);
        resolve();
      });
    } catch (err) {
      console.error("💥 PDF Generation Exception:", err);
      reject(err);
    }
  });
}