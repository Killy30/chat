const { Schema, model} = require('mongoose')
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
    nombre: {type: String},
    email:  {type: String},
    password: {type: String},
    rooms: [{type: Schema.Types.ObjectId, ref: 'Rooms'}]
})

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(9), null);
};

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password)
};

module.exports = model('User', userSchema)