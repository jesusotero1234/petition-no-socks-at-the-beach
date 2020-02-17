const spicePg = require('spiced-pg');



const db = spicePg('postgres://postgres:postgres@localhost:5432/petition')


//Insert User information
exports.addUserUserInfo = function(firstName, lastName, email,password) {
    return db.query(
        `INSERT INTO userInfo (firstName, lastName, email,password)
        VALUES ($1, $2, $3,$4) RETURNING id`,
        [firstName, lastName, email,password]
    )
}

//Save Signature
exports.saveSignature = function(signature,user_id) {
    return db.query(
        `INSERT INTO signatures (signature, user_id)
        VALUES ($1, $2)`,
        [signature,user_id]
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
        `SELECT userInfo.firstName, userInfo.lastName, signatures.signature FROM userInfo LEFT JOIN signatures ON userInfo.id = signatures.user_id WHERE signatures.user_id=$1`,[id]
    )
}

//LogIn
exports.logIn =function(email) {
    return db.query(
        `SELECT email,password,id FROM userInfo WHERE email=$1`,[email]
    )
}