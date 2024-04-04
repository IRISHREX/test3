const Ticket = require("../models");
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const { Transform } = require("stream");
const upload = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadCsv = upload.single("csvFile");
const importCsv = async (req, res) => {
  try {
    const { path } = req.file;
    let transformedTickets = [];

    const stream = fs.createReadStream(path).pipe(csvParser());

    let rowNumber = 1; // Track row number

    const transformStream = new Transform({
      objectMode: true,
      transform(row, encoding, callback) {
        for (const key in row) {
          if (row.hasOwnProperty(key) && row[key].trim() !== "") {
            const ticketCode = row[key].trim();
            transformedTickets.push(ticketCode);
          }
        }
        rowNumber++; // Move to the next row
        callback();
      },
    });

    stream.pipe(transformStream);

    await new Promise((resolve, reject) => {
      transformStream.on("finish", resolve);
      transformStream.on("error", reject);
    });

    // Sort the transformedTickets array
    transformedTickets = transformedTickets.sort((a, b) => a.localeCompare(b));

    // Insert tickets into the database
    const result = await Ticket.insertMany(
      transformedTickets.map((ticketCode) => ({ ticketCode }))
    );

    fs.unlinkSync(path);

    res.send(
      `Tickets imported successfully. ${result.length} documents inserted.`
    );
  } catch (error) {
    console.error("Error importing tickets:", error);
    res.status(500).send("Error importing tickets");
  }
};

const fetchTicket = async (req, res) => {
  try {
    const start = req.params.start;
    const end = req.params.end;
    const page = req.query.page || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    // Fetch tickets with pagination
    const tickets = await Ticket.find({
      ticketCode: { $gte: start, $lte: end },
    })
      .skip(skip)
      .limit(limit)
      .lean();

    res.type("json").send(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).send("Error fetching tickets");
  }
};

module.exports = {
  uploadCsv,
  importCsv,
  fetchTicket,
};
