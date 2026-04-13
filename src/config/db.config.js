require("dotenv").config()
const mongoose=require("mongoose")
const populateAdmin = require("../seeder/admin.seeder")

const dbConnect=async()=>{
    try{
      console.log("db server is connecting")
      await mongoose.connect(process.env.MONGODB_URL,{
        dbName:process.env.MONGODB_DB,
        autoCreate:true,
        autoIndex:true
      })

      console.log("Admin table seeding started....")
       await populateAdmin()
       console.log("Admin table seeding completed......")

      console.log("Database server connected successfully.............")


    }catch(exception){
        console.log("Error connectingg database.......");
        console.log(exception)
        process.exit()
    }

}
dbConnect();