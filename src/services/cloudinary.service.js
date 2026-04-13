

require("dotenv").config()

const cloudinary=require("cloudinary").v2
const fs=require("fs")

class CloudinaryService{
    constructor(){
        cloudinary.config({
            cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
            api_key:process.env.CLOUDINARY_API_KEY,
            api_secret:process.env.CLOUDINARY_API_SECRET
        })
    }


    uploadFile=async (filepath,uploadDir=null)=>{
        try{
            const response= await cloudinary.uploader.upload(filepath,{
              
                unique_filename:true,
                folder:uploadDir,
                resource_type:"auto"
              
            })
            console.log(response)
            //delete public file
            fs.unlinkSync(filepath) //delete from local device

            return response.secure_url

        }catch(exception){
            console.log("Upload file error",exception)
            throw exception
        }

    }
}

module.exports=CloudinaryService