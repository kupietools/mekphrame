'use strict';

/* Package Name: mekphrame
 *
 * Copyright © 2024 Michael E. Kupietz <software@kupietz.com> http://www.kupietz.com
 *
 * All Rights Reserved. See LICENSE for details.
 */

// PURPOSE: This file allows you to define extra functions to use in your tests.

//// initialization - do not modify ////

const {
    By,
    until,
    Builder,
    Browser,
    Key,
    WebElement
} = require('selenium-webdriver'); //note 'until' didn't work until I included it here - this is a command to import that module.



module.exports = function ({
    driver, uiDo, uiGet, uiScript, util, data, settings, ansi
}) {

//// end initialization block ////


//// Write User-defined functions for tests in this section ////

uiScript.goToMainMenu = async function () {

    
    let theClick = await uiDo.click({ by: data.uiElements.mainmenuLink });
   
    let theHomepage = await uiGet.element({ by: data.uiElements.homepage });
   
    return theClick;
}

uiGet.currentActiveHomepageTabName = async function () {

    util.errorLog("166 currentActiveHomepageTabName started");
    //returns text of currently selected tab in ul.nav
    let theText;
    /*try {*/

    var theNav = await driver.wait(
        until.elementLocated(By.css('ul.nav > li.active')),
        5000 // wait up to 5000 ms
    );

    theText = await theNav.getText();
    util.errorLog("190 got theText", theText);
    /*} catch (e) {
        util.errorLog ("168 failed to find active tab"); 
        util.errorLog (e.name);
        util.errorLog (e.message);
        util.errorLog (e.stack);
        throw ("Failed to find active tab");
    }*/
    util.errorLog("169 found active tab", (await util.getHTMLTargetOfWebElement(theNav)));
    util.errorLog("170 allAttributes", await util.prettyPrintWebElement(theNav));

    return theText;
}

uiScript.login = async function () {
    // Log in to the site
    util.errorLog("303 Starting login")
    let loginBox = await driver.findElement(By.id('username'));
    let passBox = await driver.findElement(By.id('password'));

    util.errorLog("307 loginBox", await util.getHTMLTargetOfWebElement(loginBox));
    util.errorLog("passBox", await util.getHTMLTargetOfWebElement(passBox));
    util.errorLog("submitButton: by", By.id('js-btn-login'));
    await loginBox.sendKeys('mekphrame-node@kupietz.com');
    await passBox.sendKeys('162534342516');
    util.errorLog("310 about to click submit button");
    await uiDo.click({ by: By.id('js-btn-login') });
    util.errorLog("312: element submitted by:", By.id('js-btn-login'));

}


uiScript.goToHomepageTab = async function ({ tab: theTab }) {
    //
    //tries to go to tab in ul.nav with label equal to theTab; returns text of currently selected tab
    let activeTab = await uiGet.currentActiveHomepageTabName();
    if (activeTab != theTab) {
        util.log("Navigating to " + theTab);
        let theNav = await driver.findElement(By.css('ul.nav > li'));
        await uiDo.click({ by: By.linkText(theTab), context: theNav });  //finds in contained a, just uses the li as context
        console.log("Navigated to " + theTab);
        return await theNav.getText();
    } else {
        util.log("Already on " + theTab + ", nothing to do.");
        return theTab;
    }
}


uiScript.createNewEvent = async function ({ fields }) { //creates a new event with the fields specified in the fields object
    //  let theNav = await driver.findElement(newEventButton);
    util.errorLog("***********Starting createNewEvent");
    let theEventModal = await uiScript.clickAndGetPopup({ buttonSelector: data.uiElements.newEventButton, popupSelector: data.uiElements.newEventModal });
    util.errorLog("***********GOT MODAL");

    util.errorLog("TheEventModal is", util.getHTMLTargetOfWebElement(theEventModal));
    //   await theNav.click(); // not doing await uiDo.click(theNav) because the logging occurs out of order due to async weirdness, and logging createNewEvent already gives enough information, don't need the click itself in this case. 
    if (fields) {
        await uiScript.fillFormFields({ fields, context: theEventModal });
    }
}



//// Write custom user function logging templates in this section ////

/* These should be in form uiXxx.functionName.outputTemplates = {before: , after: }

These are used to customize the logging output for each function. The before template is used at the beginning of the function, and the after template is used at the end. You can only define new outputTemplates here for functions defined above. */

uiScript.goToHomepageTab.outputTemplatesx = {

    //Was thiis intentionally disabled by adding an 'x' to the end, or is it a typo? See if this is needed. 

    before: `🟢 {{ansi.boldbrightblue}}Begin routine {{key}}{{ansi.none}} to go to tab {{ansi.yellow}}"{{args.tab}}"{{ansi.none}}`,
    after: /*' '.repeat(settings.loggingSettings.indentDepth) + */`🏁 Ended routine {{key}}, went to tab {{ansi.yellow}}"{{args.tab}}"{{ansi.none}}`
};


uiScript.createNewEvent.outputTemplates = {
    before: `🟢 {{ansi.boldbrightblue}}Creating new event{{ansi.regular}} with fields {{ansi.yellow}}{{args}}{{ansi.none}}`,
    after: `🏁 {{ansi.green}}Done creating new event{{ansi.none}}`
};


// end of custom user function loggiing templates

//// Don't edit anything below this line ////

} 