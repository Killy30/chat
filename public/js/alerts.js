
const alerts = ({msg, color, card}) => {
    const card_alert = document.querySelector(card)
    card_alert.innerHTML = `<div class="${color} p-2 mb-3 d-flex align-items-center" role="alert">
        <p class="m-0">${msg}</p>
    </div>`
    setTimeout(() =>{
        card_alert.innerHTML = ''
    },10000)
}

export default alerts