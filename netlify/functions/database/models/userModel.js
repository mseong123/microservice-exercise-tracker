const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    log:[new mongoose.Schema({description:String,
    duration:Number,
    date:String},{_id:false})]
})


module.exports=mongoose.model('USER',userSchema)