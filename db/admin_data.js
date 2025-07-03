const mongoose = require('mongoose');
const bcrypt=require('bcryptjs');

const adminSchema = new mongoose.Schema({
    name:{
    type:String,
    lowercase:true,
    trim:true
    },
    email:{
     type: String,
     unique:true,
     required:true,
     trim:true,
     lowercase:true,

    },
    password:{
    type: String,
    minlength: 6,
    trim:true
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date
});
/*adminSchema.pre("save",async function(next){
    const admin=this;
    if(admin.isModified("pwd")){
        admin.pwd=await bcrypt.hash(admin.pwd, 8);
    }
    next();
})*/

module.exports = mongoose.model("admins", adminSchema);
