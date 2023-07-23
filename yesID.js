/*
With this method you will be able to generate a new id where you can control the length of the ids.
You can put as a parameter the length you want for the id
----------------------------------------------------------------------------------------------------------------
for example 
yesId() ----> '152914482871698271513'
yesId(6) ---> '251428'
yesId(19) --> '2914482841698271485'
yesId(18, 'PO-') ----> 'PO-12914482841698271514'
yesId(8, '100') ----> '10091448238'
yesId(8, 'TS10', 0) ----> 'TS1091948273'
yesId(8, 'TS10', 1) ----> '91948273TS10'
----------------------------------------------------------------------------------------------------------------
yesId can receive
yesId()
yesId(length)
yesId(length, string)
yesId(length, string, position)
The position has to be a number, 0 or 1
The 0 is to put the string at the beginning of the id and the 1 is to put the string at the end of the id
----------------------------------------------------------------------------------------------------------------
NOTE: the max length that the parameter accepts is 21 and the min length is 4, if you don't put any parameter, the default length will be 21
*/


//generar una camtidad x de numeros aleatorio
function getRandomNumbers() {
    return Math.random() * 100000000;
}

//quitar el punto para que devuelve una camtidad completa de numeros
function removePointInNumbers() {
    let numId = getRandomNumbers().toString().split('.').join('');
    return parseInt(numId);
}

//convertir esos numeros en un array de numeros
function createArrayNumbers(num) {
    let time = new Date().getTime();
    return [...`${num}${time}`];
}

//generar la longitud que deceo para id
function getLengthIds(n) {
    let arrayNunbers = createArrayNumbers(removePointInNumbers());
    arrayNunbers.length = n;
    return arrayNunbers.join('');
}

function yesId(leng, str, pos) {

    let stringId = str || '';
    let position = pos || 0;
    let lengthId = leng || 21;

    if (lengthId < 4 || lengthId > 21) return { error_yesId: 'La longitud debe ser de 4 hasta 21...' }
    if (position < 0 || position > 1) return { error_yesId: 'La posicion debe ser 0 o 1...' }
    if (typeof lengthId !== "number" || typeof position !== "number") return { error_yesId: 'La longitud y la posicion debe ser tipo Number...' }
    if (typeof stringId !== "string") return { error_yesId: 'La cadena debe ser tipo string -> yesId(number, string, number)...' }

    let theID

    if (position == 1) {
        theID = getLengthIds(lengthId) + stringId
    } else {
        theID = stringId + getLengthIds(lengthId)
    }

    return theID
}

module.exports = yesId