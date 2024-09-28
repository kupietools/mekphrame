'use strict';

/* Package Name: mekphrame
 *
 * Copyright © 2024 Michael E. Kupietz <software@kupietz.com> http://www.kupietz.com
 *
 * All Rights Reserved. See LICENSE for details.
 */


// This sample test is specific to the particular website this framework was originally conceived of to test. You will need to modify the selectors and actions to work with your own website.

// PURPOSE: Site-specific test: This script will create a new event with the information in the formFields.newEventInfo object
// and then go back to the mainmenu

const mekphrame = require ("../mekphrame.js");
/////////////////// TESTS
(async function firstTest() {

    {
        await mekphrame.util.tInitialize();

        mekphrame.util.errorLog("897 ABOUT TO LOGIN");
        await mekphrame.uiScript.login();
        mekphrame.util.errorLog("899 LOGGED IN");
        let activeTab = await mekphrame.uiGet.currentActiveHomepageTabName();
        mekphrame.util.log("Making sure we got to events tab");
        activeTab = await mekphrame.uiScript.goToHomepageTab({ tab: "My events" });
        if (activeTab != "My events") {
            throw new Error('Failed to go to My Events tab! On: ' + activeTab);
        }
        await mekphrame.uiScript.createNewEvent({ fields: mekphrame.data.formFields.newEventInfo });
        await mekphrame.uiScript.goToMainMenu();


        /*   
          let message = await driver.findElement(By.id('message'));
          let value = await message.getText();
          assert.equal("Received!", value); */
    }

    {
        console.log(" ");
        console.log("--------------ending session", mekphrame.data.session, " at ", Date(), "--------------");
        console.log(" ");
        console.log(" ");
        console.log(" ");
        // await driver.quit();
    }
}())
