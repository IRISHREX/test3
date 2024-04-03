const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketCode: {
        type: String,
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
