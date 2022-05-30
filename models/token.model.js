const mongoose=require('mongoose');
const TokenSchema=new mongoose.Schema({
    userId:{
        type:String,
        unique:true,
        required:true
    },
    token:{
        type:String,
    },
    sentTime:{
        type:String
    },
    verified:{
        type:Boolean,
        default:false
    }


},{timestamps:true});

module.exports=mongoose.model("Token",TokenSchema);