const mongoose=require('mongoose')

const voteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    voteCount: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model("Vote", voteSchema);