'use strict';
let fs = require('fs'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    common = require('./common');

const FILE_CHANGED_EVENT = "fileChanged";
const LOAD_DIRECTORY_COMMAND = "loadDirectory";

var Synchronizer = class Synchronizer{
    constructor(eventEmitter, downloader, timestampManager){
        this.emitter = eventEmitter;
        this.downloader = downloader;
        this.timestampManager = timestampManager;

        var _downloader = this.downloader;
        eventEmitter.on(FILE_CHANGED_EVENT, (filename, successCallback) => {
            _downloader.downloadFile(filename).then(successCallback);
        });
    }

    loadDirectory(dirpath){
        var _this = this;

        return this.downloader.downloadDirectory(dirpath).then(function(contents) {
            var promises = [];
            for(let idx in contents){
                let content = contents[idx];
                if(content.type === "directory")
                    promises.push(_this.loadDirectory(content.filename));
                else {
                    let timestamp = Date.parse(content.lastmod);
                    if(_this.timestampManager.isNew(content.filename, timestamp)){
                        _this.emitter.emit(FILE_CHANGED_EVENT,
                                            content.filename,
                                            () => _this.timestampManager.update(content.filename, timestamp));
                    }
                }
            }

            return Promise.all(promises);
        })
    }
    
}

module.exports = {
    Synchronizer: Synchronizer
}