const express = require('express');
const hb = require('express-handlebars');
const cookieParser = require('cookie-parser');

const { addUser, returnInfo } = require('./db'); //?

const app = express();

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(cookieParser());

app.use(
    express.urlencoded({
        extended: false
    })
);
//set folder to serve
app.use(express.static('./public'));

//Using the cookie to see if we have to redirect or can show the info
app.use(function(req, res, next) {
    if (req.cookies.authentication !== 'yes' && req.url != '/petition') {
        res.redirect('/petition');
    } else {
        next();
    }
});

app.get('/petition', (req, res) => {
    res.render('petition', {
        layout: 'main'
    });
});

app.post('/petition', (req, res) => {
    //Sending information form the form to the Database
    addUser(req.body.first, req.body.last, req.body.signature);
    res.cookie('authentication', 'yes');

    //Redirect to the Thanks route
    res.redirect('/thanks');
});

app.get('/thanks', (req, res) => {
    res.render('thanks', {
        layout: 'main'
    });
});

app.get('/signers', (req, res) => {
    
    //destructuring data
    returnInfo().then(({rows}) => {
        res.render('signers', {
            layout: 'main',
            rows
        });
    });
});


app.listen(8080, () => console.log('server is listening'));
