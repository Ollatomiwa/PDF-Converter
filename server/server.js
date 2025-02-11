const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const convert = require('libreoffice-convert');
const fs = require('fs');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

// Correct conversion function
const convertDocxToPdf = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
      const file = fs.readFileSync(inputPath);
  
      // Set a timeout for the conversion process
      const conversionTimeout = setTimeout(() => {
        reject(new Error('Conversion process timed out'));
      }, 120000); // 120 seconds (2 minutes)
  
      convert.convert(file, '.pdf', {
        command: 'C:\Program Files\LibreOffice\program\soffice --headless --convert-to pdf'
      }, (err, converted) => {
        if (err) return reject(err);
        fs.writeFileSync(outputPath, converted);
        resolve();
      });
    });
  };

app.post('/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, 'converted.pdf');

    await convertDocxToPdf(inputPath, outputPath);
    
    res.download(outputPath, (err) => {
      // Cleanup files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      if (err) throw err;
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).send('Conversion failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));