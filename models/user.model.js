const mongoose=require('mongoose');
const UserSchema=new mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
  
    password:{
        type:String,
        required:true
    }
  


},{timestamps:true});

module.exports=mongoose.model("User",UserSchema);