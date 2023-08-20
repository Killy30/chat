const User = require('../models/user')
const Rooms = require('../models/room')
const Contact = require('../models/contact')


module.exports = (app) =>{

    app.get('/users', async(req, res) => {
        const users = await User.find({}).populate('rooms');
        res.json(users)
    })

    app.get('/user', async(req, res)=>{
        const my_user = req.user;
        console.log(my_user._id);
        const user = await User.findOne({_id: my_user._id}).populate('rooms').populate('contacts');
        res.json(user)
    })

    app.get('/rooms', async(req, res) =>{
        const rooms = await Rooms.find().populate('Users')
        res.json(rooms)
    })

    app.get('/my-rooms', async(req, res) =>{
        const user = req.user;
        const rooms = await Rooms.find({}).populate('xid').populate('yid')

        const my_rooms = rooms.filter(room =>{
            let roomidx = JSON.stringify(room.xid._id);
            let roomidy = JSON.stringify(room.yid._id);
            let userid = JSON.stringify(user._id)
            return roomidx === userid || roomidy === userid
        })

        res.json(my_rooms)
    })

    app.post('/new-contact', async(req, res) =>{
        const user = req.user;
        let data = req.body;

        function validateNumber(num){
            let x = num.split('')
            if(!x.includes('-')){
                x.splice(3, 0, '-')
                return x.join('')
            }
            return x.join('')
        }

        const client = await User.findOne({user_number: validateNumber(data.number)})

        if(client){
            const user_contact = await User.findOne({_id: user._id}).populate('contacts')
            const my_contacts = user_contact.contacts.some(contact => contact.number == client.user_number)

            if(my_contacts){
                return res.json({status: false, msg:'Este contacto ya esta en tu lista...'})
            }else{
                
                const newContact = new Contact()
                
        
                newContact.name = req.body.name;
                newContact.number = client.user_number;
                newContact.user = user;
                user.contacts.push(newContact)
                
                const room = await Rooms.findOne({$and:[
                    {xid: {$in:[user.id, client.id]}},
                    {yid: {$in:[user.id, client.id]}}
                ]})

                if(!room){
                    const newRoom = new Rooms()

                    newRoom.xid = user;
                    newRoom.yid = client
                    user.rooms.push(newRoom)
                    client.rooms.push(newRoom)

                    await client.save()
                    await newRoom.save()
                }
                
                await user.save()
                await newContact.save()
                return res.json({status:true, msg:'Este contacto se ha agregado en tu lista exitosamente...'})
            }
        }
        return res.json({status:false, msg:'Numero de contacto invalido...'})
    })

    app.post('/add-update-contact', async(req, res) => {
        let user = req.user;
        let data = req.body;
        // const client = await User.findOne({user_number: data.number})
        const user_contact = await User.findOne({_id: user._id}).populate('contacts')
        const my_contacts = user_contact.contacts.some(contact => contact.number == data.number)

        if(my_contacts){
            const contact = await Contact.updateOne({number: data.number}, {$set: {name: data.name}})
          
            return res.json({msg: 'Su contacto ha sido actualizado exitosamente...'})
        }else{
            const addContact = new Contact()
    
            addContact.name = data.name;
            addContact.number = data.number;
            addContact.user = user;
            user.contacts.push(addContact)

            await addContact.save()
            await user.save()
            return res.json({msg: 'Este contacto se ha agregado en tu lista exitosamente...'})
        }
    })

    app.post('/user-information', (req, res) =>{
        console.log(req.body);
        res.json({msg:'success'})
    })
}