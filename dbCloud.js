
var mysql= require('mysql');

const pool=mysql.createPool({
  user: "root", // e.g. 'my-db-user'
  password: "sahar1234", // e.g. 'my-db-password'
  database: "library", // e.g. 'my-database'
  // If connecting via unix domain socket, specify the path
  socketPath: '/cloudsql/digitallibrary-343516:us-central1:digital-library',
  // Specify additional properties here.
});

module.exports =pool; 

