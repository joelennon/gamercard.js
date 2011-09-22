# gamerscore.js - JavaScript API for Xbox 360 gamercard data

If you are an Xbox 360 gamer, you will be familiar with the
gamercard system. Each gamer gets their own "gamertag" (username),
and each game they play has a series of achievements they can unlock.
Each achievement has a gamerscore value, with most retail games having
a total of 1000G and arcade games having a total of 200G. Many retail
games now have downloadable content (DLC) which can add up to 750G extra
to the total gamerscore attainable for that game.

Unfortunately, Microsoft don't publish a (public) API for Xbox 360
gamercard and achievement data, making it difficult to build applications
that use this information. Microsoft do publish a gamercard HTML widget
for every account, however, available through the following URL:

	http://gamercard.xbox.com/en-US/[Gamertag].card

where [Gamertag] is the username of the account you wish to display.

gamerscore.js uses a server-side proxy (PHP implementation included) to
retrieve this HTML from the Xbox website. It then allows you to scrape
the page, on either the client-side or server-side, and provides an
asynchronous, easy-to-use API for using the data in your JavaScript code.

## Usage

To use gamerscore.js, you will need a server-side proxy to get the card
HTML from the Xbox website. A PHP implementation is included - both a
version that simply gets the HTML and a version that actually scrapes
the page for data and returns a JSON representation of the gamercard. I
hope to add further implementations (Python, Ruby, Node.js, Java, etc.)
in the future.

To include the gamerscore.js library in your HTML page, you can use:

	<script src="gamercard.js"></script>
	
To use the library, use the following syntax:

	Gamercard.fetch(gamertag, callbackFunction, [scrape = false], [iframe = false]);
	
The arguments are as follows:

* gamertag - This is the gamertag or username you want to retrieve data for
* callbackFunction - This function will be executed when the data has been retrieved, with the data object passed as an argument to it
* scrape - This sets client-side scraping on/off (off by default)
* iframe - This sets using an iframe for retrieving data on/off (off by default). Note an iframe is always used when client-side scraping is on

## Simple example

	Gamercard.fetch('Somando', function(card) {
		var gamercard = JSON.parse(card);
		document.getElementById('gamerscore').innerHTML = gamercard.gamerscore;
	});
	
This example requires a modern browser (that supports the JSON object), or a JSON
library such as json2.js. It fetches my gamercard and updates an element on the page
with the ID "gamerscore" with my current gamerscore value.

A more detailed example is included in the demo folder.

## Return object

The return object contains many properties:

* success - true if the fetch was successful
* gamertag - The gamertag fetched
* url - Profile URL on xbox.com
* membership - gold or silver (Xbox Live membership level)
* sex - male or female
* gamerpic - Image URL for gamer picture
* reputation - number between 0 and 5 (half values allowed) for user's reputation on Xbox Live
* gamerscore - Total gamerscore achieved
* location - User location in their Xbox.com profile
* motto - User motto in their Xbox.com profile
* name - User name in their Xbox.com profile
* bio - User bio in their Xbox.com profile
* games - Array of game objects (last 5 games played)

Each game object in the games property above contains the following properties:

* complete - true if all achievements obtained
* link - URL to compare achievements on Xbox.com
* image - Game icon image URL
* title - Title of game
* currentGamerscore - Current gamerscore achieved
* totalGamerscore - Max gamerscore achievable
* currentAchievements - Current number of achievements obtained
* totalAchievements - Max number of achievements obtainable
* percentComplete - Percentage of achievements obtained
* lastPlayed - UNIX timestamp of the date the game was last played

## Status

This is a new project and is very much early version code. It has been tested on
Chrome 14 on Mac OS X Lion, with Apache 2.2 and PHP 5.3.6. Use this at your own risk.
If Microsoft change the code for the official Gamercard (or change the URL for that
matter) this script will not work, so it should be used for recreational purposes only.

## To Do

* Test on various browsers, OSes and PHP installations
* Tidy up code
* Optimize DOM code in PHP proxy
* Develop proxies for other server-side languages
* Get more data (find other sources of data)
* Style the demo example
* More elaborate demos
* Suggestions welcome

## Licence

Copyright (c) 2011 Joe Lennon

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.