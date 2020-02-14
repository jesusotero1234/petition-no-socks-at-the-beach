const express = require('express');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const csurf = require('csurf');
const secrets = require('./secrets.json')

const { addUser, returnInfo, userInfo } = require('./db'); //?

const app = express();

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

//set folder to serve
app.use(express.static('./public'));

//Cookie to check if the user haven't change data
app.use(
    cookieSession({
        secret: secrets.secret,
        maxAge: 1000 * 60 * 60 * 24 * 14 //2 Weeks it will last the cookie, when it's over expire
    })
);

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(csurf());
//Using the cookie to see if we have to redirect or can show the info
app.use(function(req, res, next) {
    console.log(Object.keys(req.session));
    if (
        Object.keys(req.session).length == 1 &&
        Object.keys(req.session) == 'csrfSecret' &&
        req.url != '/petition'
    ) {
        res.redirect('/petition');
    } else {
        res.locals.csrfToken = req.csrfToken();
        next();
    }
});

app.get('/petition', (req, res) => {
    //clean session  req.session = null

    res.render('petition', {
        layout: 'main',
        error: ''
    });
});

app.post('/petition', (req, res) => {
    //Sending information form the form to the Database

    addUser(req.body.first, req.body.last, req.body.signature)
        .then(({ rows }) => {
      
            //ID session of the user
            req.session.userId = rows[0].id;

            //Redirect to the Thanks route
            res.redirect('/thanks');
        })
        .catch(err => {

            //This displays a message when an error has happened
            res.render('petition', {
                layout: 'main',
                error: 'Looks like you have an error, please fill all the information and sign before Submit'
            });
            console.log(err);
        });
});

app.get('/thanks', (req, res) => {
    userInfo(req.session.userId).then(({ rows }) => {
      
        const data = rows;
        res.render('thanks', {
            layout: 'main',
            data
        });
    });
});

app.get('/signers', (req, res) => {
    //destructuring data
    returnInfo().then(({ rows }) => {
        res.render('signers', {
            layout: 'main',
            rows
        });
    });
});

app.get('*', function(req, res) {
    res.redirect('/petition');
});

app.listen(8080, () => console.log('server is listening'));
