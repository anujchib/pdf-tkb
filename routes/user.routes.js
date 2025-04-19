import express from "express";
import { convert } from "../controllers/convert.controllers.js";
import { uploadSingle } from "../middlewares/upload.middlewares.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// File handling routes
router.post("/upload", uploadSingle, convert);

// Download endpoint
router.get("/download", (req, res) => {
  const fileName = req.query.file;
  
  if (!fileName) {
    return res.status(400).json({ error: "File name not provided" });
  }

  // Use correct path (one level up)
  const filePath = path.join(__dirname, '..', 'convertedFile', fileName);
  
  console.log("Download request for file:", fileName);
  console.log("Looking in path:", path.join(__dirname, '..', 'convertedFile'));
  console.log("Full file path:", filePath);
  console.log("File exists:", fs.existsSync(filePath));
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // For backwards compatibility - check if it's a multi-page PDF conversion
    // where the client might be requesting filename.jpg instead of filename-0.jpg
    
    const baseNameWithoutExt = path.basename(fileName, path.extname(fileName));
    const ext = path.extname(fileName);
    const possibleFirstPage = path.join(__dirname, '..', 'convertedFile', `${baseNameWithoutExt}-0${ext}`);
    
    console.log("Checking for first page:", possibleFirstPage);
    console.log("First page exists:", fs.existsSync(possibleFirstPage));
    
    if (fs.existsSync(possibleFirstPage)) {
      // If the first page exists, redirect to it
      return res.redirect(`/api/v1/user/download?file=${encodeURIComponent(`${baseNameWithoutExt}-0${ext}`)}`);
    }
    
    return res.status(404).json({ 
      error: "File not found",
      requestedFile: fileName,
      searchPath: path.join(__dirname, '..', 'convertedFile')
    });
  }
  
  // Set content disposition header for download
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  
  // Send the file
  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      // Only send error if headers haven't been sent yet
      if (!res.headersSent) {
        return res.status(500).json({ error: "Failed to download file" });
      }
    }
  });
});

export default router;