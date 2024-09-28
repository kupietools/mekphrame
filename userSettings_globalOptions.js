'use strict';

/* Package Name: mekphrame
 *
 * Copyright © 2024 Michael E. Kupietz <software@kupietz.com> http://www.kupietz.com
 *
 * All Rights Reserved. See LICENSE for details.
 */

// PURPOSE: This file is used to set up the global options for the testing framework.

module.exports = {
    settings: {

    
        //// USER-SETTABLE OPTIONS FOR LOGGING ////

        /* Logging settings are used to control the verbosity and formatting of the logging output. They are do not need to be modified from the default settings unless you want to change the way the logs are displayed. They can be left as-is if modifying this framework for your own use on other sites. */

        loggingSettings: {

            indentDepth: 4, 
             //number of spaces to indent for each level of function nesting in logs
            verboseDebugging: false, 
             //EXTRA VERBOSE CONSOLE LOGGING DURING RUN - can be toggled within individual functions for troubleshooting
            prettyLogs: 0, 
             //Prettyprinting of logs? Prettyprints JSON objects in logs as multiline for easier reading but longer logs. 0 to turn off, or # of spaces to indent.
            terminalwidth: 220, 
             //width at which to wrap log lines in the console
            useLineNumbers: true, 
             //use line numbers in log output?
            alwaysLogFunctionName: true, 
             //always prefix logging with internal function name (makes debugging easier)?
            alwaysLogStackTrace: true, 
             //always include last two lines of stack trace in log output?
            alwaysLogArguments: false, 
             //always include arguments passed to functions in primary output to log (may include unparsed webElements)?
            alwaysLogHTML: false, 
             //always include HTML elements found in arguments passed to functions in primary output to log?
            HTMLAttributesToLog: ["tagName", "class", "name", "type", "id"] 
             //if alwaysLogHTML is true, only log these attribute names. Leave empty to log all.
             
        },

        //// USER-SETTABLE ANSI COLOR LIST FOR LOGGING ////

        /* ANSI color codes for use in logging output. These can be modified to change the colors used in the logging output. */

        ansi: {
            // output formatting constants. \[1; is bold [2; is dim [3; is italic [4; is underline [5; is blink [7; is reverse [8; is hidden]]]

            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            boldblue: "\x1b[1;34m",
            italicgreen: "\x1b[3;32m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            gray: "\x1b[90m",
            dimgray: "\x1b[2;90m",
            brightred: "\x1b[91m",
            brightgreen: "\x1b[92m",
            brightyellow: "\x1b[93m",
            boldbrightblue: "\x1b[1;94m",
            brightmagenta: "\x1b[95m",
            brightcyan: "\x1b[96m",
            brightwhite: "\x1b[97m",
            none: "\x1b[0;0m",
            bold: "\x1b[94m",
            regular: "\x1b[0;0m"

    } 
}
}