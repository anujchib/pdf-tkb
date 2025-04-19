import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { existsSync, mkdirSync, readdirSync } from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execPromise = promisify(exec);

// Use absolute path for convertedFile directory
const convertedFileDir = path.join(__dirname, '..', 'convertedFile');

// Ensure the output directory exists
if (!existsSync(convertedFileDir)) {
  mkdirSync(convertedFileDir, { recursive: true });
  console.log(`Created directory: ${convertedFileDir}`);
}

export const convert = async (req, res) => {
  if (!req.file || !req.body.conversion) {
    return res.status(400).json({ error: 'Missing file or conversion type' });
  }

  // Get the path of the uploaded file
  const inputFile = req.file.path; 
  console.log("Input file path:", inputFile);

  // Get the conversion type from the request body
  const { conversion } = req.body;

  // Generate a unique base name for the output file
  const baseFileName = `${Date.now()}-${path.basename(req.file.originalname, path.extname(req.file.originalname))}`;
  const baseOutputFile = path.join(convertedFileDir, baseFileName);
  
  console.log("Will save converted file to:", baseOutputFile);

  // Define the conversion commands for different types
  const conversions = {
    'txt2word': `pandoc "${inputFile}" -o "${baseOutputFile}.docx"`,
    'word2txt': `pandoc "${inputFile}" -o "${baseOutputFile}.txt"`,
    'word2pdf': `pandoc "${inputFile}" -o "${baseOutputFile}.pdf"`,
    'pdf2word': `pandoc "${inputFile}" -o "${baseOutputFile}.docx"`,
    'pdf2jpg': `convert "${inputFile}" -quality 100 "${baseOutputFile}-%d.jpg"`,
    'jpg2pdf': `convert "${inputFile}" -quality 100 "${baseOutputFile}.pdf"`,
    'heic2pdf': `convert "${inputFile}" -quality 100 "${baseOutputFile}.pdf"`,
    'heic2jpg': `convert "${inputFile}" -quality 100 "${baseOutputFile}.jpg"`,
  };

  // If the conversion type is invalid, return an error
  if (!conversions[conversion]) {
    return res.status(400).json({ error: 'Invalid conversion type' });
  }

  try {
    // Execute the conversion command
    console.log("Running command:", conversions[conversion]);
    const { stdout, stderr } = await execPromise(conversions[conversion]);
    
    if (stderr && !stderr.includes("Undefined/Unknown")) {
      console.log("Command stderr:", stderr);
    }

    // Determine the correct extension based on the conversion type
    const outputExtension = conversion.split('2')[1]; // 'pdf' for 'heic2pdf', etc.

    // Special handling for PDF to JPG which creates multiple files
    if (conversion === 'pdf2jpg') {
      // Check for files matching the pattern baseOutputFile-0.jpg, baseOutputFile-1.jpg, etc.
      const convertedDir = path.dirname(baseOutputFile);
      const baseFileNameWithoutPath = path.basename(baseOutputFile);
      
      // List all files in the directory
      const files = readdirSync(convertedDir);
      
      // Filter files that match our pattern
      const pattern = new RegExp(`^${baseFileNameWithoutPath}-\\d+\\.jpg$`);
      const matchingFiles = files.filter(file => pattern.test(file));
      
      console.log(`Found ${matchingFiles.length} converted JPG files`);
      
      if (matchingFiles.length > 0) {
        // Sort files by page number
        matchingFiles.sort((a, b) => {
          const pageA = parseInt(a.match(/-(\d+)\.jpg$/)[1], 10);
          const pageB = parseInt(b.match(/-(\d+)\.jpg$/)[1], 10);
          return pageA - pageB;
        });
        
        // Prepare the response with links to all pages
        const fileLinks = matchingFiles.map((file, index) => {
          return {
            page: index + 1,
            filename: file,
            downloadUrl: `/api/v1/user/download?file=${encodeURIComponent(file)}`
          };
        });
        
        return res.status(200).json({
          message: 'PDF converted to multiple JPG images successfully',
          pageCount: matchingFiles.length,
          files: fileLinks,
          // For backward compatibility, include the first page in the top-level fields
          outputPath: matchingFiles[0],
          downloadUrl: `/api/v1/user/download?file=${encodeURIComponent(matchingFiles[0])}`
        });
      } else {
        return res.status(500).json({ error: 'Conversion completed but no output files were found' });
      }
    } else {
      // For single file conversions
      const outputFile = `${baseOutputFile}.${outputExtension}`;
      
      // Check if the output file was created
      if (!existsSync(outputFile)) {
        return res.status(500).json({ error: 'Conversion completed but output file was not created' });
      }
      
      // Get just the file name (e.g., 'document.pdf')
      const outputFileName = path.basename(outputFile);
      
      // Send the success response with the download link
      return res.status(200).json({
        message: 'File uploaded, converted, and stored successfully',
        outputPath: outputFileName,
        downloadUrl: `/api/v1/user/download?file=${encodeURIComponent(outputFileName)}`,
      });
    }
  } catch (err) {
    console.error('Conversion error:', err);
    return res.status(500).json({ error: 'Conversion failed', details: err.message });
  }
};

















// import { exec } from "child_process";
// import { promisify } from "util";
// import path from "path";
// import { existsSync, mkdirSync } from "fs";

// const execPromise = promisify(exec);

// // Ensure the output directory exists
// if (!existsSync('convertedFile')) {
//   mkdirSync('convertedFile', { recursive: true });
// }

// export const convert = async (req, res) => {
//   if (!req.file || !req.body.conversion) {
//     return res.status(400).json({ error: 'Missing file or conversion type' });
//   }

//   // Get the path of the uploaded file
//   const inputFile = req.file.path; 

//   // Get the conversion type from the request body
//   const { conversion } = req.body;

//   // Get the base file name without extension (for example, 'document' from 'document.txt')
//   const baseOutputFile = path.join('convertedFile', `${Date.now()}-${path.basename(req.file.originalname, path.extname(req.file.originalname))}`);

//   // Define the conversion commands for different types
//   const conversions = {
//     'txt2word': `pandoc "${inputFile}" -o "${baseOutputFile}.docx"`,
//     'word2txt': `pandoc "${inputFile}" -o "${baseOutputFile}.txt"`,
//     'word2pdf': `pandoc "${inputFile}" -o "${baseOutputFile}.pdf"`,
//     'pdf2word': `pandoc "${inputFile}" -o "${baseOutputFile}.docx"`,
//     'pdf2jpg': `magick "${inputFile}" -quality 100 "${baseOutputFile}-%d.jpg"`,
//     'jpg2pdf': `magick "${inputFile}" -quality 100 "${baseOutputFile}.pdf"`,
//     'heic2pdf': `magick "${inputFile}" -quality 100 "${baseOutputFile}.pdf"`,
//     'heic2jpg': `magick "${inputFile}" -quality 100 "${baseOutputFile}.jpg"`,
//   };

//   // If the conversion type is invalid, return an error
//   if (!conversions[conversion]) {
//     return res.status(400).json({ error: 'Invalid conversion type' });
//   }

//   try {
//     // Execute the conversion command (e.g., pandoc or magick)
//     await execPromise(conversions[conversion]);

//     // Determine the correct extension based on the conversion type
//     const outputExtension = conversion.split('2')[1]; // 'pdf' for 'heic2pdf', etc.

//     // Construct the full path for the converted file
//     const outputFile = `${baseOutputFile}.${outputExtension}`;

//     // Get just the file name (e.g., 'document.pdf')
//     const outputFileName = path.basename(outputFile);

//     // Get the API base URL from environment or use default
//     const apiBaseUrl = process.env.API_BASE_URL || '/api/v1';

//     // Send the success response with the download link
//     res.status(200).json({
//       message: 'File uploaded, converted, and stored successfully',
//       outputPath: outputFileName,
//       downloadUrl: `${apiBaseUrl}/user/download?file=${encodeURIComponent(outputFileName)}`,
//     });

//   } catch (err) {
//     console.error('Conversion error:', err);
//     return res.status(500).json({ error: 'Conversion failed' });
//   }
// };