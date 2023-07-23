const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/chatDB', {
    useNewUrlParser: true
})
    .then(db => console.log('db is connected'))
    .catch(err => console.log('db has failed', err))