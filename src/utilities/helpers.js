const randomStringGenerator = (len = 100, str = true) => {

    let characters = "0123456789"
    if (str) {
        characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }
    let length = characters.length;
    let random = "";
    for (let i = 1; i <= len; i++) {
        let position = Math.ceil(Math.random() * length - 1);
        //random 0-1 =>lowest number=>-,highest number=>1=>61
        random += characters[position]
    }
    return random;
}
module.exports = {
    randomStringGenerator
}