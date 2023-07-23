const { Schema, model } = require('mongoose') 

const myContact = new Schema({
    name: {type: String},
    number: {type: String},
    date: {type: Date, default: Date.now},
    user: {type: Schema.Types.ObjectId, ref:'User'}
})

module.exports = model('contact', myContact)