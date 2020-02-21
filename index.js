const express = require('express');
require('custom-env').env();
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');
const csurf = require('csurf');
const {
    addUserUserInfo,
    returnInfo,
    userInfo,
    saveSignature,
    logIn,
    userProfile,
    usersFromCity,
    editUser,
    editUserNoPass,
    editUserPass,
    editUserUpsert,
    deleteSignature,
    deleteProfile
} = require('./db'); //?
const { hash, compare } = require('./utils/bCrypts');
const { url, checkEmail, ageCheck } = require('./public/js/functions.js');





const app = express();
exports.app = app;
let logged = false;

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

//set folder to serve
app.use(express.static('./public'));

//Cookie to check if the user haven't change data
app.use(
    cookieSession({
        secret: process.env.SECRETS,
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
    if (!req.session.userId && req.url != '/register' && req.url != '/login') {

        res.redirect('/register');
        // if (
           
        //     !req.session.userId &&
        //     req.url != '/register' &&
        //     req.url != '/login'
        // ) {
        //     res.redirect('/register');
    } else if (
        !req.session.userId &&
        req.url == '/login'
    ) {
        console.log('entered')
        res.locals.csrfToken = req.csrfToken();
        next()
    }else if (
        req.session.userId &&
        req.url == '/register' ||
        req.url == '/login'
    ) {
        console.log('entered')
        res.redirect('/petition');
    } else {
        res.locals.csrfToken = req.csrfToken();
        next();
    }
});

app.use(function (req,res,next){


    //This is, if the person tries to not use a number in age
    if(req.body.age && req.url == '/profile' && isNaN(req.body.age)){
        res.render('profile', {
            layout: 'main',
            logged: true,
            error: 'the age is not correct please check'
        });
    }else if(req.body.age && req.url == '/profile/edit' && isNaN(req.body.age)){
        editUser(req.session.userId).then(({ rows }) => {
            const data = rows[0];
            res.render('edit', {
                data,
                logged: true,
                error: 'Your Age is not valid'
            });
        });
        return
    }
    else{next()}


})

app.get('/register', (req, res) => {
    res.render('register', {
        layout: 'main',
        error: ''
    });
});

app.post('/register', (req, res) => {
    if (
        req.body.firstName.trim().length == 0 ||
        req.body.lastName == 0 ||
        req.body.email == 0 ||
        req.body.password == 0 || req.body.password.length <=7 
    ) {
        res.render('register', {
            layout: 'main',
            error:
                'Looks like you have an error, please fill all the information and sign before Submit, password should contain at least 8 character'
        });
        return;
    }

    if(!checkEmail(req.body.email)){
        res.render('register', {
            layout: 'main',
            error:
            'Looks like you have an error, please fill all the information and sign before Submit, password should contain at least 8 character'
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
                    // console.log('should not been save');
                    req.session.userId = rows[0].id;
                    res.redirect('/profile');
                    // res.sendStatus(200);
                })
                .catch(err => {
                    console.log(err);
                    res.render('register', {
                        layout: 'main',
                        error:
                            'Looks like you have an error, please fill correct all the information before Submit'
                    });
                    return;
                });
        })
        .catch(err => {
            console.log(err);
        });
    //send the password and email to the database
});

app.get('/login', (req, res) => {

    req.session
    
    res.render('login', {
        layout: 'main',
        error: '',
        logged
    });
});

app.post('/login', (req, res) => {
        
    ///if password doesn't match  render error
    if (
        req.body.email.trim().length > 0 &&
        req.body.password.trim().length > 0
    ) {
        console.log(req.body.email);

        logIn(req.body.email)
            .then(({ rows }) => {
                if (rows.length <= 0) {
                    res.render('login', {
                        layout: 'main',
                        error: 'Your username or password is incorrect'
                    });
                }
                compare(req.body.password, rows[0].password)
                    .then(boolean => {
                        if (boolean) {
                            req.session.userId = rows[0].id;
                            userInfo(req.session.userId)
                                .then(({ rows }) => {
                                    if (rows.length == 0) {
                                        res.redirect('/profile');
                                    } else {
                                        res.redirect('/thanks');
                                    }
                                })
                                .catch(err => {
                                    console.log(err);
                                });
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
                    })
                    .catch(() => console.log('incorrect password'));
            })
            .catch(err => console.log(err));
    } else {
        res.render('login', {
            layout: 'main',
            error: 'Your username or password is incorrect'
        });
    }
});

app.get('/petition', (req, res) => {
    userInfo(req.session.userId).then(({ rows }) => {
        // console.log(req.session);
        if (rows.length > 0) {
            res.redirect('/thanks');
        } else {
            res.render('petition', {
                layout: 'main',
                error: '',
                logged: true
            });
        }
    });

    //clean session  req.session = null
});

app.post('/petition', (req, res) => {
    //check if the user tries to save another signature without deleting the previous one
    userInfo(req.session.userId).then(({ rows }) => {
        if (rows.length == 0 && req.body.signature.trim().length > 0) {
            saveSignature(req.body.signature, req.session.userId)
                .then(() => res.redirect('/thanks'))
                .catch(err => {
                    console.log(err);
                    res.redirect('/register');
                });
        } else {
            res.render('petition', {
                layout: 'main',
                error:
                    'Error, please delete your current signature before saving a new one.    ',
                logged: true
            });
        }
    });
});

app.post('/petition/deleteSignature', (req, res) => {
    deleteSignature(req.session.userId)
        .then(() => {
            console.log('succed deleting signature');
            res.redirect('/petition');
        })
        .catch(err => {
            console.log(err);
            res.redirect('/petition');
        });
});

app.post('/petition/deleteProfile', (req, res) => {
    deleteProfile(req.session.userId)
        .then(() => {
            console.log('succed deleting profile');
            req.session = null
            res.redirect('/register');
        })
        .catch(err => {
            console.log(err);
            req.session = null
            res.redirect('/login');
        });
});

app.get('/thanks', (req, res) => {
    userInfo(req.session.userId).then(({ rows }) => {
        const data = rows;
        if (Object.keys(rows).length == 0) {
            res.redirect('/petition');
        } else {
            res.render('thanks', {
                layout: 'main',
                data,
                logged: true
            });
        }
    });
});

app.get('/signers', (req, res) => {
    //destructuring data
    userInfo(req.session.userId).then(({ rows }) => {
        if (Object.keys(rows).length == 0) {
            res.redirect('/petition');
        } else {
            returnInfo()
                .then(({ rows }) => {
                    console.log(rows);
                    if (rows.length == 0) {
                        res.render('signers', {
                            layout: 'main',
                            error: 'No Signers has signed the petition',
                            rows,
                            render: false,
                            logged: true
                        });
                    } else {
                        console.log('entered');
                        res.render('signers', {
                            layout: 'main',
                            error: '',
                            rows,
                            logged: true,
                            render: true,
                            helpers: {
                                showAnchorUser(url, name) {
                                    if (url == null) {
                                        return `<td>${name}</td>`;
                                    }
                                    if (url.trim().length == 0) {
                                        return `<td>${name}</td>`;
                                    } else {
                                        return `<td><a href="${url}" target="_blank">${name}</a></td>`;
                                    }
                                }
                            }
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
    });
});

app.get('/profile', (req, res) => {
    res.render('profile', {
        layout: 'main',
        logged: true
    });
});

app.post('/profile', (req, res) => {
    if (
        req.body.age.trim().length == 0 &&
        req.body.city.trim().length == 0 &&
        req.body.url.trim().length == 0
    ) {
        res.redirect('/petition');
    } 
    
    else {

        console.log('url', url(req.body.url.trim()));
        console.log(ageCheck(req.body.age.trim()))
        userProfile(
            ageCheck(req.body.age.trim()),
            req.body.city.trim(),
            url(req.body.url.trim()),
            req.session.userId
        )
            .then(() => res.redirect('/thanks'))
            .catch(err => {
                console.log(err);
                res.redirect('/profile');
            });
    }
});

app.get('/signers/:city', function(req, res) {
    usersFromCity(req.params.city.toLowerCase())
        .then(({ rows }) => {
            const data = rows;
            console.log(data);
            res.render('signersCity', {
                // layout: 'main',
                data,
                logged: true
            });
        })
        .catch(err => console.log(err));
});

app.get('/logout', function(req, res) {
    req.session = null;
    res.redirect('/login');
    logged = false;
});

app.get('/profile/edit', function(req, res) {
    console.log(req.session);
    editUser(req.session.userId).then(({ rows }) => {
        const data = rows[0];
        res.render('edit', {
            data,
            logged: true
        });
    });
});

app.post('/profile/edit', function(req, res) {
    //if wants to change password
    if (req.body.password.trim().length <=7) {

        if(!checkEmail(req.body.email)){
            editUser(req.session.userId).then(({ rows }) => {
                const data = rows[0];
                res.render('edit', {
                    data,
                    logged: true,
                    error: 'Your Email is not valid'
                });
            });
            return
        }

        hash(req.body.password)
            .then(hashedpass => {
                editUserPass(
                    req.body.firstName,
                    req.body.lastName,
                    req.body.email,
                    hashedpass,
                    req.session.userId
                )
                    .then(() => {
                        console.log('worked first part upsert');
                        editUserUpsert(
                            req.body.age,
                            req.body.city,
                            url(req.body.url),
                            req.session.userId
                        )
                            .then(() => {
                                console.log('worked part 2 upsert');
                                res.redirect('/profile/edit');
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    } else {

        if(!checkEmail(req.body.email)){
            editUser(req.session.userId).then(({ rows }) => {
                const data = rows[0];
                res.render('edit', {
                    data,
                    logged: true,
                    error: 'Your Email is not valid'
                });
            });
            return
        }

        editUserNoPass(
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.session.userId
        )
            .then(() => {
                console.log('worked first part upsert');
                editUserUpsert(
                    req.body.age,
                    req.body.city,
                    url(req.body.url)   ,
                    req.session.userId
                )
                    .then(() => {
                        console.log('worked part 2 upsert');
                        res.redirect('/profile/edit');
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }
});

app.get('*', function(req, res) {
    res.redirect('/login');
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log('server is listening')
    );
}
