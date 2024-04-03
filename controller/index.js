const Ticket = require('../models/Ticket');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const { Transform } = require('stream');
const upload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadCsv = upload.single('csvFile');

const importCsv= async (req, res) => {
  try {
    const { path } = req.file;
    const transformedTickets = [];

    const stream = fs.createReadStream(path)
      .pipe(csvParser({ separator: ' ', headers: ['ticketPrefix', 'ticketNumber'] }));

    const transformStream = new Transform({
      objectMode: true,
      transform(row, encoding, callback) {
        if (row.ticketPrefix && row.ticketNumber && row.ticketPrefix.trim() !== '' && row.ticketNumber.trim() !== '') {
          const ticketCode = `${row.ticketPrefix}${row.ticketNumber}`;

          const ticketObject = { ticketCode };
          transformedTickets.push(ticketObject);
        }

        callback();
      }
    });

    stream.pipe(transformStream);

    await new Promise((resolve, reject) => {
      transformStream.on('finish', resolve);
      transformStream.on('error', reject);
    });
let transformeTicketSorted= await transformedTickets.sort((a,b)=>a-b);
    const result = await Ticket.insertMany(transformeTicketSorted);

    fs.unlinkSync(path);

    res.send(`Tickets imported successfully. ${result.length} documents inserted.`);
  } catch (error) {
    console.error('Error importing tickets:', error);
    res.status(500).send('Error importing tickets');
  }
};

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
