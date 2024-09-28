# mekphrame

This is a framework for automating web browser interactions. It is designed to be a simple, yet powerful tool for automating web browser interactions. It is built on top of the Selenium WebDriver and Node.js.

## Current Status

This is currently regressed to an alpha release, as it is being adapted from a single-site testing framework to a more general and flexible one, to work more easily with a variety of different websites, and this work is still in progress. I can't release the completed, working single-site version publicly so as not to give away proprietary parts of it for free, but, can demonstrate it privately to interested parties, please contact me <software@kupietz.com> for a demo if interested.

Right now it provides two main tools: A set of functions for automating browser interactions, and an output templating system to automatically generate nicely formatted and indented logs clearly showing the control flow of the tests and the results of the interactions.

## Installation

To use the framework, you need to have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).

It is not the intent of this document to explain how to install Node.js or run Selenium WebDriver tests — please refer to the official documentation for that, and the layout and use of these files should be clear.

## Files

Most of these files are documented in code comments in the files themselves.

### mekphrame.js

This is the main file for the framework. It is used to initialize the framework and provide access to the framework's functions and data.

This file contains a the built-in functions for the framework. Right now this is the only reference for these functions.

### userSettings_globalOptions.js

This is the file that contains global settings for the framework. It is used to store the global settings for the framework.

### userSettings_siteConfigurationForTests.js

This is the file that contains the site-specific settings for the framework. It is used to supply a test URL, and to create variables referring to the elements on the page that are used in the tests.

### userSettings_userCustomFunctions.js

This is the file that contains user-created custom functions for the framework and custom logging function templates. The users can add their own functions to this file to be used in their tests, building on the functions provided by the framework.

### tests folder

This contans sample tests. Currently they're configured to run on the specifc site this was originally conceived for.

## License

All mekphrame code is Copyright © 2024 Michael E. Kupietz <software@kupietz.com> http://www.kupietz.com . All rights reserved. No permission is granted to distribute, sell, or otherwise use the code, in whole or in part, without express permission from the copyright holder. See LICENSE for details.