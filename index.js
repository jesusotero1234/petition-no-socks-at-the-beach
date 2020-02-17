const express = require('express');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const csurf = require('csurf');
const secrets = require('./secrets.json');
const {
    addUserUserInfo,
    returnInfo,
    userInfo,
    saveSignature,
    logIn
} = require('./db'); //?
const { hash, compare } = require('./utils/bCrypts');

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
        req.url != '/register' &&
        req.url != '/login'
    ) {
        res.redirect('/register');
    } else {
        // if (req.url == 'login') {
        //     console.log('test')
        //     res.redirect('/thanks');
        //     return;
        // }
        res.locals.csrfToken = req.csrfToken();
        next();
    }
});

app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'main',
        error: ''
    });
});

app.post('/register', (req, res) => {
    //take the password from the form
    console.log(req.body);
    if (
        req.body.firstName.trim().length == 0 ||
        req.body.lastName == 0 ||
        req.body.email == 0 ||
        req.body.password == 0
    ) {
        res.render('register', {
            layout: 'main',
            error:
                'Looks like you have an error, please fill all the information and sign before Submit'
        });
        return;
    }
    //hash it
    hash(req.body.password)
        .then(hashedpass => {
            addUserUserInfo(
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                hashedpass
            )
                .then(({ rows }) => {
                    console.log('should not been save');
                    req.session.userId = rows[0].id;
                    res.redirect('/petition');
                    res.sendStatus(200);
                })
                .catch(err => {
                    console.log(err);
                    // res.sendStatus(400);
                });
        })
        .catch(err => {
            console.log(err);
        });
    //send the password and email to the database
});

app.get('/login', (req, res) => {
    res.render('login', {
        layout: 'main',
        error: ''
    });
});

app.post('/login', (req, res) => {
    //compare the password and look with the email and Id
    
    if (req.body.email.trim().length > 0 && req.body.password.trim().length > 0) {
        // console.log(req.body.email)
        logIn(req.body.email).then(({ rows }) => {
            compare(req.body.password, rows[0].password)
                .then(boolean => {
                    if (boolean) {
                        req.session.userId = rows[0].id;
                        res.redirect('/thanks');
                    } else {
                        res.render('login', {
                            layout: 'main',
                            error: 'Your username or password is incorrect'
                        });
                    }
                    //if it's true  then redirect to petition and store the cookie, if it's not true trigger an Error message
                })
                .catch(err => {
                    console.log(err);
                });
        }).catch(err=>console.log(err));
    } else {
        res.render('login', {
            layout: 'main',
            error: 'Your username or password is incorrect'
        });
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
    saveSignature(req.body.signature, req.session.userId)
        .then(() => res.redirect('/thanks'))
        .catch(err => {
            console.log(err);
            res.redirect('/register');
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
    res.redirect('/login');
});

app.listen(8080, () => console.log('server is listening'));
