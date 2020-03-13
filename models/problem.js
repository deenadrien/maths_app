const mongoose = require('mongoose');

/**
* Schema de la table
*/

var Schema = new mongoose.Schema({
    number: {type: Number, required: true},
    content: {type: String, required: true},
    result: {type: Number, required: true},
    level: {type: Number, required: true},
    summary: {type:String, required:true}
});

Schema.statics.addProblem = async function(problem){
    var Problem = new this(problem);
    var result = await Problem.save(problem);
    return result;
}

Schema.statics.listProblems = async function(){
    return await this.find();
}

Schema.statics.deleteProblem = async function(problemId){
    return await this.deleteOne({_id: problemId});
}

module.exports = mongoose.model('problem', Schema);