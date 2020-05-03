const { Schema, model } = require('mongoose');

const newRoom = new Schema({
    message:  [{
        myIdMsg: String,
        msg: String,
        date: {type: Date, default: Date.now}
    }],
    myId:       { type: Schema.Types.ObjectId, ref: 'User' },
    youId:      {type: Schema.Types.ObjectId, ref: 'User' }
})


module.exports = model('Rooms', newRoom)