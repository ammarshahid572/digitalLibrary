var express = require("express");
var router = express.Router();
var db = require("../dbCloud");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
const { response } = require("express");

router.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.post("/auth", function (request, response) {
  console.log("User Authentication");
  var username = request.body.username;
  var password = request.body.password;

  if (username && password) {
    db.query(
      "SELECT mem_type FROM members WHERE username = ? AND password = ? AND Enabled= 1",
      [username, password],
      function (error, results, fields) {
        if (results.length > 0) {
          request.session.loggedin = true;
          request.session.username = username;
          console.log("logged in " + username);
          results.forEach(function (data) {
            if (data.mem_type == "admin") response.redirect("/admin/");
            else if (data.mem_type == "librarian")
              response.redirect("/admin/librarian/");
            else response.redirect("/users/");
          });
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

router.get("/", function (req, res) {
  console.log("Admin Dashboard");
  if (req.session.loggedin) {
    var username = req.session.username;
    res.render("adminDashboard", { member: username });
  } else {
    res.redirect("/");
  }
});

router.get("/librarian/", function (req, res) {
  console.log("Admin Dashboard");
  if (req.session.loggedin) {
    var username = req.session.username;
    res.render("librarianDashboard", { member: username });
  } else {
    res.redirect("/");
  }
});

router.get("/booklist", function (req, res, next) {
  var sql = "SELECT * FROM library_boooks";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("adminbooks", { title: "Admin Books", bData: data });
  });
});

router.get("/approvallist", function (req, res) {
  var sql = "SELECT * FROM members WHERE Enabled=0 ORDER BY Enabled ASC";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("ApprovalList", { title: "Approving Users", bData: data });
  });
});

router.get("/edit", function (req, res, next) {
  var ISBN = req.query.id;
  console.log("Editing" + ISBN);
  var username = req.session.username;
  var sql = 'SELECT * FROM `library_boooks` WHERE ISBN="' + ISBN + '"';
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    //res.send("editing book")
    res.render("editBook", { prevdata: data });
  });
});

router.post("/updateBook", function (req, res, next) {
  var title = req.body.title;
  var author = req.body.author_name;
  var isbn = req.body.isbn;
  var isbn2 = req.body.isbn2;
  var count = req.body.count;
  var rack = req.body.rack;
  var price = req.body.price;
  console.log(isbn);
  sql =
    "UPDATE `library_boooks` SET `ISBN` = '" +
    isbn2 +
    "',`book_name` = '" +
    title +
    "', `no_of_books` = '" +
    count +
    "', `rack_no` = '" +
    rack +
    "', `price` = '" +
    price +
    "', `author_name` ='" +
    author +
    "' WHERE `library_boooks`.`ISBN` = '" +
    isbn +
    "'";
  console.log(sql);
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.send("Record Updated");
  });
});

router.get("/delete", function (req, res, next) {
  var ISBN = req.query.id;
  console.log("Deleting" + ISBN);
  var username = req.session.username;
  var sql =
    "DELETE FROM `library_boooks` WHERE `library_boooks`.`ISBN` = '" +
    ISBN +
    "'";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    //res.send("editing book")
    res.send("Deleted the book");
  });
});

router.get("/newBook", function (req, res, next) {
  console.log("Adding Book");
  res.render("addBook");
});

router.post("/addBook", function (req, res, next) {
  console.log("adding new book");
  var title = req.body.title;
  var isbn = req.body.isbn;
  var count = req.body.count;
  var author = req.body.author_name;
  var rack = req.body.rack;
  var price = 0;

  sql =
    "INSERT INTO `library_boooks` SET `ISBN` = '" +
    isbn +
    "',`book_name` = '" +
    title +
    "', `no_of_books` = '" +
    count +
    "', `rack_no` = '" +
    rack +
    "', `price` = '" +
    price +
    "', `author_name`='" +
    author +
    "'";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.send("New Book added");
  });
});

router.get("/deleteMember", function (req, res) {
  var id = req.query.id;
  var sql = "DELETE FROM members WHERE id='" + id + "'";
  db.query(sql, (err, result) => {
    if (err) console.log(err);
    else res.send("User Deleted");
  });
});

router.get("/approveMember", function (req, res) {
  var id = req.query.id;
  var sql =
    "UPDATE `members` SET `Enabled` = '1' WHERE `members`.`id` = '" + id + "'";
  db.query(sql, (err, result) => {
    if (err) console.log(err);
    else res.send("User Approved");
  });

  var sql = "SELECT email, username from `members` WHERE `members`.`id` = '" + id + "'";
  db.query(sql, (err, result) => {
    if (err) console.log(err);
    results.forEach(function (data) {
     email_target=data.email;
     const mailjet = require("node-mailjet").connect(
      process.env.MJ_APIKEY_PUBLIC,
      process.env.MJ_APIKEY_PRIVATE
    );
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "library@mailjet.com",
            Name: "Digital library",
          },
          To: [
            {
              Email: email_target,
              Name: data.username,
            },
          ],
          Subject: "You have been approved",
          TextPart:
            "You have been Approved!",
          },
      ],
    });
    request
      .then((result) => {
        console.log(result.body);
      })
      .catch((err) => {
        console.log(err.statusCode);
      });
    });
    
  });
});

router.get("/scanQR", (req, res) => {
  res.render("qrscanAdmin");
});
module.exports = router;
