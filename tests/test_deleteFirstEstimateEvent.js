'use strict';

/* Package Name: mekphrame
 *
 * Copyright © 2024 Michael E. Kupietz <software@kupietz.com> http://www.kupietz.com
 *
 * All Rights Reserved. See LICENSE for details.
 */

// This sample test is specific to the particular website this framework was originally conceived of to test. You will need to modify the selectors and actions to work with your own website. 

// PURPOSE: Site-specific test: script will delete the first event in the list of events on the mainmenu
// and then go back to the mainmenu

const deleteLimit = 0; //number of events to delete, set to 0 to delete all events
const mekphrame = require("../mekphrame.js");
/////////////////// TESTS
(async function firstTest() {

    {
        const driver = await mekphrame.util.tInitialize();

        mekphrame.util.errorLog("897 ABOUT TO LOGIN");
        await mekphrame.uiScript.login();
        mekphrame.util.errorLog("899 LOGGED IN");
        let eventElements = await driver.findElements(mekphrame.data.uiElements.dashBoardEstimateEventLink);
        let totalCount = eventElements.length;
        let toDeleteCount = deleteLimit == 0 ? totalCount : deleteLimit;
        var elementExists = true;
        while (elementExists) {
            await mekphrame.uiDo.waitUntilPageIsReady();
            let activeTab = await mekphrame.uiGet.currentActiveHomepageTabName();
            mekphrame.util.log("Making sure we got to events tab");
            activeTab = await mekphrame.uiScript.goToHomepageTab({ tab: "My events" });
            if (activeTab != "My events") {
                throw new Error('Failed to go to My Events tab! On: ' + activeTab);
            }
            let eventElements = await driver.findElements(mekphrame.data.uiElements.dashBoardEstimateEventLink);
            let count = eventElements.length;
            if (count > 0 && (count > deleteLimit || deleteLimit == 0)) {
                /* try{ */
                mekphrame.util.log(`${mekphrame.ansi.red}~~~Deleting event ${count}~~~${mekphrame.ansi.none}`);
                await mekphrame.uiDo.click({ by: mekphrame.data.uiElements.firstDashBoardEstimateEventLink });
                let dropdownElement = await mekphrame.uiScript.clickAndGetPopup({ buttonSelector: mekphrame.data.uiElements.eventDetailDotDotDotButton, popupSelector: mekphrame.data.uiElements.eventDetailDotDotDotPopup });
                //await mekphrame.uiScript.goToMainMenu();
                await mekphrame.uiDo.chooseOptionFromOpenDropdown({ dropdownElement, value: "Move event to Trash" });
                await mekphrame.uiDo.click({ by: mekphrame.data.uiElements.confirmTrashEventButton });
                /* } catch (error) {
                    // If the element does not exist, the script will throw an error
                    // We catch this error and set elementExists to false to stop the loop
                    elementExists = false;
                     mekphrame.util.log(`${mekphrame.ansi.red}Test 1 terminated. Starting event count was ${totalCount}. Number to be deleted was ${toDeleteCount}. Current event count remaining is ${count}. Last error was ${error.name}: ${error.message}${mekphrame.ansi.none}`);
                }*/
            }
            else { elementExists = false; mekphrame.util.log(`${mekphrame.ansi.boldbrightblue}No more events to delete.Starting event count was ${totalCount}. Number to be deleted was ${toDeleteCount}. Current event count remaining is ${count}. Ending test.${mekphrame.ansi.none}`) }
        }

        await mekphrame.util.finish();
    }

}())
