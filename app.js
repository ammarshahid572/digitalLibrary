var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");

var adminRouter = require("./routes/admin");
var userRouter = require("./routes/user");
var bookRouter = require("./routes/books");
var registration = require("./routes/registration");
var mysql= require('mysql');
var cors = require("cors");

var bodyParser = require("body-parser");
var db = require("./dbCloud");
const { redirect } = require("express/lib/response");

var app = express();
// view engine setup
app.use(cors());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/styles", express.static(__dirname + '/styles'));
app.set("view engine", "ejs");
app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + "/index.html"));
});
  
// APIs for MOBILE APP
app.get("/jsonList", function (request, res) {
  var sql = "SELECT * FROM library_boooks";
  db.query("SELECT * FROM library_boooks",(err, results)=>{
    if(err)
    console.log(err);
    else {
    console.log(results);
        res.send("query success");
    }
    });

  //send json
});


app.get("/loginAdmin", function (request, response) {
  response.sendFile(path.join(__dirname + "/loginAdmin.html"));
});

app.get("/loginUser", function (request, response) {
  response.sendFile(path.join(__dirname + "/loginUser.html"));
});

app.get("/qrEx", function (request, response) {
  response.sendFile(path.join(__dirname + "/qrcodeEx.html"));
});

app.get("/registerUser", function (request, response) {
  response.sendFile(path.join(__dirname + "/registerUser.html"));
});

app.get("/registerAdmin", function (request, response) {
  response.sendFile(path.join(__dirname + "/registerAdmin.html"));
});

app.get("/booklist", function (req, res) {
  var sql = "SELECT * FROM library_boooks";
  console.log("getting booklist");
  db.query(sql, function (err, data, fields) {
    if (err) {
      console.log("some sql related issue");
      throw err;
    }
    console.log(data);
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(data));
  });
});

app.post("/login", (req, res) => {
  console.log(req.body);
  var username = req.body.username;
  var password = req.body.password;
  res.setHeader("Content-Type", "application/json");
  if (username) {
    db.query(
      "SELECT mem_type FROM members WHERE username = ? AND password = ? AND Enabled= 1",
      [username, password],
      function (error, results, fields) {
        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = username;
          console.log("logged in " + username);
          var content = {
            request: "valid",
            login: true,
            message: "log in successfull",
            member_type: results[0].mem_type
          };
          res.send(JSON.stringify(content));
        } else {
          var content = {
            request: "valid",
            login: false,
            message: "username or password is incorrect",
            member_type: "none"
          };
          res.send(JSON.stringify(content));
        }
        res.end();
      }
    );
  } else {
    var content = {
      request: "invalid",
      login: false,
      message: "username not found",
    };
    res.send(JSON.stringify(content));
  }
});
app.get("/logout", function(req,res){
  req.session.username=null;
  req.session.password=null;
  req.session.loggedin=false;

  res.redirect('/');
});
app.post("/issue", function (req, res,fields) {
    var username = req.body.username;
    var ISBN = req.body.ISBN;
    res.setHeader("Content-Type", "application/json");
    if (username && ISBN) {
      console.log("Issueing " + ISBN);
      var title="None";
      var sql1="SELECT book_name FROM library_boooks WHERE ISBN="+ISBN;
      console.log(sql1);
      db.query(sql1, (err,results)=>{
        if (err) console.log(err);
        if (results.length > 0) title=results[0].book_name;
        console.log(results);
      });
  
  
      var username = req.session.username;
      var sql =
        "INSERT INTO `issue_and_return` (`id`, `ISBN`, `Title`, `mem_id`, `issue_date`, `expiry_date`, `returning`, `return_approved`, `fine`) VALUES (NULL, '" +
        ISBN +
        "', '" +
        title +
        "', '" +
        username +
        "', '2022-01-11', '2022-01-31', '0', '0', '0')";
      db.query(sql, function (err, data, fields) {
        if (err) {
          var content = {
            request: "valid",
            issued: false,
            message: err.message,
            title: title
          };
          res.send(content);
        } else {
            var sql2= "UPDATE library_boooks SET no_of_books = no_of_books - 1 WHERE ISBN='"+ISBN+"' and no_of_books >0;";
		        db.query(sql2, (err2, results2)=>{
		      	if (err2){ console.log(err2);}
		
		      });
          var content = {
            request: "valid",
            issued: true,
            message: "book issued",
            title: title
          };
          res.send(content);
        }
      });
    } else {
      var content = {
        request: "invalid",
        issued: false,
        message: "request invalid",
      };
      res.send(JSON.stringify(content));
    }
  });

app.post('/editBook', function(req, res){
  var body= req.body;
  var title=req.body.title;
  if (req.body.book_name) title= req.body.book_name;
  var isbn= req.body.ISBN;
  var author= req.body.author;
  if (req.body.author_name) author= req.body.author_name;
  var count = 3;
  if (req.body.count) count=req.body.count;
  else if (req.body.no_of_books) count=req.body.no_of_books;
  var rack= req.body.rack_no;
  var price= req.body.price;
    var body= req.body;
  res.setHeader("Content-Type", "application/json");
  if (body.username&&body.ISBN){
    sql="UPDATE `library_boooks` SET `ISBN` = '"+isbn+"',`book_name` = '"+title+"', `no_of_books` = '"+count+"', `rack_no` = '"+rack+"', `price` = '"+price+"', `author_name` ='"+author+"' WHERE `library_boooks`.`ISBN` = '"+isbn+"'";
    console.log(sql);
    db.query(sql, function (err, data, fields) {
    if (err) console.log(err);
    body.request="valid";
    body.edited=true;
    res.send(body);
    });
    
  }
  else 
  {
    body.request="invalid";
    body.edited=false;
    res.send(body);
  }
});

app.post('/addBook', function(req, res){
    var body= req.body;
    var title=req.body.title;
    if (req.body.book_name) title= req.body.book_name;
    var isbn= req.body.ISBN;
    var author= req.body.author;
    if (req.body.author_name) author= req.body.author_name;
    var count = 3;
    if (req.body.count) count=req.body.count;
    else if (req.body.no_of_books) count=req.body.no_of_books;
    var rack= req.body.rack_no;
    var price= req.body.price;
      var body= req.body;
      res.setHeader("Content-Type", "application/json");
      if (body.username&&body.ISBN){
        sql="INSERT INTO `library_boooks` SET `ISBN` = '"+isbn+"',`book_name` = '"+title+"', `no_of_books` = '"+count+"', `rack_no` = '"+rack+"', `price` = '"+price+"', `author_name`='"+author+"'";
        console.log(sql);
        db.query(sql, function (err, data, fields) {
        if (err) console.log(err);
        body.request="valid";
        body.edited=true;
        res.send(body);
        });
        
      }
      else 
      {
        body.request="invalid";
        body.edited=false;
        res.send(body);
      }
});


app.post('/delBook', function(req,res){
        var body= req.body;
        res.setHeader("Content-Type", "application/json");
        if (body.username && body.ISBN){
          var sql= "DELETE FROM library_boooks WHERE isbn='"+body.ISBN+"'";
          db.query(sql, (err,data)=>{
            if (err)console.log(err);
            else{
                var content={
                request: "valid",
                deleted: true
              }
              res.send(content);}
          });
            
        }
        else {
          var content={
            request: "invalid",
            deleted: false
          }
          res.send(content);
        }
});

app.post('/issuedBooks',function(req, res){
  var username=req.body.username;
  res.setHeader('Content-Type', 'application/json')
  db.query('SELECT * FROM issue_and_return WHERE mem_id= ? AND return_approved = 0 ORDER BY issue_and_return.issue_date DESC',[username],function (err, data, fields){
    if (err) throw err;
    res.send(JSON.stringify(data));
});
});

app.post('/returnBook', function(req,res){
    var body= req.body;
    res.setHeader("Content-Type", "application/json");
    if (body.id && body.username){
    sql="UPDATE issue_and_return SET return_approved= '1', returning= '1' WHERE id='"+body.id+"'";
    db.query(sql, (err,results)=>{
        if (err) console.log(err);
        else{
            var content={
                request:"valid",
                return: true,
                message:"Book return process has started. Contact the librarian and pay the fine.",
                fine:100
              };
              res.send(content);
        }
    });
        
    }
    else {
      var content={
        request:"invalid",
        return: false,
        message:"Provide username and return id",
        fine:0
      };
      res.send(content);
    }
  
});


app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/books", bookRouter);
app.use("/reg", registration);

app.set("views", path.join(__dirname, "views"));

app.use(logger("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("404  Error");
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  console.log(err.message);
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.send("Error " + err.status);
});
app.listen(8080);
