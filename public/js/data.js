
let data = {}

data.getUsersData = async() =>{
    try {
        let req = await fetch('/users');
        let res = req.json();
        return res;
    } catch (error) {
        console.log(error);
    }
}

data.getUserData = async() =>{
    try {
        let req = await fetch('/user');
        let res = req.json();
        return res;
    } catch (error) {
        console.log(error);
    }
}

data.getRoomsData = async() =>{
    try {
        let req = await fetch('/rooms');
        let res = req.json();
        return res;
    } catch (error) {
        console.log(error);
    }
}

data.getMyRoomsData = async() =>{
    try {
        let req = await fetch('/my-rooms');
        let res = req.json();
        return res;
    } catch (error) {
        console.log(error);
    }
}

export default data