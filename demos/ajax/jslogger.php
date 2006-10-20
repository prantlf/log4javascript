<?php
// Try and extract a session id from the post data - this file has to
// deal with all possible layouts

$postData = file_get_contents("php://input");
$sessionId = "NOSESSION";
$level = "NOLEVEL";
$message = "NOMESSAGE";
$timestamp = "NOTIMESTAMP";
if ($_POST["sessionid"]) {
	// HttpPostDataLayout
	$sessionId = $_POST["sessionid"];
	$level = $_POST["level"];
	$message = $_POST["message"];
	$timestamp = $_POST["timestamp"];
} else {
	// Try JSON first
	require("json.php");
	$json = new Services_JSON();
	$phpobj = $json->decode($postData);
	if ($phpobj[0]->timestamp) {
		$timestamp = $phpobj[0]->timestamp;
		$level = $phpobj[0]->level;
		$message =  $phpobj[0]->message;
		$sessionId = $phpobj[0]->sessionid;
	} else if (ereg("<log4javascript:customfield name=\"sessionid\"><!\[CDATA\[(session_[a-zA-Z0-9_]+)\]\]></log4javascript:customfield>", $postData, $matches)) {
		$sessionId = $matches[1];
		ereg("<log4javascript:message><!\[CDATA\[(.*)\]\]></log4javascript:message>", $postData, $matches);
		$message = $matches[1];
		ereg("<log4javascript:event logger=\"demo\" timestamp=\"([0-9]+)\" level=\"[A-Z]+\">", $postData, $matches);
		$timestamp = 1 * $matches[1];
		$level = $matches[2];
	}
}

$fileName = $sessionId . "log";
$fileName = "sessions/" . $sessionId . ".txt";
$fp = fopen($fileName, "a");

$logMessage = date("r", $timestamp) . " " . $level . " - " . $message . "\r\n" . "Posted data:\r\n" . $postData . "\r\n\r\n";

fputs($fp, $logMessage);

$fp = fopen("debug.log", "a");
fputs($fp, $postData . "\r\n");
?>