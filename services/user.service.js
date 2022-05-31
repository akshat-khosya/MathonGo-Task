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
    } catch (err) {
        console.log(err);
        throw Error('Error while createing new User');
    }
}
exports.updateUser=async(find,query)=>{
    try {
        const user=await User.updateOne(find,{$set:query});
    } catch (err) {
        console.log(err);
        throw Error('Error while updating User');
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

exports.getToken=async(query)=>{
    try {
        const token=await Token.findOne(query);
        return token;
    } catch (err) {
        console.log(err);
        throw Error('Error while finding Token');
    }
}

exports.updateToken=async(find,query)=>{
    try {
        const token=await Token.updateOne(find,{$set:query});
    } catch (err) {
        console.log(err);
        throw Error('Error while updating Token');
    }
}