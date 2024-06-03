const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const db = require('./database');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const secret = crypto.randomBytes(64).toString('hex');
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

const authenticationRouter = require('./routes/auth');
app.use("/auth", authenticationRouter);

const tasksRouter = require('./routes/tasks');
app.use("/tasks", tasksRouter);

app.get("/", (req, res) => {
    res.render("index", { currentUser : req.session.username});
});

app.get("/about", (req, res) => {
    res.render("about", { currentUser : req.session.username});
});

app.listen(3000);