'use strict';

let download = require('./download'),
    sync = require('./sync'),
    timestamps = require('./timestamps'),
    EventEmitter = require('events'),
    createClient = require('webdav'),
    validUrl = require('valid-url'),
    path = require('path');

const ARRRG_USERNAME = "username",
      ARRRG_PASSWORD = "password",
      ARRRG_DOWNLOAD_DIR = "downloaddir",
      ARRRG_TIMESTAMPS_DIR = "timestampsdir",
      ARRRG_URL = "url",
      ARRRG_CHECK_INTERVAL = "checkinterval"
;

/**
 * Parse the command line arguments.
 * Ensures the multiple URLs are always an array
 */
function parseArguments() {
    var args = require('minimist')(process.argv.slice(2), {
        string: [
            ARRRG_USERNAME,
            ARRRG_PASSWORD,
            ARRRG_DOWNLOAD_DIR,
            ARRRG_TIMESTAMPS_DIR,
            ARRRG_URL
        ]
    });

    var numberCheckInterval = Number(args[ARRRG_CHECK_INTERVAL]);
    if(numberCheckInterval){
        args[ARRRG_CHECK_INTERVAL] = numberCheckInterval;
    } else {
        delete args[ARRRG_CHECK_INTERVAL];
    }

    //Normalize urls to always be an array
    if (typeof args.url == "string")
        args.url = [args.url];

    //Just being nitpicky
    args.urls = args.url;
    delete args.url;

    return args;
}



/**
 * Ensures all the required command-line arguments are present and valid
 * @param {object} args Parsed command-line arguments
 */
function validateArguments(args) {
    function allRequiredArgumentsPresent(args) {
        return ARRRG_USERNAME in args &&
            ARRRG_PASSWORD in args &&
            ARRRG_DOWNLOAD_DIR in args &&
            ARRRG_TIMESTAMPS_DIR in args &&
            "urls" in args;
    }

    if (!allRequiredArgumentsPresent(args)) {
        console.error("ERROR: One or more required parameters not specified.");
        console.error("Usage:");
        console.error("    node main.js --username <username> --password <password> --downloaddir <download-directory>");
        console.error("                 --timestampsdir <saved-timestamps-directory> --url <download-url> [--url <download-url> ...] [--checkinterval <file-update-check-interval>]");
        console.error("");
        console.error("    All parameters except `--checkinterval` are required.");
        console.error("    You can specify multiple download urls (but at least 1 is needed).");
        console.error("    <file-update-check-interval> should be specified in milisseconds.");
        return false;
    }

    function downloadUrlIsValid(url) {
        if (!validUrl.isUri(url)) {
            console.error("ERROR: Download URL '" + url + "' is not valid!");
            console.error("Please provide a valid URL");
            return false;
        }

        return true;
    }

    let isValid = true;
    for (let idx in args.urls) {
        let url = args.urls[idx];
        isValid = downloadUrlIsValid(url) && isValid;
    }

    return isValid;
}

/**
 * Handles any uncaught errors or exceptions so we always know when something happens
 */
function setupErrorHandlers() {
    process.on('error', function (error) {
        console.error('Unhandled error caught!', error);
        console.error('Stacktrace: ' + error.stack)
    });

    process.on('uncaughtException', function (err) {
        console.error('Caught exception: ', err);
        console.error('Stacktrace: ' + err.stack)
    });
}

const START_PROCESS_EVENT = "startProcess",
      DEFAULT_WAIT_TIME = 10000;

/**
 * Initializes all that is needed to sync the log files
 * @param {object} args The parsed command-line arguments
 */
function startSyncingProcess(args) {
    var waitTime = DEFAULT_WAIT_TIME;

    if(args.checkinterval)
        waitTime = args.checkinterval;

    for(let idx in args.urls){
        let url = args.urls[idx],
            emitter = new EventEmitter();

        let thisStartEvent = START_PROCESS_EVENT + url;
        emitter.on(thisStartEvent, (url, args) => {
            syncUrl(url, args).then(() => {
                setTimeout(() => emitter.emit(thisStartEvent, url, args), waitTime);
            });
        });

        emitter.emit(thisStartEvent, url, args);
    }
}

/**
 * Actually sync the files from a URL
 * @param {*} url The url to sync
 * @param {*} args Command-line args. Will refactor once I'm not too lazy to do so
 */
function syncUrl(url, args) {
    var promises = [];

    let downloadDirectory = args.downloaddir,
        savedTimestampsDirectory = args.timestampsdir,
        webDavClient = createClient(url, args.username, args.password),
        emitter = new EventEmitter();

    let timestampFileName = url.replace(/[^a-zA-Z0-9_]/g, '_') + '.json',
        timestampFile = path.join(savedTimestampsDirectory, timestampFileName);

    let timestampMgr = new timestamps.TimestampManager(timestampFile),
        downloader = new download.Downloader(downloadDirectory, webDavClient, url),
        syncer = new sync.Synchronizer(emitter, downloader, timestampMgr);

    return syncer.loadDirectory('/');
}


module.exports = {
    parseArguments: parseArguments,
    validateArguments: validateArguments,
    setupErrorHandlers: setupErrorHandlers,
    startSyncingProcess: startSyncingProcess,
};