'use strict';
let _ = require('./plumbing');
;

var args = _.parseArguments();
if (!_.validateArguments(args))
    process.exit(1);

_.setupErrorHandlers();

_.startSyncingProcess(args);