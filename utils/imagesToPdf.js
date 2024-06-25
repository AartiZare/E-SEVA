import fs from "fs";
import { PDFDocument } from "pdf-lib";
import path from "path";

export const imagesToPdf = async (imageDir, outputPdfPath) => {
  // const imageDir = './images'; // Directory where images are stored
  // const outputPdfPath = './abc.pdf';

  // Read image files from the directory
  let imageFiles = fs.readdirSync(imageDir);

  // Filter and sort image files (assuming they are named 1.png, 2.png, etc.)
  imageFiles = imageFiles
    .filter((file) => file.endsWith(".png"))
    .sort((a, b) => parseInt(a.split(".")[0]) - parseInt(b.split(".")[0]));

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add each image to the PDF document
  for (const imageFile of imageFiles) {
    const filePath = path.join(imageDir, imageFile);
    const imageBytes = fs.readFileSync(filePath);

    const pngImage = await pdfDoc.embedPng(imageBytes);
    const page = pdfDoc.addPage([pngImage.width, pngImage.height]);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: pngImage.width,
      height: pngImage.height,
    });
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Write the PDF file to disk
  fs.writeFileSync(outputPdfPath, pdfBytes);

  console.log("PDF created successfully!");
  return true;
  // TODO: Handle failure cases
};
