import fs from "fs";
import { PDFDocument } from "pdf-lib";
import path from "path";
import logger from "../loggers.js"; // Adjust the path as per your project structure

export const imagesToPdf = async (imageDir, outputPdfPath) => {
  try {
    logger.info("Entered imagesToPdf function");

    // Read image files from the directory
    logger.info(`Reading images from directory: ${imageDir}`);
    let imageFiles = fs.readdirSync(imageDir);

    // Filter and sort image files (assuming they are named 1.png, 2.png, etc.)
    logger.info("Filtering and sorting image files");
    imageFiles = imageFiles
      .filter((file) => file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg"))
      .sort((a, b) => parseInt(a.split(".")[0]) - parseInt(b.split(".")[0]));

    logger.info(`Found ${imageFiles.length} image files`);

    // Create a new PDF document
    logger.info("Creating PDF document");
    const pdfDoc = await PDFDocument.create();

    // Add each image to the PDF document
    for (const imageFile of imageFiles) {
      const filePath = path.join(imageDir, imageFile);
      logger.info(`Embedding image: ${filePath}`);

      const imageBytes = fs.readFileSync(filePath);
      const imageFormat = path.extname(filePath).toLowerCase();
      let embeddedImage;

      if (imageFormat === ".png") {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else if (imageFormat === ".jpg" || imageFormat === ".jpeg") {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: embeddedImage.width,
        height: embeddedImage.height,
      });
    }

    // Serialize the PDFDocument to bytes (a Uint8Array)
    logger.info("Saving PDF document");
    const pdfBytes = await pdfDoc.save();

    // Write the PDF file to disk
    logger.info(`Writing PDF to: ${outputPdfPath}`);
    fs.writeFileSync(outputPdfPath, pdfBytes);

    logger.info("PDF created successfully!");
    return true;
  } catch (error) {
    logger.error(`Error in imagesToPdf function: ${error.toString()}`);
    // TODO: Handle failure cases appropriately
    return false;
  }
};
