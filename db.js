const spicePg = require('spiced-pg');



const db = spicePg('postgres://postgres:postgres@localhost:5432/petition')


//Insert User information

exports.addUser = function(firstName, lastName, signature) {
    return db.query(
        `INSERT INTO userInfo (firstName, lastName, signature)
        VALUES ($2, $1, $3)`,
        [firstName, lastName, signature]
    )
}

//Retrieve UsersInfo

exports.returnInfo = function() {
    return db.query(
        `SELECT firstName, lastName FROM userInfo`
    )
}

