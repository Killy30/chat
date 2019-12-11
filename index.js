const express = require('express');
const app =express();
const serve = require('http').createServer(app)
const io = require('socket.io')(serve);
const User = require('./models/user')
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser')
const Rooms = require('./models/chat')

require('./models/database')
require('./passport/local-aut');

app.set('port', process.env.PORT || 5000)
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use(bodyParser.json())

app.use(session({
    secret: 'miSecretoOk',
    resave: false,
    saveUninitialized: false
}))
app.use(flash())
app.use(passport.initialize());
app.use(passport.session()) 

app.use( async(req, res, next) => {
    app.locals.registroMessage   = req.flash('registroMessage');
    app.locals.iniciarMessage   = req.flash('iniciarMessage');
    next();
})
    
app.get('/', async (req , res) => {
    res.render('index')
})

app.get('/registrar', async (req , res) => {
    res.render('registro')
})
    
app.post('/', passport.authenticate('local-login', {
    successRedirect: '/chat',
    failureRedirect: '/',
    passReqToCallback: true
}));

app.post('/registrar',  passport.authenticate('local-signup', {
    successRedirect: '/chat',
    failureRedirect: '/registrar',
    passReqToCallback: true
}));

app.get('/chat', estaAutenticado, (req, res) => {
    var user = req.user;
    res.render('room', { user })
    io.emit('nuevo-usuario', user)
})

app.post('/message/:id', async(req, res) => {
    let data = JSON.parse(req.params.id);

    if (data.idRoom != undefined) {
        const roomId = await Rooms.findOne({_id: data.idRoom})
        
        var msj = {
            myIdMsg:  data.myId,
            msg:      data.msj
        }
        roomId.message.push(msj);
        await roomId.save();
        res.json({roomId})
    }
})

app.post('/chat/:id',async(req, res) => {
    var myUser = req.user;
    var ids = JSON.parse(req.params.id);
    const user = await User.findOne({_id: ids.userId})
    
    const roomId = await Rooms.findOne({ $and:[ 
        {myId: {$in: [ids.userId, ids.myId] }},
        {youId: {$in: [ids.userId, ids.myId] }}
    ]})
    
    if (roomId == null) {
        const newRoom = new Rooms();
        newRoom.myId = myUser;
        newRoom.youId = user;

        await newRoom.save();
        myUser.rooms.push(newRoom);
        await myUser.save();
        return res.json({ user:user,  idRoom:newRoom});
    }
   
    const h = user.rooms.includes(roomId._id)
    const g = myUser.rooms.includes(roomId._id)

    if(h == false) {
        user.rooms.push(roomId);
        await user.save();
        console.log('heyyyy  ',user.rooms);
        return res.json({ user:user,  idRoom:roomId});
    }
            
    res.json({ user:user,  idRoom:roomId})
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

app.use(express.static(path.join(__dirname, 'public')))

//socket
io.on('connection', async(socket) => {
    console.log('chat conectada');
    const user = await User.find({}).populate('rooms')
    const room = await Rooms.find({}).populate('user')
    
    socket.emit('usuarios', {user,room})

    socket.on('user-to-join', async(ids) =>{
        const myUser = await User.findOne({_id: ids.userId}).populate('rooms')
        
        socket.join(ids.roomUser)
        socket.to(ids.roomUser).emit('joining', myUser)
    })

    socket.on('nuevo-msj', async(data) =>{
        const roomMsj = await Rooms.findOne({_id: data.idRoom}).populate('user')
        socket.to(roomMsj._id).emit('emitiendo', data)
    })
})

serve.listen(app.get('port'), () => {
    console.log('servidor funcionando', app.get('port'));
})


