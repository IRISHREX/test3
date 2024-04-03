const Ticket = require('../models/Ticket');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { Transform } = require('stream');
const upload = multer({ dest: 'uploads/' });

// Define storage for uploaded CSV file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadCsv = upload.single('csvFile');

// Import CSV file and store tickets in MongoDB
const importCsv= async (req, res) => {
  try {
    const { path } = req.file;
    const transformedTickets = [];

    // Create a stream to read the CSV file
    const stream = fs.createReadStream(path)
      .pipe(csvParser({ separator: ' ', headers: ['ticketPrefix', 'ticketNumber'] }));

    // Define a stream transformation to filter and transform the data
    const transformStream = new Transform({
      objectMode: true,
      transform(row, encoding, callback) {
        // Ensure ticketPrefix and ticketNumber exist and are not null
        if (row.ticketPrefix && row.ticketNumber && row.ticketPrefix.trim() !== '' && row.ticketNumber.trim() !== '') {
          // Concatenate ticketPrefix and ticketNumber into a single ticketCode
          const ticketCode = `${row.ticketPrefix}${row.ticketNumber}`;

          // Transform the row into a document suitable for MongoDB insertion
          const ticketObject = { ticketCode };
          transformedTickets.push(ticketObject);
        }

        callback();
      }
    });

    // Pipe the read stream through the transformation stream
    stream.pipe(transformStream);

    // Wait for the stream to finish processing
    await new Promise((resolve, reject) => {
      transformStream.on('finish', resolve);
      transformStream.on('error', reject);
    });

    // Insert transformedTickets into MongoDB
    const result = await Ticket.insertMany(transformedTickets);

    // Remove uploaded CSV file after import
    fs.unlinkSync(path);

    res.send(`Tickets imported successfully. ${result.length} documents inserted.`);
  } catch (error) {
    console.error('Error importing tickets:', error);
    res.status(500).send('Error importing tickets');
  }
};

// Fetch tickets within a specified range
const fetchTicket= async (req, res) => {
  try {
    const start = req.params.start;
    const end = req.params.end;
    const tickets = await Ticket.find({ ticketCode: { $gte: start, $lte: end } }).lean();
    res.type('json').send(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).send('Error fetching tickets');
  }
};

module.exports={
  uploadCsv,
  importCsv,
  fetchTicket
}