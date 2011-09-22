<?php
$username = $_GET['u']; //Xbox Live username
$url = "http://gamercard.xbox.com/en-US/$username.card";

$html = file_get_contents($url);

if(empty($html)) print "ERROR";
else print $html;
?>