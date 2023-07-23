const express = require('express')
const router = express.Router()
const passport = require('passport')
const os = require('os')

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
        var user = req.user;
        let systemData = {}
        systemData['platform'] = os.platform()
        systemData['hostname'] = os.hostname()
        systemData['version'] = os.version()
        systemData['userInfo'] = os.userInfo()
        systemData['re'] = os.type()
        console.log(systemData);
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