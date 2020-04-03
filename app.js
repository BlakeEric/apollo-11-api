const PORT = process.env.PORT || 3000;
const express = require("express");
const morgan = require("morgan");
var fs = require('fs');
const app = express();
var cors = require('cors')
var bodyParser = require('body-parser')
const PDFDocument = require('pdfkit');

//Logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

app.use(cors())

app.use(bodyParser.json());

app.post('/', (req, res) => {

  // Create a document
  const doc = new PDFDocument;

  filename = encodeURIComponent("study-guide") + '.pdf'
  // Setting response to 'attachment' (download).
  // If you use 'inline' here it will automatically open the PDF
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
  res.setHeader('Content-type', 'application/pdf')

  // Pipe its output somewhere, like to a file or HTTP response
  // See below for browser usage
  doc.pipe(fs.createWriteStream('output.pdf'));

  // Embed a font, set the font size, and render some text
  doc.font('Helvetica-Bold')
     .fontSize(25)
     .text('My Study Guide', {
       width: 480,
       align: 'center'
     });

  if (req.body.notes.length) {
    doc.moveDown();

    // Embed a font, set the font size, and render some text
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .text('Notes', {
         width: 480,
         align: 'left'
       });

    doc.moveDown();

    req.body.notes.forEach(function(note) {
      doc.font('Helvetica')
         .fontSize(14)
         .text('"' + note.selectionText + '"', {
           width: 480,
           align: 'left'
         });

      doc.moveDown();

      doc.font('Helvetica-Oblique')
         .fontSize(14)
         .text(note.content, {
           width: 480,
           align: 'left'
         });

      doc.moveDown();
    });
  }

  if (req.body.queue.length) {
    // Embed a font, set the font size, and render some text
    doc.font('Helvetica-Bold')
       .fontSize(18)
       .text('Media', {
         width: 480,
         align: 'left'
       });

    doc.moveDown();

    req.body.queue.forEach(function(item) {

      doc.font('Helvetica')
         .fillColor("black")
         .fontSize(14)
         .text(item.id + ":", {
           width: 480,
           align: 'left'
         });

      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor("blue")
         .text(item.src, {
           width: 480,
           align: 'left',
           link: item.src
         })

      doc.moveDown();
    });
  }

  // Finalize PDF file
  doc.pipe(res)
  doc.end();
})

// this is default in case of unmatched routes
app.use(function(req, res) {
// Invalid request
     res.json({
       error: {
         'name':'Error',
         'status':404,
         'message':'Invalid Request',
         'statusCode':404,
       },
        message: 'Invalid Request'
     });
});

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}

app.listen(PORT, onListen);

function onListen() {
  console.log('Listening on', PORT);
}
