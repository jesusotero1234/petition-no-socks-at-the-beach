const validator = require('email-validator');

exports.url = str => {
    if (str.trim().length == 0) {
        return '';
    }

    if (str.indexOf('http') >= 0 || str.indexOf('https') >= 0) {
        return str;
    } else if (
        str.indexOf('http') < 0 &&
        str.indexOf('https') < 0 &&
        str.indexOf('//') >= 0
    ) {
        return `https:${str}`;
    } else {
        return `http://${str}`;
    }
};

const checkEmail = (exports.checkEmail = str =>  validator.validate(str));


const ageCheck = exports.ageCheck = (str)=> (parseInt(str))