const mongoose = require("mongoose");
const Vote=require('../../models/votes');

require("dotenv").config()
const DB_USERNAME=process.env.DB_USERNAME
const DB_PASSWORD=process.env.DB_PASSWORD

//Connecting database
try {
    mongoose.connect(`mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@online-voting-system-cl.hyhqlkr.mongodb.net/?retryWrites=true&w=majority`);
} catch(err) {
    console.log(err);
}


function vote(id) {
    console.log(id);

    if(id === "vote1") {
        const x=Vote.findOne({name: "BJP"}).voteCount;

        Vote.updateOne({name: "BJP"}, {$set: {
            voteCount : x+1
        }
        });
    }

    else if(id === "vote2") {
        const x=Vote.findOne({name: "INC"}).voteCount;
        Vote.updateOne({name: "INC"}, {$set: {
            voteCount : x+1
        }
        });
    }

    else if(id === "vote3") {
        const x=Vote.findOne({name: "AAP"}).voteCount;
        Vote.updateOne({name: "AAP"}, {$set: {
            voteCount : x+1
        }
        });
    }
}