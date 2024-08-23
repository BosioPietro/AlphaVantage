<?php
    header('Content-Type: application/json; charset=utf-8');
    require("MySQLi.php");
    $mod = $_GET["mod"];
    $tabella = $_GET["tabella"];
    $connection = openConnection("alphavantage_askhowever");
    $data = "";
    if($mod == "GET")
    {
        $sql = "SELECT * FROM $tabella";
        if(isset($_GET["where"]))
        {
            $where = $_GET["where"];
            $sql = "$sql WHERE name = '$where'";
        }
        $data = eseguiQuery($connection, $sql);
    }
    else
    {
        $data = $_GET["data"];
        if(isset($data))
        {
            $chiave = array_keys($data)[0];
            $sql = "INSERT INTO $tabella (name, data) VALUES ('$chiave','". json_encode($data[$chiave]) ."')";
            $sql = $sql ." ON DUPLICATE KEY UPDATE data = '". json_encode($data[$chiave]) ."'";
            $data = eseguiQuery($connection, $sql);
            $data = $sql;
        }  
    }
    
    http_response_code(200);
    echo(json_encode($data));
?>