let socket = io();
import data from './data.js'
import alerts from './alerts.js';

const users_list = document.getElementById('users_list')
const searchUser = document.getElementById('searchUser')
let globalValue = {
    roomSelectedID:'',
    clientID:'',
    myUserID:'',
    userSelectedNUM:''
};

async function getUsers(){
    const user = await data.getUserData()

    users_list.innerHTML = ""

    for(let contact of user.contacts){
        let text = searchUser.value.toLowerCase()
        let name = contact.name.toLowerCase()

        if(name.indexOf(text) !== -1){
            users_list.innerHTML += `<div class="bxcv select_chat" data-user_num="${contact.number}">
                <div class="bxcus select_chat" data-user_num="${contact.number}">
                    <div class="card_img_profile_list select_chat" data-user_num="${contact.number}">
                        <img src="../icons/person.png" alt="" class="select_chat" data-user_num="${contact.number}">
                    </div>
                    <div class="ms-2 select_chat" data-user_num="${contact.number}">
                        <p class="user_nickname select_chat" data-user_num="${contact.number}">${contact.name}</p>
                        <p class=last_msg select_chat" data-user_num="${contact.number}">${contact.number}</p>
                    </div>
                </div>
            </div>`
        }
    }
    if(users_list.innerHTML == ""){
        users_list.innerHTML = '<p>Contacto no encontrado...</p>'
    }
}

const showListUsers = async() =>{
    let user = await data.getUserData()
    let my_rooms = await data.getMyRoomsData()

    let users_msg = my_rooms.filter(room =>{
        return room.message.length > 0;
    })

    let rooms = users_msg.sort((a, b) =>{
        let lastMsgA = a.message[a.message.length - 1]
        let lastMsgB = b.message[b.message.length - 1]

        if(lastMsgA.dateMsg > lastMsgB.dateMsg) return -1
        if(lastMsgA.dateMsg < lastMsgB.dateMsg) return 1
        return 0
    })

    users_list.innerHTML = ""
    rooms.forEach((room, i) =>{
        let theclient;
        if(room.xid._id !== user._id) theclient = room.xid;
        if(room.yid._id !== user._id) theclient = room.yid;

        let timex = new Date(room.message[room.message.length - 1].dateMsg)
        let time = timex.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        let current_user = globalValue.userSelectedNUM == theclient.user_number;
        let contact = user.contacts.find(contact => contact.number == theclient.user_number)
        
        users_list.innerHTML += `<div class="bxcv select_chat ${current_user ? 'chat_selected' : ''}" data-index="${i}" data-user_num="${contact ? contact.number :  theclient.user_number}">
            <div class="bxcus select_chat" data-index="${i}" data-user_num="${contact ? contact.number :  theclient.user_number}">
                <div class="card_img_profile_list select_chat" data-index="${i}"
                    data-user_num="${contact ? contact.number :  theclient.user_number}">
                    <img src="../icons/person.png" alt=""  class="select_chat" data-index="${i}" data-user_num="${contact ? contact.number :  theclient.user_number}">
                </div>
                <div class="card_nm select_chat" data-index="${i}"
                    data-user_num="${contact ? contact.number :  theclient.user_number}">
                    <div class="card_nd select_chat" data-index="${i}" data-user_num="${contact ? contact.number :  theclient.user_number}">
                        <p class="user_nickname select_chat" data-index="${i}"
                            data-user_num="${contact ? contact.number :  theclient.user_number}">
                            ${contact ? contact.name : theclient.user_number}
                        </p>
                        <p class="card_time_msg select_chat" data-index="${i}"
                            data-user_num="${contact ? contact.number :  theclient.user_number}">
                            ${time}
                        </p>
                    </div>
                    <p class="last_msg select_chat" data-index="${i}"
                        data-user_num="${contact ? contact.number :  theclient.user_number}">
                        ${room.message[room.message.length - 1].msg}
                    </p>
                </div>
            </div>
        </div>`
    })
}
showListUsers()

const postNewContact = async() =>{
    let name = document.getElementById('name_contact')
    let number = document.getElementById('number_contact')
 
    if(name.value.trim() == "" || number.value.trim() == '') return false

    let re = /[A-Za-z]/
    if(re.test(number.value)){
        let x = {
            msg: 'Solo se acepta digitos y guiones en este campo...', 
            color:'alert alert-danger', 
            card: '.card_alert_modal_xs'
        }
        return alerts(x)
    }

    let data_contact = {name: name.value, number: number.value}

    try {
        let req = await fetch('/new-contact',{
            method: 'POST',
            body:JSON.stringify(data_contact),
            headers:{
                'Content-Type': 'application/json'
            }
        })
        let res = await req.json()
    
        if(res.status){
            name.value = ''
            number.value = ''
            let x = {msg: res.msg, color:'alert alert-success', card: '.card_alert_modal_xs'}
            return alerts(x)
        }else{
            let x = {msg: res.msg, color:'alert alert-danger', card: '.card_alert_modal_xs'}
            return alerts(x)
        }
    } catch (error) {
        console.log(error);
    }
}

const userSelected = async(e) =>{
    let user = await data.getUserData()
    let users = await data.getUsersData()
    let number = e.target.dataset.user_num;
    let i = e.target.dataset.index;
    
    let user_slct = users.find(user => user.user_number == number)
    let the_room = user.rooms.find(room => room.xid == user_slct._id || room.yid == user_slct._id)
    let contact = user.contacts.find(contact => contact.number == number)

    socket.emit('user-join', {id: the_room._id})

    globalValue.roomSelectedID = the_room._id
    globalValue.myUserID = user._id
    globalValue.clientID = user_slct._id
    globalValue.userSelectedNUM = number

    if(window.innerWidth <= 600){
        document.querySelector('.card_users').classList.add('hide')
        document.querySelector('.card_header').classList.add('hide')
        document.querySelector('.card_chat').style.display = 'block'

    }
    showBoxChat(user_slct ,the_room, contact)
    user_info(user_slct, contact)
    hoverUserSelected(i)
}


const showBoxChat = (user, room, contact) =>{
    const chat_box_contain = document.querySelector('.chat_box_contain')
    const welcome_card = document.querySelector('.welcome')
    const box_fgd = document.querySelector('.box_fgd')
   
    if(!welcome_card.classList.contains('hide')) welcome_card.classList.add('hide')
    if(box_fgd.classList.contains('hide')) box_fgd.classList.remove('hide')

    chat_box_contain.innerHTML = `<div class="bfdx">
        <div class="chatboxheader">
            <div class="btn_back ">
                <img src="../icons/arrow.png" alt="" class="back_xv">
            </div>
            <div class="d-flex">
                <div class="imguserprofile"><img src="../icons/person.png" alt=""></div>
                <div class="card_xnt">
                    <a href="" class="user_name_selected">${contact ? contact.name : user.user_number}</a>
                    <span class="text_user_typping"></span>
                </div>
            </div>
        </div>
        <div class="chatxtg">
            <div class="chatboxmessage" id="chatbox_message"></div>
            <div class="card_load_img"></div>
        </div>
    </div>`
    getMessages(room)
}

const getMessages = (room) =>{
    const chatbox_message = document.getElementById('chatbox_message')

    chatbox_message.innerHTML = ''
    room.message.forEach(message => {
        let userMSG = message.myIdMsg !== globalValue.clientID
        let timex = new Date(message.dateMsg)
        let time = timex.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        chatbox_message.innerHTML += `<div class="box_msg ${userMSG ? 'msg_right' : 'msg_left'}">
            <div class="each_message ${message.img ? 'with_img' : 'without_img'} ${userMSG ? 'colorright' : 'colorleft'}">
                <div class="open_image ${message.img ? 'card_image' : 'hide'}" data-img="${message.img ?? ''}">
                    <img class="open_image" data-img="${message.img}" src="${message.img ?? ''}" alt="">
                </div>
                <div>
                    <p class="msg">${message.msg.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
            <p class="time_msg ${userMSG ? 'text-end': 'text-start'}">${time}</p>
        </div>`
    });
    let x = chatbox_message.scrollHeight
    chatbox_message.scrollBy(0, x);
}

const printLastMessages = (message) =>{
    const chatbox_message = document.getElementById('chatbox_message')

    let userMSG = message.myIdMsg !== globalValue.clientID
    let timex = new Date(message.dateMsg)
    let time = timex.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    chatbox_message.innerHTML += `<div class="box_msg ${userMSG ? 'msg_right' : 'msg_left'}">
        <div class="each_message ${message.img ? 'with_img' : 'without_img'} ${userMSG ? 'colorright' : 'colorleft'}">
            <div class="open_image ${message.img ? 'card_image' : 'hide'}" data-img="${message.img ?? ''}">
                <img class="open_image" data-img="${message.img}" src="${message.img ?? ''}" alt="">
            </div>
            <div>
                <p class="msg">${message.msg.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
        <p class="time_msg ${userMSG ? 'text-end': 'text-start'}">${time}</p>
    </div>`

    let x = chatbox_message.scrollHeight
    chatbox_message.scrollBy(0, x);
}

const user_info = (user, contact) =>{
    const _userInfo = document.getElementById('user-info')

    _userInfo.innerHTML = `<div class="info_box">
        <div class="text-end p-2">
            <img src="../icons/close.png" alt="" class=" close_card_user_info">
        </div>
        <div class="card_imgUserProfile_info">
            <div class="imgUserProfile_info">
                <img src="../icons/person.png" alt="">
            </div>
        </div>
        <div>
            <p class="info_user_name">${contact ? contact.name : user.user_number}</p>
            <p class="info_user_number">${contact ? user.user_number : user.nombre}</p>
        </div>
        <div class="text-center">
            <button type="button" id="btn_open_ud" class="btn text-primary open_modal_update" data-number="${user.user_number}" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
                ${contact ? 'Editar contacto' : 'Agregar contacto'}
            </button>
        </div>
    </div>`
}

const add_update_contact = async() => {
    let number = document.getElementById('btn_open_ud').dataset.number
    let name = document.getElementById('name_ud').value

    console.log(number);
    console.log(name);

    let datas = {name: name, number: number}

    let req = await fetch('/add-update-contact', {
        method: 'POST',
        body: JSON.stringify(datas),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    let res = await req.json()

    let x = {msg: res.msg, color:'alert alert-success', card: '.card_alert_modal_xa'}
    return alerts(x)
}


const hoverUserSelected = (i) =>{
    let _chats = document.querySelectorAll('.bxcv')
    
    _chats.forEach((chat) => {
        if(chat.classList.contains('chat_selected')){
            chat.classList.remove('chat_selected')
            return false
        }
    })
    _chats[i].classList.add('chat_selected')
}

(()=>{
    let file = document.getElementById('image');
    
    file.addEventListener('change', (e)=> {
        let imgId = Math.floor(Math.random() * 30000) + '_' + Date.now();
        createImages(file, imgId)
    })

    function createImages(file, imgId){
        let img = document.createElement('img');
        let div = document.createElement('div');
        div.classList.add('img_card')
        img.classList.add('imgxv',imgId);
        img.dataset.id = imgId;
        document.querySelector('.card_load_img').innerHTML = ""
        img.src = URL.createObjectURL(file.files[0])
        div.appendChild(img)
        document.querySelector('.card_load_img').style.height = '100%'
        document.querySelector('.card_load_img').appendChild(div)
    }
})()

const sendMessage = async(e) =>{
    e.preventDefault()

    const text = document.getElementById('text_message')
    let file = document.getElementById('image').files;

    if(text.value.trim() == '' && file.length == 0) return false

    const formData = new FormData()
    formData.append('image', file[0])
    formData.append('msg', text.value)
    formData.append('myUserId', globalValue.myUserID)
    formData.append('roomId', globalValue.roomSelectedID)
    formData.append('clientId', globalValue.clientID)

    let req = await fetch('/send-messages',{
        method: 'POST',
        body: formData
    })
    let res = await req.json()

    document.querySelector('.card_load_img').style.height = '0%'
    document.querySelector('.card_load_img').innerHTML = ''
    document.getElementById('form_data').reset()
}

socket.on('send-messages', async({room, last_msg}) =>{
    if(room._id == globalValue.roomSelectedID){
        printLastMessages(last_msg[0])
        showListUsers()
    }
})

socket.on('send-msg-to-client', async(roomx) =>{
    let my_rooms = await data.getMyRoomsData()
    if(my_rooms.some(room => room._id == roomx._id)){
        showListUsers()
    }
})

socket.on('user-is-typing', (datas) => {
    let card_typing = document.querySelector('.text_user_typping')

    if(datas.room._id == globalValue.roomSelectedID){
        card_typing.innerText = datas.notf
    }

    setTimeout(()=>{
        card_typing.innerText = ""
    }, 5000)
})


searchUser.addEventListener('keyup', getUsers)
document.getElementById('btn_add_contact').addEventListener('click', postNewContact)
document.getElementById('form_data').addEventListener('submit', sendMessage)
document.getElementById('btn_updateContact').addEventListener('click', add_update_contact)
let text_message = document.getElementById('text_message')

text_message.addEventListener('keydown', e =>{
    let key = event.which || event.keyCode;
    socket.emit('user-is-typing', {roomId: globalValue.roomSelectedID})

    if(key === 13 && !e.shiftKey){
        if(text_message.value.trim() === '') return false
        sendMessage(e)
    }
})

window.addEventListener('click', async(e) =>{
    
    if(e.target.classList.contains('select_chat')){
        e.preventDefault()
        userSelected(e)
    }
    if(e.target.classList.contains('user_name_selected')){
        e.preventDefault()
        let card_user_info = document.querySelector('.card_user_info')
        let card_chat = document.querySelector('.card_chat')
        if(window.innerWidth <= 600){
            card_user_info.style.right = '0px'
        }else{
            card_user_info.style.right = '0px'
            card_chat.style.width = 'calc(100% - 750px)'
        }
    }
    if(e.target.classList.contains('close_card_user_info')){
        e.preventDefault()
        let card_user_info = document.querySelector('.card_user_info')
        let card_chat = document.querySelector('.card_chat')
        if(window.innerWidth <= 600){
            card_user_info.style.right = '-100%'
        }else{
            card_user_info.style.right = '-350px'
            card_chat.style.width = 'calc(100% - 400px)'
        }
    }
    if(e.target.classList.contains('show_more_open')){
        e.preventDefault()
        document.querySelector('.card_show_more').classList.toggle('display')
    }
    if(e.target.classList.contains('back_xv')){
        e.preventDefault()
        document.querySelector('.card_users').classList.remove('hide')
        document.querySelector('.card_header').classList.remove('hide')
        document.querySelector('.card_chat').style.display = 'none'
    }
    if(e.target.classList.contains('open_modal_update')){
        e.preventDefault()
        let user = await data.getUserData()
        let number = e.target.dataset.number;
        let contact = user.contacts.find(contact => contact.number == number)
      
        if(contact){
            document.getElementById('name_ud').value = contact.name
        }
    }
    if(e.target.classList.contains('open_image')){
        console.log(e.target.dataset.img);
        document.querySelector('.box_show_img').style.display = 'flex'
        let card_img = document.querySelector('.card_contain_image')
        let img = e.target.dataset.img;

        card_img.innerHTML = `
            <img src="${img}" alt="">
        `
    }
    if(e.target.classList.contains('btn_close_img')){
        document.querySelector('.box_show_img').style.display = 'none'
    }
})


