const os = require('os')

module.exports = (app) =>{
    console.log('Hello system');
    let dev = os.endianness()
    console.log(dev);
}