const express = require('express')
const router = express.Router()
const passport = require('passport')

module.exports = (app) => {
    router.get('/', async (req , res) => {
        res.render('index')
    })
    
    router.get('/registrar', async (req , res) => {
        res.render('registro')
    })

    router.post('/', passport.authenticate('local-login', {
        successRedirect: '/chat',
        failureRedirect: '/',
        passReqToCallback: true 
    }));

    router.post('/registrar',  passport.authenticate('local-signup', {
        successRedirect: '/chat',
        failureRedirect: '/registrar',
        passReqToCallback: true
    }));
    
    router.get('/chat', estaAutenticado, (req, res) => {
        const user = req.user;
        res.render('main', { user })
    })

    app.get('/logout', (req, res, next) => {
        req.logout();
        res.redirect('/')
    })
    
    function estaAutenticado(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        res.redirect('/')
    }
    
    app.use(router)
}