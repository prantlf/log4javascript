<?
$cookieName = "log4javascriptsessionid";

// Check if the session id was sent in the posted data
$sessionId = $_POST[$cookieName];
if (!$sessionId) {
	// Check if the session id was sent in a cookie
	$sessionId = $_COOKIE[$cookieName];
	if (!$sessionId) {
		// Create a new session id
		$sessionId = uniqid(rand(), true);
		// Set a cookie on the response
		setCookie($cookieName, $sessionId);
	}
}
// Add the session id to the response text
echo($sessionId);

$fileName = "sessions/" . $sessionId . ".txt";
$fp = fopen($fileName, "a");

$logMessage = date("r", $_POST["timestamp"]) . " " . $_POST["level"] . " - " . $_POST["message"] . "\r\n";

fputs($fp, $logMessage);

$fp = fopen("debug.log", "a");
fputs($fp, file_get_contents("php://input") . "\r\n");
?>