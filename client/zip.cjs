const AdmZip = require('adm-zip');
const path = require('path');

const zip = new AdmZip();
const distPath = path.join(__dirname, 'dist');

// Add the dist folder contents to the ZIP root
zip.addLocalFolder(distPath);

// Save the ZIP to the project root
zip.writeZip(path.join(__dirname, '../PrimeCarz-deploy.zip'));
console.log('✅ ZIP created successfully with forward slashes!');
