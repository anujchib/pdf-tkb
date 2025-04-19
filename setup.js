// setup.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Starting setup...');

try {
  // Install required packages
  console.log('Installing dependencies...');
  execSync('apt-get update && apt-get install -y imagemagick pandoc', { stdio: 'inherit' });
  
  // Create necessary directories
  console.log('Creating directories...');
  const convertedDir = path.join(__dirname, 'convertedFile');
  const uploadDir = path.join(__dirname, 'uploadFile');
  
  if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir, { recursive: true });
  }
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  console.log('Setup completed successfully!');
} catch (error) {
  console.error('Setup failed:', error);
  process.exit(1); // Exit with error code
}