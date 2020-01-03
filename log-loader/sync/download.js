'use strict';
let fs = require('fs'),
    path = require('path'),
    common = require('./common'),
    endOfLine = require('os').EOL;

const DEFAULT_DOWNLOAD_FOLDER = "downloaded";

var Downloader = class Downloader{
    constructor(downloadDirectory, webdavClient, url){
        this.url = url;
        this.downloadPath = downloadDirectory ? downloadDirectory : path.join(__dirname, DEFAULT_DOWNLOAD_FOLDER),
        this.webDAVClient = webdavClient;
        common.createDirIfDoesntExist(this.downloadPath);
    }

    downloadFile(filename){
        let downloadFilePath = path.join(this.downloadPath, filename);

        return this.webDAVClient.getFileContents(filename, "text")
            .then(function (text) {
                common.createDirIfDoesntExist(path.dirname(downloadFilePath));
                fs.writeFile(downloadFilePath, text, 'utf8', function (error) {
                    if (error) {
                        console.error(("[" + new Date().toLocaleTimeString() + "]") + "Error caught writing file '" + downloadFilePath + "'" + endOfLine, error);
                    } else {
                        console.log(("[" + new Date().toLocaleTimeString() + "]") + "Downloaded '" + filename + "' to '" + downloadFilePath + "'");
                    }
                });

            })
            .catch(function (error) {
                console.error(("[" + new Date().toLocaleTimeString() + "]") + "Error downloading file '" + filename + "'", error);
            });
    }

    downloadDirectory(dirname){
        var url = this.url;
        return this.webDAVClient.getDirectoryContents(dirname)
                                .catch(function(e){
                                    console.error(("[" + new Date().toLocaleTimeString() + "]") + "Error loading directory '" + dirname + "'. For url '" + url + "'" + endOfLine, e);
                                    return Promise.resolve([]);
                                });
    }
}

module.exports = {
    Downloader: Downloader
};