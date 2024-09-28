'use strict';

/* Package Name: mekphrame
 *
 * Copyright © 2024 Michael E. Kupietz <software@kupietz.com> http://www.kupietz.com
 *
 * All Rights Reserved. See LICENSE for details.
 */

// PURPOSE: This is the main file for the mekphrame framework. It is used to initialize the framework and provide access to the framework's functions and data.


//// Initialization block - do not edit ////

const {
    By,
    until,
    Builder,
    Browser,
    Key,
    WebElement
} = require('selenium-webdriver'); //note 'until' didn't work until I included it here - this is a command to import that module.

//end initialization block

//// these will be exported ////

var uiGet = {}; //prefix for atomic, low-level functions that get info from UI elements
var uiDo = {}; //prefix for atomic, low-level functions that act on UI elements
var uiScript = {}; //prefix for higher-level functions that group together other functions that interact with UI elements into "scripts". 
var util = {}; //prefix for utility functions

data.session = Date.now();



// define local data only used in this file
var { data } = require("./userSettings_siteConfigurationForTests.js"); //importing user data from data object in mekphrameUserSettings.js
var { settings, ansi } = require("./userSettings_globalOptions.js"); //importing user settings from data object in mekphrameUserSettings.js

ansi.current = "";
ansi.prev = "";

const { error } = require('console');
const { type } = require('os');
const { truncate } = require('fs/promises');

var indents = 0;
var stepcount = 0;
var runcount = 0;
/* think this was a type, replace if needed const selection = {
    element: {}
}; */
var driver = {};
var logCount = 0;

//// begin functions ////

util.errorLog = function (...args) {
    // errorLog is a wrapper for console.log that adds some additional functionality for logging. If verboseDebugging is set to false in settings, it will not log anything. If verboseDebugging is set to true, it will log the arguments passed to it. It will also log the line number and function name of the calling function.

    if (!settings.loggingSettings.verboseDebugging) { return false; }
    
    let thisCaller = util.caller();

    for (let arg in args) {

        if (typeof args[arg] == "object") {
            args[arg] = JSON.stringify(args[arg], null, settings.loggingSettings.prettyLogs)
        }
    }

    args.unshift(ansi.gray);
    args.push(` ${ansi.dimgray}[${thisCaller}]${ansi.none}`);
    util.log(args);


}


util.scrollIntoViewOLD = async function (element) {
    //scrolls an element into view
    /* ok, there's some confusion here. There are two scrollIntoView functioins defined. I *think* this is the old one. Test and see if it's working though. Keep this around until 100% positiive the later one works. */
    util.errorLog("scrolling into view", await util.getHTMLTargetOfWebElement(element));
    await driver.executeScript(`
        var element = arguments[0];
        var box = element.getBoundingClientRect();
        var body = document.body;
        var docEl = document.documentElement;
        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;
        var clientTop = docEl.clientTop || body.clientTop || 0;
        var clientLeft = docEl.clientLeft || body.clientLeft || 0;
        var top = box.top + scrollTop - clientTop;
        var left = box.left + scrollLeft - clientLeft;
        window.scrollTo(left, top);
    `, element);
}

/* uiDo.-xxxxxUNNEEDEDxxxxxxx-waitUntilElementReady = async function ({ by, timeout = 5000, context = driver }) {
//this function was an earlier attempt at what currently defined uiDo.waitUntilElementReady does. 
//Probably can be deleted but keeping around as a reference for what DIDN'T work.
    const startTime = Date.now();

    while (true) {
        try {
            // Re-find the element every time to avoid stale element errors
            const element = await context.findElement(by);

            // Scroll the element into view
            await context.executeScript("arguments[0].scrollIntoView({block: 'nearest'});", element);

            // Check if the element is enabled
            if (by.toString().indexOf('By(css selector, html') !== 0) {
                const isEnabled = await element.isEnabled();
                if (!isEnabled) throw new Error('Element is not enabled');
            }
            // Check if the element is visible
            const isDisplayed = await element.isDisplayed();
            if (!isDisplayed) throw new Error('Element is not visible');

            // Check if the element is not obscured
            const isObscured = await driver.executeScript(`
                var elem = arguments[0];
                var box = elem.getBoundingClientRect();
                var docElem = document.documentElement;
                var scrollTop = window.pageYOffset || docElem.scrollTop;
                var scrollLeft = window.pageXOffset || docElem.scrollLeft;
                var clientTop = docElem.clientTop || 0;
                var clientLeft = docElem.clientLeft || 0;
                var top  = box.top +  scrollTop - clientTop;
                var left = box.left + scrollLeft - clientLeft;
                var centerX = left + box.width / 2;
                var centerY = top + box.height / 2;
                var elementAtCenter = document.elementFromPoint(centerX, centerY);
        return (elementAtCenter !== elem && !elem.contains(elementAtCenter))?(elementAtCenter.outerHTML):false;
            `, element);
            if (isObscured) throw new Error('Element is obscured by '+ isObscured);

            // If all conditions are met, return the element
            return element;
        } catch (error) {
            // Element not found or not ready, ignore and retry
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {
            throw new Error(`Element ${by} was not ready after ${timeout} ms.`);
        }

        // Wait a bit before retrying
        await driver.sleep(500);
    }
}
*/


uiDo.waitUntilPageIsReady = async function () {
    // Wait for the page to be ready
    try {
    await driver.wait(async function() {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
    }, 10000); 
return true;} catch (e) {util.errorLog("Page was not ready", e);
        throw new Error("Page was not ready");
    }
}    


util.findFirstMissingSelector = async function(cssSelector) {
    //given a css selector chain like "a > b > c", returns the first element in the selector that is missing from the page.
    const parts = cssSelector.split('>');
    let selector = '';

    for (let i = 0; i < parts.length; i++) {
        selector += (i > 0 ? '>' : '') + parts[i].trim();

        let element;
        try {
            await driver.wait(until.elementLocated(By.css(selector)), 5000);
            element = await driver.findElement(By.css(selector));
        } catch (error) {
            console.log(`Element with selector "${selector}" not found.`);
            return;
        }

        if (!element) {
            console.log(`Element with selector "${selector}" not found.`);
            return;
        }
    }

    console.log('All elements found.');
}


util.scrollIntoView = async function (element) { 
    //scrolls an element into view
    util.errorLog("scrolling into view", await util.getHTMLTargetOfWebElement(element)); await driver.executeScript("arguments[0].scrollIntoView({block: 'nearest', inline: 'nearest'});", element); }


uiDo.waitUntilElementReady = async function ({ by, timeout = 5000, context = driver, scrollIntoView = true}) {
    //
    const startTime = Date.now();
    let lastError = "";

    util.errorLog("waitUntilElementReady Element locator is", by);
    while (true) {
        try {
            // Re-find the element every time to avoid stale element errors
            const element = await context.findElement(by);

            // Scroll the element into view if needed

            if (scrollIntoView) {
                try{
                await driver.executeScript("arguments[0].scrollIntoView({block: 'nearest', inline: 'nearest'});", element);} catch (e) {util.errorLog("Couldn't scroll into view", e);}
            }
            // Check if the element is enabled
            if (by.toString().indexOf('By(css selector, html') !== 0) {
                const isEnabled = await element.isEnabled();
                if (!isEnabled) throw new Error('Element is not enabled');
            }
            // Check if the element is visible
            const isDisplayed = await element.isDisplayed();
            if (!isDisplayed) throw new Error('Element is not visible');

            // Check if the element is not obscured
           /* THIS OCCASIONALLY REPORTED BUTTONS IN A MODAL DIV TO BE BLOCKED BY THE BACKGROUND DIV TAHE WAS BEHIND THE IV CONTAINING THEM: const isObscured = await driver.executeScript(`
                var elem = arguments[0];
                var box = elem.getBoundingClientRect();
                var docElem = document.documentElement;
                var scrollTop = window.pageYOffset || docElem.scrollTop;
                var scrollLeft = window.pageXOffset || docElem.scrollLeft;
                var clientTop = docElem.clientTop || 0;
                var clientLeft = docElem.clientLeft || 0;
                var top  = box.top +  scrollTop - clientTop;
                var left = box.left + scrollLeft - clientLeft;
                var centerX = left + box.width / 2;
                var centerY = top + box.height / 2;
                var elementAtCenter = document.elementFromPoint(centerX, centerY);
        return (elementAtCenter && elementAtCenter !== elem && !elem.contains(elementAtCenter) && elementAtCenter)?(elementAtCenter.outerHTML):false;
            `, element); */
            const isObscured = await driver.executeScript(`
            var elem = arguments[0];
            var box = elem.getBoundingClientRect();
            var centerX = box.left + box.width / 2;
            var centerY = box.top + box.height / 2;
        
            var elementAtCenter = document.elementFromPoint(centerX, centerY);
            if (elementAtCenter === elem || elem.contains(elementAtCenter||!elementAtCenter)) {
                return false;
            } else {
                return elementAtCenter.outerHTML;
            }
        `, element);
            if (isObscured) throw new Error('Element is obscured by '+ isObscured);

            // If all conditions are met, return the element

            return element;
        } catch (error) {
            lastError=`Element ${by} is not ready: ${error} `;
            // Element not found or not ready, ignore and retry
            util.errorLog(lastError);
        }

        // Check timeout
        if (Date.now() - startTime > timeout) {

            throw new Error(`Element ${by} was not ready after ${timeout} ms. ${ansi.red}Last reason it was unreachable was:${ansi.yellow} ${lastError}${ansi.none}`);
        }

        // Wait a bit before retrying
        await driver.sleep(500);
    }
}


uiDo.click = async function ({ by, element, context = driver, scrollIntoView = true, timeout = 5000 }) {
    // Click an element, either by locator or by passing the element directly, with optional context, scrollIntoView, and timeout
    const startTime = Date.now();

    while (true) {
        try {
            await util.goToActiveBrowserTab(); /* This is a big problem. The clicking on a event opening a new page is causing the driver to lose focus on the active tab. This is a workaround. But it means that passing an element for context now goes stale. I think I'm going to need a uiDo.focusContext({by}) or some such to store the last locator along with the context, or just change every reference to context to pass a locator instead of an element.   */
            // If a locator was provided, wait for the element to exist in the DOM
            if (by) {
                element = await context.findElement(by);
            }

            // If no element or locator was provided, throw an error
            if (!element) {
                throw new Error('No element or locator provided');
            }


            // Wait for the element to be ready
            await uiDo.waitUntilElementReady({ by, timeout, context, scrollIntoView });

            // Click the element
            await element.click();

            // If we've reached this point, the click was successful, so we can break the loop
            break;
        } catch (error) {
            // If an error occurred, check if the timeout has been reached
            if (Date.now() - startTime > timeout) {
                throw new Error(`Failed to click element ${by || element} after ${timeout} ms: ${error.name}: ${error.message} ${error.stack}`);
            }

            // If the timeout has not been reached, wait a bit before retrying
            await driver.sleep(500);
        }
    }
}

util.goToActiveBrowserTab = async function () {
// go to most recently opened tab

    // Get the list of all window handles
    let handles = await driver.getAllWindowHandles();
    
    // Switch to the last window handle in the list
    await driver.switchTo().window(handles[handles.length - 1]);
    
    // Now the driver is focused on the last opened tab
}


uiDo.selectElement = async function ({ by }) {
    // Select an element by locator
    
    try {
        let selection = await driver.findElement(by);
        return selection;
    }
    catch (e) { util.errorLog("Failed to selectElement", element, "by", by); util.log("1 NATIVE CATCH INFO:", e.name, e.message, e.stack); throw ("Failed to selectElement"); }
}

uiDo.waitForElementCssChange = async function ({ By, CssAttribute, AttributeValueToWaitFor, timeout = 20000 }) {
// Wait for an element to change its CSS attribute to a specific value

    await driver.wait(async function () {
        const elements = await driver.findElements(By);
        for (const element of elements) {
            const style = await element.getCssValue(CssAttribute);
            if (style === AttributeValueToWaitFor) {
                return element;
            }
        }
        return false;
    }, timeout);
}

uiGet.element = async function ({ by, context = driver }) {
    // Get an element by locator
    await uiDo.waitUntilElementReady({ by, context });
    let el = await context.findElement(by).then(function (element) {
        return element;//it was found
    }, function (err) {
        if (err instanceof context.error.NoSuchElementError) {
            console.log("no such element");
            console.log(by);
            context.promise.rejected(err)
            // return false;//element did not exist
        } else {
            context.promise.rejected(err);//some other error...
        }
    });
    return el;
}

uiDo.setField = async function ({ element, value }) {
// Set the value of a form field
    await driver.wait(until.elementIsEnabled(element), 10000);
    await driver.executeScript('arguments[0].select()', element);



    // Alternative method to select all text that should work cross-platform
    await element.sendKeys(Key.HOME);
    await element.sendKeys(Key.SHIFT, Key.END);  // Select everything from HOME to END
    await element.sendKeys(Key.BACK_SPACE);     // Clear selected text

    // Send new value
    let el = await element.sendKeys(value);
    return el;

};

uiScript.fillFormFields = async function ({ fields, context = driver }) {
    // Fill in form fields with the values provided in the fields object
    util.errorLog("Context is", await util.getHTMLTargetOfWebElement(context));
    util.errorLog("driver is", driver);

    if (fields.text) {
        util.errorLog("XXXXXX Filling in text fields...");

        util.errorLog("fields.text", fields.text, "found in ", await util.getHTMLTargetOfWebElement(context));
        let i = 1;
        for (const key of Object.keys(fields.text)) {
            var thisField = fields.text[key];
            util.errorLog(`field #${i}`, "key", key, "thisField", thisField, "context", await util.getHTMLTargetOfWebElement(context));
            let el = await uiGet.element({ by: By.css(`textarea[name="${key}"], input[type="text"][name="${key}"]`), context });
            util.errorLog("increasing field count to ", i++);
            util.errorLog("found input", await util.getHTMLTargetOfWebElement(el));
            await uiDo.setField({ element: el, value: thisField });
        }
    }
    if (fields.popup) {
        util.errorLog("fields.popup", fields.popup, "found in ", await util.getHTMLTargetOfWebElement(context));
        let j = 1;
        for (const key of Object.keys(fields.popup)) {
            var thisField = fields.popup[key];
            util.errorLog(j, "popup key", key, "thisField", thisField);
            let el = await uiScript.handleFieldWithPopup("input[name=" + key + "]", thisField, data.uiElements.fieldPopupMenu);
            util.errorLog(j++);
            util.errorLog("found popup thisFieldue (and clicked): ");
            util.errorLog(await util.prettyPrintWebElement(el));

        }
    }
    if (fields.dateRange) {
        util.errorLog("fields.daterange", fields.dateRange, "found in ", await util.getHTMLTargetOfWebElement(context));
        let k = 1;
        for (const key of Object.keys(fields.dateRange)) {
            var thisField = fields.dateRange[key];
            util.errorLog(k, "popup key", key, "thisField", thisField);
            let el = await uiScript.handleFieldWithPopup("input[name=" + key + "]", thisField, data.uiElements.dateRangePicker);

            if (!(el instanceof WebElement)) {
                util.errorLog("266 el is not a webElement, it is ", typeof el, " and is ", el);
                util.errorLog("fields.dateRange is ", fields.dateRange);
                util.errorLog("key is ", key);
                util.errorLog("thisField is ", thisField);
                util.errorLog("k is ", k);

            }
            util.errorLog(k++);
            util.errorLog("Found input[name=" + key + "] and entered values: ");
            util.errorLog(JSON.stringify(el));

        }


    }


    await uiDo.click({ by: data.uiElements.primaryButton, context });
}

uiScript.clickAndGetPopup = async function ({ buttonSelector, popupSelector }) {
    // Click a button to open a popup and return the popup element
    util.errorLog("377 Starting clicking by ", buttonSelector, " to open ", popupSelector);
    let theAlreadyOpenPopups = await driver.findElements(popupSelector);
    util.errorLog("379 theAlreadyOpenPopup found: ", theAlreadyOpenPopups.length, " already open popups");
    util.errorLog("380 looking for button by selector: ", buttonSelector);
    // let theButton = await driver.findElement(buttonSelector);
    util.errorLog("382 About to click the button: by ", buttonSelector);
    //await driver.executeScript("arguments[0].scrollIntoView(true);", theButton);

    await uiDo.click({ by: buttonSelector });
    util.errorLog("385 clicked");

    let theNewOpenPopups = await util.waitForListLengthChange(popupSelector, theAlreadyOpenPopups.length);
    let thePopup = await util.findAddedElement(theAlreadyOpenPopups, theNewOpenPopups);
    util.errorLog("389 thePopup found:", JSON.stringify(await util.prettyPrintWebElement(thePopup, ["innerHTML", "style"], false)));
    return thePopup;
}

uiScript.handleFieldWithPopup = async function (fieldSelector, value, popupSelector = By.css("ul.dropdown-menu[style*='display: block']")) {
    // Click a field to open a popup and choose a value from the popup
    util.errorLog("Starting choose value for field ", fieldSelector, " value ", value);
    let theAlreadyOpenDropdowns = await driver.findElements(popupSelector);
    util.errorLog("theAlreadyOpenDropdowns found " + theAlreadyOpenDropdowns.length + "open dropdowns");


    util.errorLog("About to click the field: by ", By.css(fieldSelector));

    await uiDo.click({ by: By.css(fieldSelector), scrollIntoView: true });
    util.errorLog("clicked");

    util.errorLog("looking for field by selector: ", fieldSelector);

    let theNewOpenDropdowns = await util.waitForListLengthChange(popupSelector, theAlreadyOpenDropdowns.length);

    let dropdownElement = await util.findAddedElement(theAlreadyOpenDropdowns, theNewOpenDropdowns);
    util.errorLog("dropdownElement found:", await util.prettyPrintWebElement(dropdownElement, ["innerHTML", "style"], false));
    let theLI;
    if (typeof value == "object") {
        // multiple field entry here
        //util.log("Multiple fields will be entered: ", JSON.stringify(value, null, settings.loggingSettings.prettyLogs));
        await uiScript.fillFormFields({ fields: value, context: dropdownElement });
        theLI = value;
    } else {
        theLI = await uiDo.chooseOptionFromOpenDropdown({ dropdownElement, value });
    }
    return theLI;
}

uiDo.chooseOptionFromOpenDropdown = async function ({ dropdownElement, value }) {
    // Choose an option from an open dropdown
    let theLI = await dropdownElement.findElement(By.xpath('.//a[contains(., "' + value + '")]'));
    util.errorLog("value LI found: ", await util.prettyPrintWebElement(theLI));
    await uiDo.click({by:By.xpath('.//a[contains(., "' + value + '")]'),context:dropdownElement});
    return theLI;
}


util.tInitialize = async function () {
    //
    //initialize the driver. This has to happen in every script run. 
    console.log("");
    console.log("");
    console.log("");
    console.log("--------------starting data.session", data.session, " at ", Date(), "--------------");
    console.log(" ");
    const chromeOpts = require('selenium-webdriver/chrome');
    const options = new chromeOpts.Options();

    options.addArguments('--disable-xss-auditor');
    options.addArguments('--unsafely-disable-devtools-self-xss-warnings');
    // options.addArguments('--headless');

    driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();
    //        driver = await new Builder().forBrowser(Browser.CHROME).build(); 
    await driver.get(data.testUrl);
    await driver.getTitle(); //make sure page loads before continuing.
    /* await driver.manage().setTimeouts({
         implicit: 5000
     }); */
return driver;
}

/* util.logPropertiesAndMethods = function logPropertiesAndMethods(obj) {
// don't know why I disabled this; reenable if needed
    for (let prop in obj) {
        if (typeof obj[prop] === 'function') {
            util.errorLog(prop + ' is a method');
        } else {
            util.errorLog(prop + ' is a property');
        }
    }
} */


util.getHTMLTargetOfWebElement = async function (elementToConvert) {
    //converts a WebElement to an object with its HTML attributes and innerHTML
    runcount++;
    let theResult;
    if (elementToConvert instanceof WebElement) {
        theResult = await driver.executeScript('var items = {tagName:(arguments[0] != null && typeof arguments[0].tagName != "undefined")?arguments[0].tagName:"none",innerHTML:(arguments[0] !== null && typeof arguments[0].innerHTML !== "undefined")?arguments[0].innerHTML:"none"}; if (arguments[0] && arguments[0].attributes) {for (index = 0; index < arguments[0].attributes.length; ++index) { items[arguments[0].attributes[index].name] = arguments[0].attributes[index].value }}; return items;', elementToConvert);
        theResult.innerText = (await elementToConvert.getText()).replace(/(?:\r\n|\r|\n)/g, '\xB6');
        theResult.errorLoggingNote = "WebElement converted to HTML, and this note added, for log output only. Internally, element is a webElement.";

    } else {

        util.errorLog(runcount + " 412 passed a non-WebElement to convert, maybe put a breakpoint here to troubleshoot ", elementToConvert);
        theResult = elementToConvert;
        theResult.innerText = "ERROR - couldn't get text from non-WebElement " + JSON.stringify(elementToConvert);
    }
    util.errorLog(runcount + " 402 theResult is", JSON.stringify(theResult).substring(0, 100) /* just gets too long with divs with lots of inner html */);
    util.errorLog(runcount + " 403 typof element is is", typeof elementToConvert);
    util.errorLog(runcount + " 404 elementToConvert is WebElement:", elementToConvert instanceof WebElement);
    util.errorLog(runcount + " 405 elementToConvert is:", elementToConvert);
    return theResult;
}


util.prettyPrintWebElement = async function (elementToConvert, hideFields = [], showInsteadOfHide = true /* true = show only hideFields, false= hide them. */, truncateInsteadOfHide = 30 /* false = hide hidden fields, # = length to truncate fields at instead of hiding, object {fieldname:length} specify custom truncate lengths, true = default length(30) */) {
// returns a stringified version of the elementToConvert, with the fields specified in hideFields hidden. If showInsteadOfHide is true, only the fields in hideFields will be shown. If showInsteadOfHide is false, the fields in hideFields will be hidden. If truncateInsteadOfHide is true, fields will be truncated to 30 characters instead of hidden. If truncateInsteadOfHide is an object, it will truncate fields to the length specified in the object. If truncateInsteadOfHide is false, fields will be hidden.
    util.errorLog("394 STARTING getHTMLAttrsOfWebElement.", elementToConvert, " hideFields is ", JSON.stringify(hideFields), "showInsteadOfHide", showInsteadOfHide, "truncateInsteadOfHide", JSON.stringify(truncateInsteadOfHide));
    let theelementToConvert;
    if (elementToConvert instanceof WebElement) {
        theelementToConvert = await util.getHTMLTargetOfWebElement(elementToConvert);
    } else {

        util.errorLog(runcount + " 436 passed a non-WebElement to convert, maybe put a breakpoint here to troubleshoot ", elementToConvert);
        theelementToConvert = elementToConvert;
    }
    util.errorLog("396 javascript got element", theelementToConvert);
    util.errorLog("397 allattributes done running js");
    if (hideFields.length === 0) {

        util.errorLog("399 allattributes finished, hideFields is empty, returning all attributes");

        return theelementToConvert; // If no fields are specified, return everything.
    }
    else {
        util.errorLog("415 hideFields is not empty", JSON.stringify(hideFields));
        let filteredAttributes = {};
        for (let key in theelementToConvert) {
            let thisLength = typeof truncateInsteadOfHide === "object" ? truncateInsteadOfHide[key] : truncateInsteadOfHide;
            let effLength = (typeof thisLength === "undefined" || thisLength === true) ? 30 : thisLength;
            if ((hideFields.includes(key) && showInsteadOfHide) || (!hideFields.includes(key) && !showInsteadOfHide) || key == "errorLoggingNote") {
                util.errorLog("426a key '" + key + "' " + (showInsteadOfHide ? " " : "not") + " in hideFields " + JSON.stringify(hideFields) + ", adding to filteredAttributes");

                filteredAttributes[key] = theelementToConvert[key]
            }
            else if (thisLength) {
                util.errorLog("422a key '" + key + "' " + (showInsteadOfHide ? "not " : "") + " in hideFields " + JSON.stringify(hideFields) + ", adding to filteredAttributes, thisLength is" + thisLength);
                filteredAttributes[key] = (theelementToConvert[key].length > effLength ? theelementToConvert[key].substring(0, effLength) + "..." : theelementToConvert[key]);
                util.errorLog(`429 filteredAttributes[key=${key}] is`, filteredAttributes[key]);
            } else {
                util.errorLog("435a key '" + key + "' " + (showInsteadOfHide ? "not " : "") + " in hideFields " + JSON.stringify(hideFields) + ", thisLength is " + thisLength + ", not adding to filteredAttributes");
            }
        }
        return filteredAttributes
    }
}


util.caller = function (startLine = 3, numberOfLines = 4) {
    // Get the caller of the function that called this function

    // Create an Error object to capture the stack trace
    const err = new Error();
    const stack = err.stack;

    // Split the stack trace into individual lines
    const stackLines = stack.split("\n");

    const result = [];

    // Start from the specified startLine and get the specified number of lines
    for (let i = startLine; i < stackLines.length && result.length < numberOfLines; i++) {
        const stackLine = stackLines[i];

        // Use a regular expression to extract the function name and line number from the stack line
        const match = stackLine.match(/at (.*) \(.*\)/);
        const matchnum = stackLine.match(/:(\d+):/);

        if (match) {
            const functionName = match[1];

            // Skip the line if the function name is "descriptor.value" or "process.processTicksAndRejections"
            if (functionName.includes('descriptor.value') || functionName.includes('process.processTicksAndRejections')) {
                continue;
            }

            result.push({
                caller: functionName,
                callerLine: matchnum ? matchnum[1] : 'unknown'
            });
        } else {
            result.push({
                caller: 'global scope',
                callerLine: 'N/A'
            });
        }
    }

    return result.map(r => `${r.caller} line ${r.callerLine}`).join(' from ');
}


util.waitForListLengthChange = async function (by, initialLength, timeout = 10000) {
    // Wait for the length of a list of elements to change
    util.errorLog("by is", JSON.stringify(by, null, 2));
    return driver.wait(
        async function loopWaitingForListChange() { //should be anonymous, but util.caller needs a name for util.errorLog
            let elements = await driver.findElements(by);
            util.errorLog("initialLength=", initialLength, "foundElements=", elements.length);
            return elements.length !== initialLength ? elements : false;
        },
        timeout, 'Waiting for the length of the list to change.');
}


util.findAddedElement = async function (firstList, secondList) {
    //

    let firstIds = await Promise.all(firstList.map(async (element) => {
        return element.getAttribute('id'); // Use any unique attribute
    }));

    for (let element of secondList) {
        let id = await element.getAttribute('id'); // Use the same attribute as above
        if (!firstIds.includes(id)) {
            return element; // This is the new element
        }
    }

    return null; // In case there is no new element
}


util.finish = async function (closeBrowser = false) {
    // Finish the session

    console.log(" ");
    console.log("--------------ending session", data.session, " at ", Date(), "--------------");
    console.log(" ");
    console.log(" ");
    console.log(" ");
    if (closeBrowser) { await driver.quit(); }
}

util.formatTextWrap = (text, maxLineLength, whitespace) => {
    // Wrap text to a maximum line length, adding whitespace at the beginning of each line. This function is used to format log messages. 
    const lines = text.split(/[\r\n]+/g);
    let formattedText = '';

    lines.forEach((line, index) => {
        const words = line.split(/([\s:,]+)/);
        let lineLength = 0;

        formattedText += whitespace + words.reduce((result, word) => {
            if (lineLength + word.length >= maxLineLength) {
                lineLength = word.length;
                return result + `\n${settings.loggingSettings.useLineNumbers ? "»" + (String(logCount).padStart(4, '0')) + "» " : ""}${whitespace}${word}`; // don't add spaces upfront
            } else {
                lineLength += word.length + (result ? 1 : 0);
                return result ? result + `${word}` : `${word}`; // add space only when needed
            }
        }, '');

        if (index !== lines.length - 1) {
            formattedText += '\n'; // Add a newline at the end of each line, except the last one
        }
    });

    return formattedText;
}


//// LOGGING SETUP - must occur after all functions to be logged. ////


util.formatTag = function (element, attributes = [], outerColor = "") {
// Format an HTML element as a tag with optional attributes and outer color. This function is used to format log messages.
    let theString = (outerColor == "" ? "{{ansi.yellow}}" : outerColor) + "<" + element.tagName;
    if (attributes.length == 0) {
        for (let key of attributes) {
            theString = theString + ((key != "tagName" && key != "innerHTML") ? (" " + key + "=\"" + element[key] + "\"") : "");
        }


    } else {
        for (let key of attributes) {
            if (element[key]) {
                theString = theString + " " + key + "=\"" + element[key] + "\"";
            }
        }

    }

    theString = theString + ">{{ansi.cyan}}" + (element.innerText ?? (element.innerHTML ?? "")) + (outerColor == "" ? "{{ansi.yellow}}" : outerColor) + "</" + element.tagName + ">{{ansi.none}}";
    return theString;
}



util.convertDeepWebElementsToHumanReadable = async function (obj) {
// Convert WebElements in an object to human-readable format. This function is used to format log messages. 

    //DO NOT ADD util.errorLog CALLS TO THIS, WILL CAUSE RECURSION
    if (Array.isArray(obj)) {
        // Recursively handle arrays
        return await Promise.all(obj.map(util.convertDeepWebElementsToHumanReadable));
    } else if (typeof obj === 'object' && obj !== null) {
        // Recursively handle objects
        if (obj instanceof WebElement) {
            // Replace WebElement with its attributes
            //return await util.prettyPrintWebElement(obj, ["innerHTML", "style"], false);
            return await util.getHTMLTargetOfWebElement(obj);
        } else {
            // Recursively handle object properties
            const entries = await Promise.all(
                Object.entries(obj).map(async ([key, val]) => [key, await util.convertDeepWebElementsToHumanReadable(val)])
            );
            return Object.fromEntries(entries);
        }
    } else {
        // Return other values directly

        return obj;
    }
}


util.applyTemplate = async function (vars, templateString) {
    // Apply a template to a set of variables. This function is used to format log messages. 

    const regex = /\{\{([\w\.]+)\}\}/g;
    let modifiedTemplate = templateString;
    let matches = [...modifiedTemplate.matchAll(regex)];

    while (matches.length > 0) {
        for (const match of matches) {
            const path = match[1];
            let value = vars;

            path.split('.').forEach(part => {
                const index = isNaN(part) ? part : Number(part);
                value = value[index];
            });

            const jsonString = typeof value === 'string' ? value : JSON.stringify(await util.convertDeepWebElementsToHumanReadable(value), null, settings.loggingSettings.prettyLogs);

            modifiedTemplate = modifiedTemplate.replace(new RegExp(`\\{\\{${path}\\}\\}`, 'g'), jsonString);
        }

        matches = [...modifiedTemplate.matchAll(regex)];
    }

    return modifiedTemplate;
}
util.tagFullName = function (tagName) {
    // Return the full name of an HTML tag. This function is used to format log messages.

    if (tagName == null) { return "NoElementSpecified"; }
    switch (tagName.toLowerCase()) {
        case 'input':
            return 'input field';
        case 'button':
            return 'button';
        case 'a':
            return 'link';
        case 'select':
            return 'dropdown';
        case 'textarea':
            return 'text area';
        default:
            return tagName;
    }
}


util.getKeyByValue=function(object, value) {
    // Get the key that has a value in an object. 
    return Object.keys(object).find(key => object[key] === value);
}

///**************************************************************define log output templates

const outputTemplates = { 
    //default templates for function types
    uiDo: {
        before: `• {{ansi.boldbrightblue}}Doing action {{key}},{{ansi.regular}} with {{ansi.yellow}}parameter {{args}}{{ansi.none}}`,
        after: `{{logline}} {{ansi.green}}...done{{ansi.none}}`,
        catch: `❌{{logline}} {{ansi.red}}FAILED: {{e.name}} {{ansi.yellow}}{{e.message}}{{ansi.none}}`, //have to use loglines because can't alwats calculate buttons after they've been clicked... sometimes they've vanished.   
        indent: function () {

            return settings.loggingSettings.verboseDebugging;
        }

    }, /* indent on during debugging */
    uiGet: {
        before: function (key, args) { return "• Looking" + (args.context ? (" in {{ansi.yellow}}" + util.tagFullName(args.context.tagName) + "{{ansi.regular}} " + util.formatTag(args.context, ["name", "type", "style", "class", "id"])) : "") + ` for {{key}}` + (Object.keys(args).length > 0 ? ` with {{ansi.yellow}}{{args.by.using}} '{{args.by.value}}'{{ansi.none}}` : ""); },
        after: `{{logline}} {{ansi.green}}...found {{ansi.boldbrightblue}}{{resultAsTag}}{{ansi.none}}`,
        catch: `❌{{logline}} {{ansi.red}}FAILED: {{e.name}}{{ansi.yellow}}{{e.message}}{{ansi.none}}`,
        indent: function () { return settings.loggingSettings.verboseDebugging; }
    },/* indent on during debugging */
    uiScript: {
        before: async function (key, args) {
            return `🟢 Running Routine {{ansi.boldbrightblue}}{{key}}{{ansi.regular}}` + (Object.keys(args).length > 0 ? ` with {{ansi.yellow}} parameter {{args}}{{ansi.none}}` : "");
        },
        indent: true /* indent will also cause "before" to output immediately */,
        after: async function (key, args) { return `🏁 {{ansi.italicgreen}}Finished routine {{key}}` + (Object.keys(args).length > 0 ? ` with {{ansi.yellow}} parameter {{args}}{{ansi.none}}` : ""); },
        catch: `❌{{logline}} {{ansi.red}}FAILED: {{e.name}} {{ansi.yellow}}{{e.message}}{{ansi.none}}`
    }
};



//Function template overrides in form uiXxxx.functionName.outputTemplates = {before: , after: }

uiDo.click.outputTemplates = {
    before: async function (key, args) {

        let theOut = "• {{ansi.boldbrightblue}}Click on " + (args.element ? util.tagFullName(args.element.tagName) : 'element at {{args.by.using}} "{{args.by.value}}"') + (args.element ? "{{ansi.regular}} " + util.formatTag(args.element, ["name", "type", "id", "class"]) + " {{ansi.none}}" : "");
        return theOut;

    },
    after: `{{logline}}, {{ansi.green}}...clicked {{ansi.boldbrightblue}}{{args.result}}{{ansi.none}}`
} //have to use logines because can't always reference button elements anymore after they've been clicked... sometimes they've vanished. 

uiDo.chooseOptionFromOpenDropdown.outputTemplates = {
    before: `• {{ansi.boldbrightblue}}Choosing option containing '{{args.value}}'{{ansi.regular}} from dropdown`,
    after: `{{logline}} {{ansi.green}}...done{{ansi.none}}`
};


uiDo.waitUntilElementReady.outputTemplates = {
    before: function (key, args) { return `• {{ansi.green}}...waiting for a clickable, active element with {{args.by.using}} {{ansi.yellow}}{{args.by.value}}{{ansi.regular}}` + (args.context != driver ? " within parent  {{ansi.boldbrightblue}}{{html.context}}{{ansi.none}}" : ""); },
    after: `{{logline}} {{ansi.green}}...found{{ansi.none}}`
};


uiDo.setField.outputTemplates = {
    before: function (key, args) { return `• Setting Field {{ansi.boldbrightblue}}` + util.formatTag(args.element, ['name', 'type', 'id', 'class']) + `{{ansi.regular}} to "{{ansi.yellow}}{{args.value}}{{ansi.none}}" `; },
    after: `{{logline}} {{ansi.green}}...done{{ansi.none}}`
};

uiScript.handleFieldWithPopup.outputTemplates = {
    before: function (key, args) { return `🟢 Click popup menu field {{ansi.boldbrightblue}}'{{args.0}}'{{ansi.regular}} to ` + ((typeof args[1] == "string") ? `select option containing {{ansi.boldbrightblue}}"{{args.1}}"{{ansi.none}}` : `enter fields {{args.1}}`); },
    after: /*' '.repeat(settings.loggingSettings.indentDepth) + */`🏁 done entering {{args.1}} in popup from {{args.0}}{{ansi.none}}`
};


uiScript.clickAndGetPopup.outputTemplates = {
    before: `🟢 {{ansi.boldbrightblue}}Running Routine {{key}}{{ansi.regular}}, will click element with {{ansi.boldbrightblue}}{{args.buttonSelector.using}} {{ansi.yellow}}"{{args.buttonSelector.value}}"{{ansi.none}} and wait for popup with {{ansi.boldbrightblue}}{{args.popupSelector.using}} {{ansi.yellow}}"{{args.popupSelector.value}}" {{ansi.none}}`,
    after: `🏁 End of Routine {{key}} {{ansi.green}}...DONE{{ansi.none}}`
};


uiScript.fillFormFields.outputTemplates = {
    // before: async function(key,args){return `🟢 {{ansi.boldbrightblue}}Running Routine {{key}}{{ansi.regular}} ARGUMENTS {{args}} {{args.context.tagName}}`;},//in {{ansi.boldbrightblue}}WHAT IS TAGNAME` +/~util.tagFullName(args.context.tagName)~/+"{{ansi.none}} "+ util.formatTag(args.context, ["name", "type","id","class"])+` with fields {{ansi.yellow}}{{args.fields}}{{ansi.none}}`;},
    before: async function (key, args) { return `🟢 Fill in form: fields {{ansi.yellow}}{{args.fields}}{{ansi.none}}` + ((args && args.context && args.context.tagName) ? ` in {{ansi.boldbrightblue}}` + /*util.tagFullName(args.context.tagName) +*/ util.formatTag(args.context, ["name", "type", "id", "class"]) + "{{ansi.none}} " : ""); },
    after: `🏁 End of Routine {{key}} {{ansi.green}}...DONE{{ansi.none}}`
};

///end output templates


require('./userSettings_userCustomFunctionsForTests.js')({driver, uiDo, uiGet, uiScript, util, data, settings, ansi});


//UI LOGGER *****************************

function logUi(target, key, descriptor, thisType) {
    // Wrap a function with logging for UI actions
    stepcount++;
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args) {
        // settings.loggingSettings.verboseDebugging = true;
        util.errorLog("\n*********STARTING **********", key);
        util.errorLog(`828 starting processing ${key} with args`, JSON.stringify(args, null, settings.loggingSettings.prettyLogs));
        let html = {};
        let argsConvertedForDisplay = {};
        //util.errorLog ("H", JSON.stringify(args));

        if (typeof args.context != "undefined") {

            util.errorLog("715 typof args.context is not undefined", typeof args.context)
            if (args.context == driver) { util.errorLog("CONTEXT IS DRIVER"); }
            else {
                util.errorLog("716 ARGS CONTEXT IS NOT DRIVER: raw-", JSON.stringify(args.context));
                util.errorLog("717 ARGS CONTEXT IS NOT DRIVER: allAttr-", JSON.stringify(util.prettyPrintWebElement(args.context)));
            }
        } else { util.errorLog("719 no context argument"); }

        if (typeof argsConvertedForDisplay.context != "undefined") {
            if (argsConvertedForDisplay.context == driver) { util.errorLog("argsConvertedForDisplay CONTEXT IS DRIVER"); }
            else {
                util.errorLog("724 argsConvertedForDisplay CONTEXT IS NOT DRIVER: raw-", JSON.stringify(argsConvertedForDisplay.context));
                util.errorLog("725 argsConvertedForDisplay CONTEXT IS NOT DRIVER: allAttr-", JSON.stringify(util.prettyPrintWebElement(argsConvertedForDisplay.context)));
            }
        }


        util.errorLog("728 about to iterate keys to build HTML object");

        //util.errorLog("G", JSON.stringify(args));
        let args_destructured = (args.length == 1) ? args[0] : args;
        util.errorLog("729 args_destructured is", JSON.stringify(args_destructured));
        for (let key in args_destructured) {
            let iterCount = 0;
            util.errorLog((iterCount++), " iterating keys to build HTML object.");
            util.errorLog("730 Current key:", key);
            util.errorLog("731 typeof args_destructured[key]", typeof args_destructured[key]);
            util.errorLog("732 args_destructured[key] instanceof WebElement?", args_destructured[key] instanceof WebElement);

            if (args_destructured[key] && typeof args_destructured[key] === 'object' && args_destructured[key] instanceof WebElement) {
                util.errorLog("734 about to convert args_destructured [key] to  HTML for key: ", key)
                argsConvertedForDisplay[key] = await util.prettyPrintWebElement(args_destructured[key], settings.loggingSettings.HTMLAttributesToLog, true);
                html[key] = util.formatTag(argsConvertedForDisplay[key], ["name", "type", "style", "class", "id"]); //set args for template to have html element instead of webelement


                util.errorLog("822 converted to html: ", html[key])
            } else {
                util.errorLog("824 args_destructured[" + key + "] not a webelement", args_destructured[key]);
                argsConvertedForDisplay[key] = args_destructured[key];
            }
            util.errorLog("751 Done with iteration for key", key, "html[key] is", JSON.stringify(html[key], null, settings.loggingSettings.prettyLogs));
        }
        //util.errorLog("F", JSON.stringify(args));
        util.errorLog("752 Done with iterations to build HTML object.");

        util.errorLog("712 argsConvertedForDisplay (incl convert webelements) is", argsConvertedForDisplay);
        let logline;
        let thisClose;
        util.errorLog("871 html", html);

        // Determine the correct before template
        let beforeTemplateObject = originalMethod.outputTemplates && originalMethod.outputTemplates.before ?
            originalMethod.outputTemplates.before :
            (outputTemplates[thisType][key] && outputTemplates[thisType][key].before) ?
                outputTemplates[thisType][key].before :
                outputTemplates[thisType].before;
        //util.errorLog ("E", JSON.stringify(args));
        let logString = ((typeof beforeTemplateObject == "function") ?
            (await beforeTemplateObject(key, argsConvertedForDisplay)) :
            beforeTemplateObject);
        if (settings.loggingSettings.alwaysLogArguments & (!logString.includes("{{args}}"))) {
            logString += ` ${ansi.magenta}parameters ${JSON.stringify(args, null, settings.loggingSettings.prettyLogs)}${ansi.none}`;
        }
        //util.errorLog ("D", JSON.stringify(args));
        if (settings.loggingSettings.alwaysLogHTML && Object.keys(html).length > 0 /* can't use html != {} because "{}" ALWAYS instantiates a NEW object. */) {
            logString += ` ${ansi.black}HTML objects referenced: ${JSON.stringify(html, null, settings.loggingSettings.prettyLogs)}${ansi.none}`;
        }
        //util.errorLog ("C", JSON.stringify(args));
        logline = await util.applyTemplate({
            key,
            args: argsConvertedForDisplay, //for template, let {{args}} mean {{args[0]}} if there's only one argument
            ansi,
            lineNumber: logCount,
            html
        }, logString);

        /*thisIndentType = outputTemplates[thisType].indent || (originalMethod.outputTemplates && originalMethod.outputTemplates.indent) ;
        thisIndent= typeof thisIndentType == "function" ? thisIndentType() : thisIndentType;
          */


        let thisIndentType = outputTemplates[thisType].indent || (originalMethod.outputTemplates && originalMethod.outputTemplates.indent) || (outputTemplates[thisType][key] && outputTemplates[thisType][key].indent);

        let thisIndent = (typeof thisIndentType == "function" ? thisIndentType() : thisIndentType)
        if (thisIndent) {

            util.log(logline + (settings.loggingSettings.alwaysLogFunctionName ? " [" + ansi.dimgray + thisType + "." + key + ansi.none + "]" : "") + (settings.loggingSettings.alwaysLogStackTrace ? " [[" + ansi.dimgray + util.caller() + ansi.none + "]]" : ""));
            indents++;
        }


        //util.errorLog ("A", JSON.stringify(args));
        util.errorLog(`781 about to run ${thisType}.${key} with args`, JSON.stringify(args));
let caught;
        try {
            util.errorLog(`919 running ${thisType}.${key}`);
            var result = await originalMethod.apply(this, args);
            util.errorLog(`920 ran ${thisType}.${key}`);
        }

        catch (e) {caught=true;
            let thisLog = e.stack;
            if (outputTemplates[thisType].indent || originalMethod.outputTemplates && originalMethod.outputTemplates.indent || (outputTemplates[thisType][key] && outputTemplates[thisType][key].indent)) {
                indents--;
            }

            // Determine the correct catch template
            let catchTemplateObject = originalMethod.outputTemplates && originalMethod.outputTemplates.catch ?
                originalMethod.outputTemplates.catch :
                (outputTemplates[thisType][key] && outputTemplates[thisType][key].catch) ?
                    outputTemplates[thisType][key].catch :
                    outputTemplates[thisType].catch;

            util.log(await util.applyTemplate({
                key,
                args: argsConvertedForDisplay,
                ansi,
                e,
                lineNumber: logCount,
                result,
                resultAsTag: (result instanceof WebElement ? util.formatTag(await util.prettyPrintWebElement(result, settings.loggingSettings.HTMLAttributesToLog, true), ["name", "type", "style", "class", "id"], "{{ansi.green}}") : "<not a web element>"),
                logline,
                html
            }, (typeof catchTemplateObject == "function") ?
                (await catchTemplateObject(key, argsConvertedForDisplay)) :
                catchTemplateObject
            ) + (settings.loggingSettings.alwaysLogFunctionName ? ansi.dimgray + " [" + thisType + "." + key + "]" : "") + (settings.loggingSettings.alwaysLogStackTrace ? " [[" + util.caller() + "]]" : "") + ansi.none);
            console.log("ERROR STACK",thisLog);
            throw (e);

            // result = null;

        }
        finally {

            if (thisIndent) {
                indents--;
                thisClose = "┗━ ";

            } else { thisClose = ""; }


            // Determine the correct after template
            let afterTemplateObject = originalMethod.outputTemplates && originalMethod.outputTemplates.after ?
                originalMethod.outputTemplates.after :
                (outputTemplates[thisType][key] && outputTemplates[thisType][key].after) ?
                    outputTemplates[thisType][key].after :
                    outputTemplates[thisType].after;
if(!caught){
            util.log(thisClose + (thisIndent ? ansi.italicgreen : "") + await util.applyTemplate({
                key,
                args: argsConvertedForDisplay,
                ansi,
                lineNumber: logCount,
                result,
                resultAsTag: (result instanceof WebElement ? util.formatTag(await util.prettyPrintWebElement(result, settings.loggingSettings.HTMLAttributesToLog, true), ["name", "type", "style", "class", "id"], "{{ansi.green}}") : "<not a web element>"),
                logline,
                html
            },
                (typeof afterTemplateObject == "function") ?
                    (await afterTemplateObject(key, argsConvertedForDisplay)) :
                    afterTemplateObject
            ) + (settings.loggingSettings.alwaysLogFunctionName ? ansi.dimgray + " [" + thisType + "." + key + "]" : "") + (settings.loggingSettings.alwaysLogStackTrace ? " [[" + util.caller() + "]]" : "") + ansi.none);}
            return result;
        }
    };
    //settings.loggingSettings.verboseDebugging = false;
    return descriptor;
}



// Apply decorators for logging to all functions in uiFuncs

const uiFuncs = {
    uiDo,
    uiGet,
    uiScript
}

for (let key in uiFuncs) {

    Object.getOwnPropertyNames(uiFuncs[key]).forEach(method => {
        let descriptor = Object.getOwnPropertyDescriptor(uiFuncs[key], method);
        Object.defineProperty(uiFuncs[key], method, logUi(uiFuncs[key], method, descriptor, key));
    });

}



/* ansi = new Proxy(ansi, {
    
    get(target, prop) {
        var result;
        theBegin = `c ${prop} pr ${target["prev"]} cu ${target["curr"]} `;
        if (prop != 'prev' && prop != 'curr') {
            target["prev"]=target["curr"];
            target["curr"]=prop;
            result = target[prop];
        } else if (prop == 'prev') {
            target["curr"]=target["prev"];
            result = target[target[prop]];
        }
    
      
        return result+theBegin+`2 pr2 ${target["prev"]} cu2 ${target["curr"]} `;
    }
}); 
// proxy to update curr and prev colors when ansi is referenced.

// this was an attempt to make an {{ansi.prev}} string token to recall previous color. 
  
// {{ansi.prev}} might technically be doable, but because the templating functions run through the entire string, attempts to later wrap the string and use ansi.gray+"|"+ansi.prev to wrap the color don't work, because the ansi codes all the way to the end of the string have already been evaluated and ansi.prev is set based on that, not based on where you're breaking the string. 

// In plain English: didn't work because the ansi codes are evaluated when the string is built, not when it's displayed. 

// Possible to do but not worth it right now. 
// Archived for future reference. 
*/


util.log = function (...args) {
    indents = Math.max(indents, 0);
    logCount = logCount + 1;
    let logtext = args.join(" ");
    let whitespace = " " + ((settings.loggingSettings.indentDepth > 0 ? ("┃") : "") + ' '.repeat(settings.loggingSettings.indentDepth)).repeat(indents);
    let theWrapped = util.formatTextWrap(logtext, settings.loggingSettings.terminalwidth - indents, whitespace);

    console.log(`${settings.loggingSettings.useLineNumbers ? "»" + (String(logCount).padStart(4, '0')) + "» " : ""}${theWrapped}`);



}

module.exports = {
    uiGet,
    uiDo,
    uiScript,
    ansi,
    data,
    util
};