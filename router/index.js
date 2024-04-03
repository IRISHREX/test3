const express = require("express");
const { importCsv, uploadCsv, fetchTicket } = require("../controller");
const router = express.Router();

router.post('/importCsv',uploadCsv,importCsv)
router.get('/tickets/:start/:end',fetchTicket)
module.exports = router;
