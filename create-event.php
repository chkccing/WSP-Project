<?php
$host = "localhost";
$user = "";
$password = "";
$db = "";
$con = pg_connect ("host=$host dbname=$db user=$user password=$password") or die ("Could not connect to Server\n");

If(!$con) {
    echo "Error: Unable to open database\n";
} else {
    $eventPicture = $_POST["eventPicture"]
    $title = $_POST["title"]
    $category = $_POST["category"]
    $hashtag = $_POST["hashtag"]
    $start_date = $_POST["start_date"]
    $end_date = $_POST["end_date"]
    $cost = $_POST["cost"]
    $location = $_POST["location"]
    $Participants = $_POST["Participants"]
    $FAQ = $_POST["FAQ"]
    $is_age18 = $_POST["is_age18"]
    $is_private = $_POST["is_private"]
    $query = "INSERT INTO register (eventPicture, title, category, hashtag, start_date, end_date, cost, location, Participants, FAQ, is_age18, is_private) VALUES ($, $, $, $, $, $, $, $, $, $, $, $)";
    $result = pg_query($con, $query);
    header("Location: create-event.html");
}
pg_close($con);
?>