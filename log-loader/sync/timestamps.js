"use strict";
let fs = require('fs'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    common = require('./common');

var TimestampManager = class TimestampManager {
    constructor(persistenceFileName){
        this.persistenceFile = persistenceFileName;
        this.timestamps = loadTimestamps(persistenceFileName);
    }

    isNew(filename, timestamp){
        let previousTimestamp = this.timestamps[filename];

        return (!previousTimestamp || previousTimestamp < timestamp);
    }

    update(filename, timestamp){
        this.timestamps[filename] = timestamp;

        saveTimestamps(this.persistenceFile, this.timestamps);
    }
}

function saveTimestamps(persistenceFilename, timestamps){
    common.createDirIfDoesntExist(path.dirname(persistenceFilename));

    jsonfile.writeFileSync(persistenceFilename, timestamps);
}

function loadTimestamps(persistenceFilename){
    if (fs.existsSync(persistenceFilename)) {
        try{
            return jsonfile.readFileSync(persistenceFilename);
        } catch(e){
            console.error("Could not load the timestamps file in '" + persistenceFilename + "'.", e);
        }
    }

    return {};
}


module.exports = {
    TimestampManager: TimestampManager
}