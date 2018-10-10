const mongoose = require('mongoose');

const styleSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: 1,
        maxlength:100
    }
});


// exports the module, below are basically the same: ==> 
const Style = mongoose.model('Style', styleSchema);
module.exports = Style;
// module.exports = mongoose.model('Style', styleSchema);