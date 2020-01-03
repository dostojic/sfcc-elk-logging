var childProcess = require('child_process'),
    path = require('path'),
    url = require('url');

var instance = process.env.INSTANCE,
    username = process.env.USERNAME,
    password = process.env.PASSWORD,
    downloadDir = process.env.DOWNLOADBASEDIR,
    checkInterval = process.env.CHECKINTERVAL,
    savedTimestampsDir = path.join(process.env.SAVEDTIMESTAMPSDIR, instance),
    urls = process.env.URLS.split(";")
                           .map((dir) => dir.trim().replace('<INSTANCE>', instance))
                           .filter((dir) => dir.length > 0);

var args = [
    "--username",
    username,
    "--password",
    password,
    "--downloaddir",
    downloadDir,
    "--timestampsdir",
    savedTimestampsDir
];

if(checkInterval){
    args.push("--checkinterval");
    args.push(checkInterval);
}

urls.forEach((url) => {
    args.push("--url");
    args.push(url);
});

var showableArgs = [
    "--username",
    username,
    "--password",
    "**********",
    "--downloaddir",
    downloadDir,
    "--timestampsdir",
    savedTimestampsDir
];

console.log("Running main.js with args:\n" + showableArgs.join(" "));
childProcess.fork('main.js', args);