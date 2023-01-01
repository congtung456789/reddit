const createFileName = (inputURI) => {
    let inputMIME = inputURI.split(',')[0].split(':')[1].split(';')[0];
    let ext = inputMIME.split("/")[1];
    let today = new Date();
    let nameFile = today.getTime().toString();
    return nameFile + "."+ext;
}
const convertToBuffer = (inputURI) => {
    return Buffer.from(inputURI.split(",")[1], 'base64');
}
const  isExtImage = (fileName) => {
    console.log(fileName);
    let ext = fileName.split('.')[1];
    const acceptedImageTypes = ['gif', 'jpeg', 'png','jpg'];
    return acceptedImageTypes.includes(ext);
}

module.exports = {createFileName,convertToBuffer,isExtImage};
