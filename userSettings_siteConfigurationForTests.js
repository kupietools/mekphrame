'use strict';

/* Package Name: mekphrame
 *
 * Copyright © 2024 Michael E. Kupietz <software@kupietz.com> http://www.kupietz.com
 *
 * All Rights Reserved. See LICENSE for details.
 */

// PURPOSE: This file is used to set up the options and data structures specific to the site being tested.

const {
    By
} = require('selenium-webdriver');



module.exports = {
    data: {

        //// USER-SETTABLE URL OF SITE TO BE TESTED: ////
        
        testUrl: "https://yoursite.testurl.com",

        //// USER-SETTABLE OPTIONS FOR LOGGING ////

        /* Logging settings are used to control the verbosity and formatting of the logging output. They are do not need to be modified from the default settings unless you want to change the way the logs are displayed. They can be left as-is if modifying this framework for your own use on other sites. */

        //// USER-SETTABLE FORM DATA TO BE ENTERED IN TESTS - site-specific ////

        // Specify a text field, a popup entry to select, and a date range for a new event to be created in the tests.
        
        /* Currently, the formFields definition is specific to the site this framework was originally conceive as a test suite for. You will need to modify the form fields to work with your own website. In the future, this framework will be adapted to be more general-purpose and perhaps to handle multiple sites without having to make duplicate copies of the framework. */
        
        formFields: {
            newEventInfo: {
                text: {
                    name: "testEvent_" + Date.now() //"testEvent_" + Date.now()
                },
                popup: { //below will be treated as substrings, first popup entry that matches will be used
                    region: "Northwest",
                    city: "Seattle",
                    event: "XYZ Convention", //AICE,
                    organizer: "John Smith",
                    manager: "Mike"
                },
                dateRange: {
                    dates: {
                        text: {
                            dateStart: "5/24/24",
                            dateEnd: "6/23/24"
                        }
                    }
                }
            }
        },
        // END USER FORM DATA FOR TESTS

        //// USER-SETTABLE ELEMENTS FOR USE IN TESTS - site-specific ////

        /* Currently, the uiElements definition is specific to the site this  framework was originally conceived as a test suite for. You will need   to modify the selectors and actions to work with your own website. In the future, this framework will be adapted to be more general-purpose and perhaps to handle multiple sites without having to make duplicate copies of the framework. */

        uiElements: {
            // here we simply assign convenient names we can use throughout the tests to refer to HTML elements. Use the By object to define the selector type and value.
            loginBox: By.id('usernameID'),
            passBox: By.id('passFieldID'),
            loginButton: By.id('loginBtnID'),
            dateRangePicker: By.css('div.datemodal'),
            fieldPopupMenu: By.css("ul.popup-menu[style*='display: block']"),
            newEventModal: By.css('body > div.event.modal.in'),
            newEventButton: By.css('#event > div > div > div.btn-group.pull-right.btn-group-opacity > div:nth-child(3) > a.btn.button-right'),
            primaryButton: By.css('a.button.button-primary:not(.disabled)'),
            mainmenuLink: By.css('div.button-group.top-menu > span > a'),
            homepage: By.css('html#mainmenu'),
            firstDashBoardEstimateEventLink: By.css('#events > div:nth-child(1) > div > div:nth-child(2) > div > div:nth-child(1) > div.board.visible-content > div:nth-child(1) > a'),
            dashBoardEstimateEventLink: By.css('#events > div:nth-child(1) > div > div:nth-child(2) > div > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(1) > div.flex.kanban-item-content > div > a'),
            eventDetailDotDotDotButton: By.css('#boxcontent > div.article > div.flexbox > div.left > div:nth-child(1) > div > div > div.collapse-show > div[id^="open"] > div > a'),
            eventDetailDotDotDotPopup: By.css('#optButton'),
            confirmTrashEventButton: By.css('div.screen-modal a.button.button-disabled.btn-danger.cancel > div')
        }
        // END USER ELEMENTS FOR TESTS
    }
}