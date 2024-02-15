var express = require('express');
var router = express.Router();
var db = require("../dbCloud");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');


router.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

router.post('/user', function(request, response) {
    console.log("User Registration")
	var username = request.body.username;
	var password = request.body.password;
    var fname= request.body.firstname;
    var lname= request.body.lastname;
    var email= request.body.email;
    console.log(username);


		db.query('INSERT INTO `members` (`id`, `username`, `fname`, `lname`, `email`, `password`, `mem_type`, `Enabled`, `date_issue`, `date_expiry`) VALUES (NULL, ?, ?, ?, ?, ?, \'student\' , 0, 0112, 0112)', [username, fname, lname, email, password], function(error, results, fields) {
			console.log(error);
            response.send("Registration Complete")
			response.end();
	});
});


router.post('/admin', function(request, response) {
    console.log("User Registration")
	var username = request.body.username;
	var password = request.body.password;
    var fname= request.body.firstname;
    var lname= request.body.lastname;
    var email= request.body.email;
    console.log(username);


		db.query('INSERT INTO `members` (`id`, `username`, `fname`, `lname`, `email`, `password`, `mem_type`, `Enabled`, `date_issue`, `date_expiry`) VALUES (NULL, ?, ?, ?, ?, ?, \'admin\' , 0, 0112, 0112)', [username, fname, lname, email, password], function(error, results, fields) {
			console.log(error);
            response.send("Registration Complete. Please Wait while and admin accepts your request")
			response.end();
	});
});

module.exports = router;