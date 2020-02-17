const bcrypt = require('bcryptjs')
let {genSalt, hash, compare} = bcrypt
const {promisify} = require('util')


genSalt = promisify(genSalt)
hash= promisify(hash)
compare = promisify(compare)


module.exports.compare = compare;
module.exports.hash = plaintext=> genSalt().then(salt=>hash(plaintext,salt))



//how it works.

// genSalt().then( salt =>{

//     return hash('password',salt)
// }).then(hashedPassword => {
//     return compare('password',hashedPassword)
// }).then(check => console.log(check))