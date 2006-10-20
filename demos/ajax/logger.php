<?
$fp = fopen("postdata.txt", "a");
fputs($fp, file_get_contents("php://input") . "\r\n");
?>