//const mongoose = require('mongoose');
var crypto = require('crypto');

// const UserSchema = mongoose.Schema({
//     name : {
//         type : String,
//         required : true
//     },
//     email : {
//         type : String,
//         required : true
//     },
//     hash : String,
//     salt : String
// });

generateHashandSalt = function(password) {
 // Creating a unique salt for a particular user
    this.salt = crypto.randomBytes(16).toString('hex');
    console.log("salt",this.salt);
    // Hashing user's salt and password with 1000 iterations,
    //64 length and sha512 digest
    this.hash = crypto.pbkdf2Sync(password, this.salt,1000, 64, 'sha512').toString('hex');
    console.log("hash",this.hash);
    return salt,hash;
};

generateHashandSalt('Meluha17!');
generateHashandSalt('Surya123!');
