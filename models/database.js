const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/chatear', {
    useNewUrlParser: true
})
    .then(db => console.log('db  conectado'))
    .catch(err => console.log('db ha fallado', err))