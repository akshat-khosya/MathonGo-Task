const { query } = require("express");
const User=require("../models/user.model");
const Token=require("../models/token.model");
exports.getUser=async (query)=>{
    try {
        const checkUser=await User.findOne(query);
        return checkUser;
    } catch (err) {
        console.log(err);
        throw Error('Error while finding User');
    }
}

exports.saveUser=async(query)=>{
    try {
        const user=new User(query);
        const newUser=await user.save();
        return newUser;
    } catch (error) {
        console.log(error);
        throw Error('Error while createing new User');
    }
}

exports.saveToken=async(query)=>{
    try {
        const token=new Token(query);
        const newToken=await token.save();
        return newToken;
    } catch (error) {
        console.log(error);
        throw Error('Error while createing new token');
    }
}
