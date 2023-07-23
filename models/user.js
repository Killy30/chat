const { Schema, model} = require('mongoose')
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
    nombre: {type: String},
    email:  {type: String},
    password: {type: String},
    user_number: {type: String},
    rooms: [{type: Schema.Types.ObjectId, ref: 'rooms'}],
    contacts: [{type: Schema.Types.ObjectId, ref: 'contact'}]
})

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(9), null);
};

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password)
};

module.exports = model('User', userSchema)