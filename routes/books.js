var express = require("express");
var router = express.Router();
var db = require("../dbCloud");
// another routes also appear here
// this script to fetch data from MySQL databse table
router.get("/adminbooks", function (req, res, next) {
  var sql = "SELECT * FROM library_boooks";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("adminbooks", { title: "Admin Books", bData: data });
  });
});

router.get("/studentbooks", function (req, res, next) {
  var sql = "SELECT * FROM library_boooks";
  db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render("studentbooks", { title: "Admin Books", bData: data });
  });
});

router.get("/return", function (req, res) {
  var id = req.query.id;
  sql =
    "UPDATE issue_and_return SET return_approved= '1', returning= '1' WHERE id='" +
    id +
    "'";
  db.query(sql, (err, results) => {
    if (err) console.log(err);
    else {
      var sql2 =
        "UPDATE library_boooks SET no_of_books = no_of_books + 1 WHERE ISBN IN (SELECT ISBN FROM issue_and_return where id =" +
        id +
        ");";
      db.query(sql2, (err2, results2) => {
        if (err2) {
          console.log(err2);
          res.send("Error returning book");
        } else res.send("Book returned");
      });
    }
  });
});

router.get("/bookDetails", function (req, res) {
  var isbn = req.query.isbn;
  var user = req.session.username;
  sql3 =
          "SELECT username, fname, lname FROM members WHERE username= '" +
          user +
          "'";

  console.log("Get details of: " + isbn);
  sql = "SELECT * FROM library_boooks WHERE isbn= '" + isbn + "'";
  db.query(sql, (err, results) => {
    if (err) console.log(err);
    else {
      console.log(results);
      if (results.length > 0) {
        
        db.query(sql3, (err, results3) => {
          if (err) console.log(err);
          res.render("bookdetails", { bookData: results, userData: results3 });
        });
      } else {
        var isbn2 = isbn.replace(/-/g, "");
        sql2 = "SELECT * FROM library_boooks WHERE isbn= '" + isbn2 + "'";

        db.query(sql2, (err, results2) => {
          console.log(results2);
          if (err) console.log(err);
          db.query(sql3, (err, results3) => {
            if (err) console.log(err);
            res.render("bookdetails", {
              bookData: results,
              userData: results3,
            });
          });
        });
      }
    }
  });
});

router.get("/bookDetailsAdmin", function (req, res) {
  var isbn = req.query.isbn;
  console.log("Get details of: " + isbn);
  sql = "SELECT * FROM library_boooks WHERE isbn= '" + isbn + "'";
  db.query(sql, (err, results) => {
    if (err) console.log(err);
    else {
      console.log(results);
      if (results.length > 0)
        res.render("bookdetailsAdmin", { bookData: results });
      else {
        var isbn2 = isbn.replace(/-/g, "");
        sql2 = "SELECT * FROM library_boooks WHERE isbn= '" + isbn2 + "'";
        db.query(sql2, (err, results2) => {
          console.log(results2);
          if (err) console.log(err);
          else {
            res.render("bookdetailsAdmin", { bookData: results2 });
          }
        });
      }
    }
  });
});

module.exports = router;
