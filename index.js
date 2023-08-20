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
const Rooms = require('./models/room')
const morgan = require('morgan')
const multer = require('multer');

require('./config/configDB')
require('./passport/local-aut');

app.set('port', process.env.PORT || 5000)
app.set('views', './views')
app.set('view engine', 'ejs')

app.use(morgan('dev'))
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
app.use(express.static(path.join(__dirname, 'public')))

const storage = multer.diskStorage({
    destination: path.join(__dirname, './public/images'),
    filename: (req, file, cb, filename) =>{
        cb(null, new Date().getTime() + path.extname(file.originalname));
    }
})
const upload = multer({storage}).single('image')

require('./routes/router')(app)

require('./api/apis')(app)


//socket
io.on('connection', async(socket) => {
    console.log('chat conectada');
    
    socket.on('user-join', data => {
        socket.join(data.id)
    })

    app.post('/send-messages', async(req, res) =>{
        upload(req, res, async(err) =>{
            if(err){
                console.log(err);
            }else{
                let data = req.body

                const my_user = await User.findOne({_id: data.myUserId})
                const room = await Rooms.findOne({_id: data.roomId}).populate('xid').populate('yid')
                let msg = {
                    myIdMsg: my_user._id,
                    msg: data.msg,
                    img: req.file ? `/images/${req.file.filename}` : ''
                }
        
                room.message.push(msg)
                await room.save()
                
                let last_msg = room.message.slice(-1)
                io.in(room._id).emit('send-messages', {room, last_msg})
                socket.broadcast.emit('send-msg-to-client', room)
                res.json({room, last_msg})
            }
        })
    })

    socket.on('user-is-typing', async({roomId})=>{
        const room = await Rooms.findOne({_id: roomId})
        let data = {room, notf: 'Esta escribiendo...'}
        socket.to(roomId).broadcast.emit('user-is-typing', data)
    })
})

serve.listen(app.get('port'), () => {
    console.log('servidor funcionando', app.get('port'));
})


