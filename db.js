const spicePg = require('spiced-pg');



const db = spicePg('postgres://postgres:postgres@localhost:5432/petition')


//Insert User information

exports.addUser = function(firstName, lastName, signature) {
    return db.query(
        `INSERT INTO userInfo (firstName, lastName, signature)
        VALUES ($1, $2, $3) RETURNING id`,
        [firstName, lastName, signature]
    )
}

//Retrieve UsersInfo

exports.returnInfo = function() {
    return db.query(
        `SELECT firstName, lastName FROM userInfo`
    )
}


//Retrieve Signature
exports.userInfo = function(id) {
    return db.query(
        `SELECT firstName, lastName, signature FROM userInfo WHERE id =$1`,[id]
    )
}
