/*
 This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
 */

// Context Menu Search
chrome.contextMenus.create({
	title: "Search \"%s\" on Fangraphs",
	contexts: ["selection"],
	onclick: function searchText(info){
		var url = encodeURI(FANGRAPHS_SEARCH + info.selectionText);
		chrome.tabs.create({url: url});
	}
});

// Omnibox Search
// Derived from OmniWiki (github.com/hamczu/OmniWiki)

const FANGRAPHS_HOME = "http://www.fangraphs.com";
const FANGRAPHS_SEARCH = "http://www.fangraphs.com/players.aspx?lastname=";
var currentRequest = null;
var firstResult = FANGRAPHS_HOME;

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {

	if (currentRequest != null) {
		currentRequest.onreadystatechange = null;
		currentRequest.abort();
		currentRequest = null;
	}

	if(text.length > 0){
		currentRequest = suggests(text, function(names, urls) {
			var results = [];
			if (urls[0].indexOf("undefined") < 0) {
				firstResult = FANGRAPHS_HOME + urls[0];
			}
			if (names.length < 5) {
				num = names.length;
			} else {
				num = 5;
			}
			updateDefaultSuggestion(names[0]);
			for (var i = 1; i < num; i++) {
				results.push({
					content: FANGRAPHS_HOME + urls[i],
					description: names[i]
				});
			}
			suggest(results);
		});
	} else {
	}

});

function suggests(query, callback) {
	var req = new XMLHttpRequest();

	req.open("GET","http://www.fangraphs.com/quickplayersearch.aspx?name=" + query, true);
	req.onload = function(){
		if(this.status == 200){
			try{
				var page = document.createElement( 'html' );
				page.innerHTML = this.responseText;
				var minorMajor = page.getElementsByClassName('search');
				var names = [];
				var urls = [];
				var i;
				for(i = 0; i < minorMajor.length; i++){
					var links = minorMajor[i].getElementsByTagName('a');
					for (index = 0; index < links.length; index++){
						names.push(links[index].childNodes[0].textContent);
						urls.push(links[index].getAttribute('href'));
					}
				}
				callback(names, urls);

			}catch(e){
				this.onerror();
			}
		}else{
			this.onerror();
		}
	};
	req.onerror = function(){

	};
	req.send();
};

//On Enter press, goes to fangraphs site
chrome.omnibox.onInputEntered.addListener(function(text) {
	if (text == "settings") {
		chrome.tabs.update(null, {url: chrome.extension.getURL('settings.html')});
	} else {
		if (text.indexOf("http://") > -1) {
			chrome.tabs.update(null, {url: text});
		} else if (firstResult.indexOf("undefined") < 0) {
			chrome.tabs.update(null, {url: firstResult});
		} else {
			chrome.tabs.update(null, {url: FANGRAPHS_SEARCH + text});
		}
	}
});

function resetDefaultSuggestion() {
	chrome.omnibox.setDefaultSuggestion({
		description: ' '
	});
};

function updateDefaultSuggestion(text) {
	chrome.omnibox.setDefaultSuggestion({
		description: text
	});

};

chrome.omnibox.onInputStarted.addListener(function() {
	resetDefaultSuggestion();
});

chrome.omnibox.onInputCancelled.addListener(function() {
	resetDefaultSuggestion();
});
