// exports.url =
exports.url = str => {
    if (str.trim().length == 0) {
                return '';
            }
        
            if (str.indexOf('http') >= 0 && str.indexOf('https') >= 0) {
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

// return new Promise((resolve, reject) => {
//     if (str.trim().length == 0) {
//         resolve('');
//     }

//     if (str.indexOf('http') >= 0/*?*/) {
//         resolve(str);
//     } else if (str.indexOf('https') >= 0) {
//         resolve(str);
//     } else if (
//         str.indexOf('http') < 0 &&
//         str.indexOf('https') < 0 &&
//         str.indexOf('//') >= 0
//     ) {
//         resolve(`https:${str}`);
//     } else {
//         resolve(`http://${str}`);
//     }
// });
