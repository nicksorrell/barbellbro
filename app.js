"use strict";
var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    hostname = process.env.HOSTNAME || 'localhost',
    port = parseInt(process.envPORT, 10) || 1337,
    publicDir = process.argv[2] || __dirname + '/public';

app.get('/', function(req, res) {
  res.redirect("/index.html");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(publicDir));

console.log("Showing '%s' listening at %s:%s", publicDir, hostname, port);
app.listen(port, hostname);
