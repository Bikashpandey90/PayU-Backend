const bodyValidator=(schema)=>{
    return async (req,res,next)=>{
        try{
            const data=req.body;
            await schema.validateAsync(data,{
                abortEarly:false
            })
            //success
            next()       
        }catch(exception){
            //handle validation
            let messageBag={};
            console.log(exception)
            exception.details.map((errDetail)=>{
                messageBag[errDetail.context.label]=errDetail.message
            })

            //422 for generic message
            next({
                code:400,
                detail:messageBag,
                message:"Validation Failed",
                status:"VALIDATION_FAILED"

            })

        }
    }
}

module.exports={
    bodyValidator
}