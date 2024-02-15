var express = require('express');
var router = express.Router();
var db = require("../dbCloud");
// another routes also appear here
// this script to fetch data from MySQL databse table
router.get('/', function(req, res, next) {
    
   res.send("Hello");
});
module.exports = router;