const mongoose = require('mongoose');
//unique key added for all data.
const ticketSchema = new mongoose.Schema({
    ticketCode: {
        type: String,
    },
    uid:{
        type: String,
        default:()=>new Date().getTime();
    }
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
