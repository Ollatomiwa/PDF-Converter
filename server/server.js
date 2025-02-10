const express = require('express');
const cors = require ('cors');
const fs = require ('fs');
const libre = require ('libreoffice-convert');
const path = require ('path');
const multer = require('multer');

const app = express();
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = path.join(__dirname, 'output.pdf');

    // READ THE UPLOADED DOCX FILE
    const file = fs.readFileSync(inputPath);
    
    //CONVERT DOCX TO PDF USING THE LIBREOFFICE-CONVERT
    libre.convert(file, '.pdf', undefined, (err, done) => {
        if (err) {
            fs.unlinkSync(inputPath);
            return
            res.status(500).send('Conversion to PDF failed.');
        }

        //SEND THE GENERATED PDF FILE AND SEND IT TO THE CLIENT
        fs.writeFileSync(outputPath, done);
        res.download(outputPath, () => {
            // CLEAN UP THE TEMPORARY FILES
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
