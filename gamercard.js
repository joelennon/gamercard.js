// License
// Copyright (c) 2011 Joe Lennon

// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the "Software"), to deal 
// in the Software without restriction, including without limitation the rights 
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is 
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in 
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
// THE SOFTWARE.

// gamercard.js
// http://github.com/joelennon/gamercard.js/
// Last Updated Mon 3 Oct 2011 @ 12:26 pm

// This script creates a global Gamercard object with a single method: fetch.
// The fetch method allows you to asynchronously retrieve an Xbox 360 Gamercard
// using either server-side or client-side scraping to parse the data from an
// HTML page.

// Create global Gamercard object if it doesn't already exist
var Gamercard;
if(!Gamercard) { Gamercard = {}; }

// Build functions in anonymous block to prevent the script
// from polluting the global namespace
(function() {	
	var xhrRequest = function(url, callbackFn) {
		var req, callbackFunction = callbackFn || function() { };
		if(window.XMLHttpRequest) { req = new XMLHttpRequest(); }
		else if(window.ActiveXObject) { req = new ActiveXObject('Microsoft.XMLHTTP'); }
		if(req) {
			req.onreadystatechange = function() {
				if(req.readyState == 4) callbackFunction(req.responseText);
			}
			req.open("GET", url, true);
			req.send();
		}
	};
	
	var buildIFrame = function(url, callbackFn) {
		var el = document.createElement('iframe');
		el.src = url; el.style.display = 'none';
		document.body.appendChild(el);
		el.onload = callbackFn || function() { };
		return el;
	};
	
	var scrapeDOM = function(d) {
		var resp = {};
		if(d.body.innerHTML != "ERROR") {
			var g = function(el) { return d.getElementById(el) };
			//Got this far, fetch was successful
			resp.success = true;
	
			//Get the gamertag and URL
			var gamertag = g("Gamertag");
			resp.gamertag = gamertag.innerHTML;
			resp.url = gamertag.href;
	
			//Get Xbox Live Membership level
			var container = d.body.children[0], containerClasses = container.className;
			if(containerClasses.match(/Gold/)) { resp.membership = "gold"; }
			else { resp.membership = "silver"; }
			//Get sex (Nice!)
			if(containerClasses.match(/Male/)) { resp.sex = "male"; }
			else { resp.sex = "female"; }

			//Get Gamerpic Image URL
			resp.gamerpic = g("Gamerpic").src;

			//Reputation (0 to 5 stars, half values allowed)
			resp.reputation = 0;
			var repContainer = container.children[2], rep = repContainer.children;
			for(var i=0,len=rep.length;i<len;i++) {
				if(rep[i].className.match(/Full/)) { resp.reputation += 1; }
				else if(rep[i].className.match(/Half/)) { resp.reputation += 0.5; }
			}
	
			//Gamerscore, location, motto, name and bio
			resp.gamerscore = g("Gamerscore").innerHTML;
			resp.location = g("Location").innerHTML;
			resp.motto = g("Motto").innerHTML;
			resp.name = g("Name").innerHTML;
			resp.bio = g("Bio").innerHTML;
	
			//Played Games
			resp.games = [];
			var pg = g("PlayedGames");
			if(!pg.className.match(/NoGames/)) {
				var list = pg.children;
				for(var i=0, len=list.length;i<len;i++) { 
					var item = {};
		
					//Check if game is complete (100%) or not
					if(list[i].className.match(/Complete/)) { item.complete = true; }
					else { item.complete = false; }
		
					//Get game comparison link
					var itemLink = list[i].children[0];
					item.link = itemLink.href;
		
					//Get game image URL, title, current gamerscore,
					//total gamerscore, current achievements, total
					//achievements and percentage complete
					var linkItems = itemLink.children;
					item.image = linkItems[0].src;
					item.title = linkItems[1].innerHTML;
					item.currentGamerscore = parseInt(linkItems[3].innerHTML, 10);
					item.totalGamerscore = parseInt(linkItems[4].innerHTML, 10);
					item.currentAchievements = parseInt(linkItems[5].innerHTML, 10);
					item.totalAchievements = parseInt(linkItems[6].innerHTML, 10);
					item.percentComplete = parseInt(linkItems[7].innerHTML, 10);
		
					//Get last played date
					var date = linkItems[2].innerHTML, p = date.split('/');
					var dateObj = new Date(p[2], p[0]-1, p[1]);
					item.lastPlayed = (dateObj.getTime() / 1000); //Get date as UNIX timestamp
		
					//Add game to array
					resp.games.push(item);
				}
			}
		} else {
			resp.success = false;
			resp.error_message = "A server error occurred.";
		}
		return resp;
	};
	
	Gamercard.jsonUrl = '../php/json.php';
	Gamercard.htmlUrl = '../php/html.php';
	
	Gamercard.fetch = function(gamertag, callbackFn, scrape, iframe) {
		var callbackFunction = callbackFn || function() { };
		if(!scrape) {
			//Server-side should do the scraping and return JSON object
			var url = this.jsonUrl+'?u='+gamertag;
			if(!iframe) {
				//Use Ajax
				xhrRequest(url, function(resp) {
					callbackFunction(resp);
				});
			} else {
				//Use iFrame
				var el = buildIFrame(url, function() {
					var resp = el.contentWindow.document.body.innerHTML;
					callbackFunction(resp);
					//Remove iframe (no longer needed)
					el.parentNode.removeChild(el);
				});
			}
		} else {
			//Client-side should do the scraping (Must use iFrame)
			var url = this.htmlUrl+'?u='+gamertag;
			var el = buildIFrame(url, function() {
				var resp = scrapeDOM(el.contentWindow.document);
				callbackFunction(resp);
				//Remove iframe (no longer needed)
				el.parentNode.removeChild(el);
			});
		}
	}
})();