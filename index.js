const express = require('express');
const hb = require('express-handlebars');
const cookieSession = require('cookie-session');

const { addUser, returnInfo, userInfo } = require('./db'); //?

const app = express();

app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

app.use(
    express.urlencoded({
        extended: false
    })
);
//set folder to serve
app.use(express.static('./public'));

//Cookie to check if the user haven't change data
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14 //2 Weeks it will last the cookie, when it's over expire
    })
);

//Using the cookie to see if we have to redirect or can show the info
app.use(function(req, res, next) {

    if (Object.entries(req.session).length ==0 && req.url != '/petition') {
        res.redirect('/petition');
    } else {
        next();
    }
});

app.get('/petition', (req, res) => {
    //clean session  req.session = null

    res.render('petition', {
        layout: 'main'
    });
});

app.post('/petition', (req, res) => {
    //Sending information form the form to the Database
    addUser(req.body.first, req.body.last, req.body.signature).then(({rows}) => {
        
        console.log(rows[0].id)
        //ID session of the user
        req.session.userId =rows[0].id

        console.log(req.session);


        //Redirect to the Thanks route
        res.redirect('/thanks');
    }).catch(err=>console.log(err));
});

app.get('/thanks', (req, res) => {

    userInfo(req.session.userId).then(({rows})=>{

        console.log(rows)
        const data = rows
        res.render('thanks', {
            layout: 'main',
            data
        });

    })
  



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

app.listen(8080, () => console.log('server is listening'));
