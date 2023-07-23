const { Schema, model } = require('mongoose');

const newRoom = new Schema({
    message: [{
        myIdMsg: String,
        msg: String,
        dateMsg: {type: Date, default: Date.now},
        img: String,
        viewMsg: {
            view: {type: Boolean, default: false},
            dateView: {type: Date}
        }
    }],
    xid: { type: Schema.Types.ObjectId, ref: 'User' },
    yid: {type: Schema.Types.ObjectId, ref: 'User' }
})

module.exports = model('rooms', newRoom)