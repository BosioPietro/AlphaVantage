<?php
	$current_dir = dirname(__FILE__);
	require($current_dir . '/../../environment/database.php');
	function openConnection($db_name) {		
		mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

		try
		{
			$connection = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, $db_name);
			$connection->set_charset("utf8");
			return $connection;
		}
		catch(exception $ex)
		{
			http_response_code(503);
			die("Errore connesione database. " . $ex->getMessage());
		}
	}

	function eseguiQuery($connection, $sql) {
		try
		{
			$rs = $connection->query($sql);
			if(!is_bool($rs))
			{
				$data = $rs->fetch_all(MYSQLI_ASSOC);
			}
			else
			{
				$data = $rs;
			}
			return $data;
		}
		catch(exception $ex)
		{
			$connection->close();
			http_response_code(500);
			die("Errore esecuzione query. " . $ex->getMessage());
		}
	}
?>