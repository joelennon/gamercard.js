<?php
$username = $_GET['u']; //Xbox Live username
$doc = new DOMDocument();
$url = "http://gamercard.xbox.com/en-US/$username.card";
$gc = array();

$doc->loadHTMLFile($url);
$xpath = new DOMXpath($doc);

$gamertag = $doc->getElementById("Gamertag");
$gc['gamertag'] = $gamertag->nodeValue;
$gc['url'] = $gamertag->getAttribute('href');

//Get sex (Nice!) and Xbox Live membership level
$mainDiv = $xpath->query("/html/body/div");
if(!is_null($mainDiv)) {
	foreach($mainDiv as $div) {
		if(preg_match('/Gold/', $div->getAttribute("class")) > 0) $gc['membership'] = 'gold';
		else $gc['membership'] = 'silver';
		
		if(preg_match('/Male/', $div->getAttribute("class")) > 0) $gc['sex'] = 'male';
		else $gc['sex'] = 'female';
	}
}

$gc['gamerpic'] = $doc->getElementById("Gamerpic")->getAttribute("src");

//Get reputation div children and loop
$gc['reputation'] = 0.0;
$repContainer = $xpath->query("//*[contains(concat(' ',normalize-space(@class),' '),' Star ')]");
if(!is_null($repContainer)) {
	foreach($repContainer as $rep) {
		if(preg_match('/Full/', $rep->getAttribute('class')) > 0) $gc['reputation'] += 1.0;
		else if(preg_match('/Half/', $rep->getAttribute('class')) > 0) $gc['reputation'] += 0.5;
	}
}

$gc['gamerscore'] = $doc->getElementById("Gamerscore")->nodeValue;
$gc['location'] = $doc->getElementById("Location")->nodeValue;
$gc['motto'] = $doc->getElementById("Motto")->nodeValue;
$gc['name'] = $doc->getElementById("Name")->nodeValue;
$gc['bio'] = $doc->getElementById("Bio")->nodeValue;

//Get games played
$gc['games'] = array();
$ol = $doc->getElementById("PlayedGames");
if(preg_match('/NoGames/', $ol->getAttribute("class")) < 1) {
	for($i=0,$len=$ol->childNodes->length;$i<$len;$i++) {
		$game = array();
		$item = $ol->childNodes->item($i);
		if($item->nodeName == "li") {
			//Check if game is complete (100%) or not
			if(preg_match('/Complete/', $item->getAttribute('class')) < 1)
				$game['complete'] = true;
			else $game['complete'] = false;
			
			//Get game comparison link
			$link = $item->childNodes->item(1);
			$game['link'] = $link->getAttribute("href");
			
			//Get game image URL, title, current gamerscore,
			//total gamerscore, current achievements, total
			//achievements and percentage complete
			$linkNodes = $link->childNodes;
			$game['image'] = $linkNodes->item(1)->getAttribute('src');
			$game['title'] = $linkNodes->item(2)->nodeValue;
			$game['currentGamerscore'] = (int)$linkNodes->item(6)->nodeValue;
			$game['totalGamerscore'] = (int)$linkNodes->item(8)->nodeValue;
			$game['currentAchievements'] = (int)$linkNodes->item(10)->nodeValue;
			$game['totalAchievements'] = (int)$linkNodes->item(12)->nodeValue;
			$game['percentComplete'] = (int)$linkNodes->item(14)->nodeValue;
			
			//Get last played date
			date_default_timezone_set('Europe/Dublin');
			$lastPlayed = explode('/', $linkNodes->item(4)->nodeValue);
			$timestamp = mktime(0, 0, 0, $lastPlayed[0], $lastPlayed[1], $lastPlayed[2]);
			$game['lastPlayed'] = $timestamp;
			
			//Add game to array
			$gc['games'][] = $game;
		}
	}
}

echo json_encode($gc);
?>