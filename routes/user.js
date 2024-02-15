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

router.post('/auth', function(request, response) {
    console.log("User Authentication")
	var username = request.body.username;
	var password = request.body.password;
    
	if (username && password) {
        
		db.query('SELECT mem_type FROM members WHERE username = ? AND password = ? AND Enabled= 1', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.username = username;
                console.log('logged in '+ username)
				results.forEach( function (data){
					if (data.mem_type=="admin")
					response.redirect('/admin/');
					else if (data.mem_type=="librarian"){
					response.redirect('/admin/librarian/');
					console.log("Librarian logged in");
					}
					else
					response.redirect('/users/dashboard');
				});
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});



router.get('/dashboard', function(req,res){
    console.log("Member Dashboard");
	
    if (req.session.loggedin){
		var username= req.session.username;
    res.render('memberDashboard', {member:username});
    }
    else {
        res.redirect('/');
    }

});

router.get('/booklist', function(req, res, next) {
  var sql='SELECT * FROM library_boooks';
  db.query(sql, function (err, data, fields) {
  if (err) throw err;
  res.render('studentbooks', { title: 'Member Books', bData: data});
});
});

router.get('/issue', function(req, res, next) {
	var ISBN= req.query.id;
	var title= req.query.title;
	console.log("Issueing "+ISBN)
	var username= req.session.username;
	var sql="INSERT INTO `issue_and_return` (`id`, `ISBN`, `Title`, `mem_id`, `issue_date`, `expiry_date`, `returning`, `return_approved`, `fine`) VALUES (NULL, '"+ISBN+"', '"+title+"', '"+username+"', CURRENT_DATE(), CURRENT_DATE+100, '0', '0', '0')";
	db.query(sql, function (err, data, fields) {
	if (err) {console.log(err);throw err;}
	else {
		var sql2= "UPDATE library_boooks SET no_of_books = no_of_books - 1 WHERE ISBN='"+ISBN+"' and no_of_books >0;";
		db.query(sql2, (err2, results2)=>{
			if (err2){ console.log(err2);
						res.send("Error issuing book");}
			else 
			res.send("Book issued");
		});
		
	}
  });
  });

router.get('/history', function(req, res, next) {
	if (req.session.loggedin){
		var username= req.session.username;
		console.log("Student Booklist");
		db.query("SELECT * FROM issue_and_return WHERE mem_id= ? AND return_approved= '0' ORDER BY issue_and_return.issue_date DESC",[username],function (err, data, fields){
			if (err) throw err;
			res.render('studenthistory', { title: 'History', bData: data});
		});
		}
	else {
			res.redirect('/');
		}
	
  });

  router.get('/scanQR', (req,res)=>{
	res.render('qrscan');
  });

module.exports = router;