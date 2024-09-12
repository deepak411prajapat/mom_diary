const mongoose = require('mongoose');

const itemsSchema = new mongoose.Schema({
    date:{type:Date,default:Date.now},
    btn:String,
    desc: String,
    amount:Number
});

module.exports = mongoose.model("items", itemsSchema);