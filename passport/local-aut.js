const passport = require('passport');
const LocalStatregy = require('passport-local').Strategy;
const User = require('../models/user');
const yesID = require('../yesID')

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async(id, done) => {
     const user = await User.findById(id);
     done(null, user)
});
passport.use('local-signup', new LocalStatregy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {

    const user = await User.findOne({email: email})
    if(user) {
        return done(null, false, req.flash('registroMessage', 'Email existente'));
    }else{
        const users = await User.find()
        const newUser = new User();
        
        function getNumber() {
            if(users.some(user => user.user_number == yesID(5, '995-'))){
                return getNumber()
            }
            return yesID(5, '995-')
        }
        
        newUser.nombre = req.body.nombre;
        newUser.email = email;
        newUser.user_number = getNumber();
        newUser.password = newUser.encryptPassword(password);
        await newUser.save();
        done(null, newUser);
    };
}));

passport.use('local-login', new LocalStatregy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, email, password, done) => {
    const user = await User.findOne({email: email});
    if(!user){
        return done(null, false, req.flash('iniciarMessage', 'Usuario no encontrado') )
    }
    if(!user.comparePassword(password)){
        return done(null, false, req.flash('iniciarMessage', 'Contraseña incorrecta') )
    }
    done(null, user)
}))