const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketCode: {
        type: Object,
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
