const spicePg = require('spiced-pg');



const db = spicePg( process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/petition')


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
        `SELECT CONCAT(userInfo.firstName, ' ', userInfo.lastName) AS fullname , age, city, url 
         FROM userInfo 
         LEFT JOIN userProfiles ON userInfo.id = userProfiles.user_id
         JOIN signatures ON userInfo.id = signatures.user_id
         `
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
        `SELECT email, password,id FROM userInfo WHERE email=$1`,[email]
    )
}

//save information in userProfile table
exports.userProfile= (age,city,url,user_id)=>{

    return db.query(
        `INSERT INTO userProfiles (age, city, url, user_id)
        VALUES ($1, $2, $3, $4)`,[age,city,url,user_id]
    )
}  

//take users from City
exports.usersFromCity = (city)=>{
    return db.query(
        `SELECT firstName, lastName , age, city, url 
        FROM signatures 
        LEFT JOIN userInfo ON signatures.user_id = userInfo.id  
        LEFT JOIN userProfiles ON signatures.user_id = userProfiles.user_id
        WHERE LOWER(city)=$1`,[city]
    )
}

//Retrieve user Profile to edit
exports.editUser= (id)=>{

    return db.query(
        `SELECT firstName, LastName, email, age, city, url 
        FROM userInfo LEFT JOIN userProfiles ON userInfo.id = userProfiles.user_id 
        WHERE userInfo.id=$1`,[id]
    )
}  


//Update user Profile when they edit it
exports.editUserNoPass= (firstName, lastName, email, id)=>{

    return db.query(

        `UPDATE userInfo SET firstName = $1, LastName = $2, email= $3 WHERE id = $4`, [firstName,lastName,email,id]

    )
}  
exports.editUserPass= (firstName, lastName, email, password, id)=>{

    return db.query(

        `UPDATE userInfo SET firstName = $1, LastName = $2, email= $3, password=$4 WHERE id = $5`, [firstName,lastName,email,password,id]

    )
}  
exports.editUserUpsert= (age,city,url,id)=>{
    
    return db.query(

        `INSERT INTO userProfiles (age, city, url,user_id)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (user_id)
         DO UPDATE SET age = $1, city = $2, url=$3`,[age, city, url, id]
    )
}  

exports.deleteSignature= (id)=>{
    
    return db.query(

        `DELETE FROM signatures WHERE user_id=$1`,[id]
    )
}  

exports.deleteProfile= (id)=>{
    
    return db.query(

        `DELETE FROM userInfo WHERE id=$1`,[id]
    )
} 
