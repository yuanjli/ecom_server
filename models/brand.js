var mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: 1,
        maxlength:100
    }
});


// exports the module, below are basically the same: ==> 
const Brand = mongoose.model('Brand', brandSchema);
module.exports = Brand;
// module.exports = mongoose.model('Brand', brandSchema);