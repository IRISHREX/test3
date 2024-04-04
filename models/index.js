const mongoose = require("mongoose");
const uuid = require("uuid");
let uuidv4 = uuid.v4;
const ticketSchema = new mongoose.Schema({
  ticketCode: {
    type: String,
  },
  uid: {
    type: String,
    default: uuidv4,
  },
});

const Ticket = mongoose.model("Ticket2", ticketSchema);

module.exports = Ticket;
