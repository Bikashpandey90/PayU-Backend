const CloudinaryService = require("./cloudinary.service");

class FileUploaderService extends CloudinaryService{

}


const fileUploaderSvc=new FileUploaderService()
module.exports=fileUploaderSvc