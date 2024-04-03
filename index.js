// app.js

const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const { Transform } = require('stream');

const Ticket = require('./models/Ticket');

const app = express();
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
app.post('/import', uploadCsv, async (req, res) => {
    try {
        const { path } = req.file;
        const transformedTickets = [];

        // Create a stream to read the CSV file
        const stream = fs.createReadStream(path)
            .pipe(csvParser({ separator: '\t' })); // Set separator to tab

        // Define a stream transformation to filter and transform the data
        const transformStream = new Transform({
            objectMode: true,
            transform(row, encoding, callback) {
                // Ensure ticketCode exists and is not null
                if (row.ticketCode && row.ticketCode.trim() !== '') {
                    // Transform the row into a document suitable for MongoDB insertion
                    const ticketObject = { ticketCode: row.ticketCode };
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
});

// Fetch tickets within a specified range
app.get('/tickets/:start/:end', async (req, res) => {
    try {
        const start = parseInt(req.params.start);
        const end = parseInt(req.params.end);

        const tickets = await Ticket.find({ ticketCode: { $gte: start, $lte: end } }).lean();

        res.type('json').send(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).send('Error fetching tickets');
    }
});

// MongoDB connection
const PORT = 3000;
const DBURL = "mongodb://127.0.0.1:27017/ticket2";
mongoose
    .connect(DBURL)
    .then(() => {
        console.log("DB CONNECTED");
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

