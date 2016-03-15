var exports = module.exports = {};

exports.log = function(str){
    var d = new Date();
    console.log("[log]["+d.toLocaleTimeString(d.getTime())+"] {"+str+"}");
}

exports.error = function(str){
    var d = new Date();
    console.error("[err]["+d.toLocaleTimeString(d.getTime())+"] {"+str+"}");
}
