var socket = io('http://localhost:5000');

const name_caht = document.getElementById('name_chat')
const chat = document.getElementById('chat')
const nameUser = document.getElementById('nameUser');
const miId = document.getElementById('jnh');
const btnBuscar = document.getElementById('btnBuscar');

var name = nameUser.dataset.name
var mi_Id = miId.dataset.id
var meme;
var idRoom;


var buscarUser = () => {
    var textB = inpBuscar.value.toLowerCase();
    fetch('/users')
        .then(res => res.json())
        .then(datas => {
            name_caht.innerHTML = '';
            for (let data of datas) {
                let nameb = data.nombre.toLowerCase();
                if (name != data.nombre) {
                    if (nameb.indexOf(textB) !== -1) {
                        name_caht.innerHTML += `
                        <div  class="ubs">
                            <a class="chat_name" id="a" data-users="${data._id}" href="/chat">
                                <div class="userFotoSelect" id="a" data-users="${data._id}"></div>
                                <div class="contentUserSelect" id="a" data-users="${data._id}">
                                    <p class="userNameSelect" id="a" data-users="${data._id}">
                                        ${data.nombre}
                                    </p>
                                </div>
                            </a>
                        </div>`
                    }
                }
            }
            if (name_caht.innerHTML === '') {
                name_caht.innerHTML += '<div class="ubs">Usuario no encontrado...</div>'
            }
        })
}


// traer a todos los usuarios
function getUser(){
    var textB = inpBuscar.value.toLowerCase();

    fetch('/users')
        .then(res => res.json())
        .then(datas => {
            name_caht.innerHTML = ''
            var data = datas;

            for (var i = data.length - 1; i >= 0; i--) {
                
                if (name != data[i].nombre) {
                    for (var c = data[i].rooms.length - 1; c >= 0; c--) {
                        let nameB = data[i].nombre.toLowerCase();

                        if (nameB.indexOf(textB) !== -1) {
                            if (data[i].rooms[c].myId === mi_Id || data[i].rooms[c].youId === mi_Id) {

                                var message = data[i].rooms[c].message.pop();
                                name_caht.innerHTML += `
                                    <div  class="ubs">
                                        <a class="chat_name" id="a" data-users="${data[i]._id}" href="/chat">
                                            <div class="userFotoSelect" id="a" data-users="${data[i]._id}"></div>
                                            <div class="contentUserSelect" id="a" data-users="${data[i]._id}">
                                                <p class="userNameSelect" id="a" data-users="${data[i]._id}">
                                                    ${data[i].nombre}
                                                </p>
                                                <samp class="sampMSG" id="a" data-users="${data[i]._id}">
                                                    ${message.msg}
                                                </samp>
                                            </div>
                                        </a>
                                    </div>`
                            }
                        }
                    }
                }
            }
            if ( name_caht.innerHTML === '') {
                name_caht.innerHTML += '<div class="ubs">Usuario no encontrado...</div>'
            }
    	})
}

btnBuscar.addEventListener('click',getUser)
inpBuscar.addEventListener('keyup',getUser)
inpBuscar.addEventListener('keyup',buscarUser)
btnBuscar.addEventListener('click',buscarUser)

getUser()

// evento click para seleccional el usuario para chatear
name_caht.addEventListener('click' , (e) => {
    e.preventDefault()
    if (e.target.classList.contains('chat_name')) {
        e.preventDefault()
        userToChat(e)
    }else if (e.target.classList.contains('sampMSG')) {
        e.preventDefault()
        userToChat(e)
    }else if (e.target.classList.contains('userNameSelect')) {
        e.preventDefault()
        userToChat(e)
    }else if (e.target.classList.contains('userFotoSelect')) {
        e.preventDefault()
        userToChat(e)
    }else if (e.target.classList.contains('contentUserSelect')) {
        e.preventDefault()
        userToChat(e)
    }
})

var userToChat = (e) =>{
    const id = e.target.dataset.users;
    var ids = {myId: mi_Id, userId: id}
    meme = id;
    fetch('/chat/'+ JSON.stringify(ids), {
        method:'post',
        body: JSON.stringify(ids)
     })
    .then(res => res.json())
    .then(data => {
        idRoom = data.idRoom;
        chat.innerHTML = `
        <div class="box">
            <div class="header">
                <div class="fn">
                    <div class="fotoUser"></div>
                    <p>${data.user.nombre}</p>
                </div>
                <div class="ue">
                    <samp>${data.user.email}</samp>
                </div>
            </div>
            <div id="jkws" class="boxchat"> </div>
        </div>`
        getMessage(data.idRoom)
        socket.emit('user-to-join', {
            roomUser: data.idRoom._id,
            userId: mi_Id
        })
    })
}

// funcion para conseguir todos los mensajes en el servidor y pintarlos en pantalla
function getMessage(data){
    const boxU = document.getElementById('jkws');

    data.message.forEach(msj => {
        var y = new Date(msj.date)
        
        if(msj.myIdMsg == meme){
            boxU.innerHTML += `
            <div class="jknm">
                <div class="opklo">
                    <span>
                        ${msj.msg}
                        <samp>
                            ${y.getHours()}:${y.getMinutes()}
                        </samp>
                    </span>
                </div>
            </div>`;
        }else{
            boxU.innerHTML += `
            <div class="jknm">
                <div class="opkl">
                    <span>
                        ${msj.msg}
                        <samp>
                            ${y.getHours()}:${y.getMinutes()}
                        </samp>
                    </span>
                </div>
            </div>`
        }
    });
    
    socket.on('joining', user => {
        console.log(user);
    })
    var x = boxU.scrollHeight
    boxU.scrollBy(0, x);
}


socket.on('emitiendo', data => {
    const boxU = document.getElementById('jkws');
    const ubs = document.getElementById('ubs');

    if (idRoom._id == data.idRoom._id) {
        var y = new Date()
        boxU.innerHTML += `
        <div class="jknm">
            <div class="opklo">
                <span>
                    ${data.message}
                    <samp>
                        ${y.getHours()}:${y.getMinutes()}
                    </samp>
                </span>
            </div>
        </div>`
    }
    var x = boxU.scrollHeight
    boxU.scrollBy(0, x);
})


const form_chat = document.getElementById('form')

form_chat.addEventListener('submit', (e) => {
    e.preventDefault()
    var text_chat = document.getElementById('text_chat').value;
    var youId = meme;
    var myId = mi_Id;

    if(text_chat.trim() ==="") return false;

    socket.emit('nuevo-msj', {
        idRoom: idRoom,
        message: text_chat
    })

    const boxU = document.getElementById('jkws');
    var y = new Date()
    boxU.innerHTML += `
    <div class="jknm">
        <div class="opkl">
            <span>
                ${text_chat}
                <samp>
                    ${y.getHours()}:${y.getMinutes()}
                </samp>
            </span>
        </div>
    </div>`
    var dat = {
        youId:youId,
        myId:myId,
        msj:text_chat,
        idRoom: idRoom
    }
    
    fetch('/message/'+ JSON.stringify(dat), {
        method:'post',
        body: JSON.stringify(dat)
    })
    .then(resp => resp.json())
    .then(datas => {
        getUser()
        console.log('new message');
        
    })
    form_chat.reset();
    var x = boxU.scrollHeight
    boxU.scrollBy(0, x);
})



