'use strict';
let fs = require('fs'),
    mkdirp = require('mkdirp');

module.exports = {

    createDirIfDoesntExist: function createDirIfDoesntExist(dir){
        if (!fs.existsSync(dir)){
            try{
                mkdirp.sync(dir);
            }
            catch(err){
                console.error(("[" + new Date().toLocaleTimeString() + "]") + "Error caught creating directory '" + dir + "'", err);
            }
        }
    }
}