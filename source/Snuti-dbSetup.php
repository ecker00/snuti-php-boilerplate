<?php

// MySQL Database quick create and alter
// –––––––––––––––––––––––––––––––––––––––––––––––––– //
// Automatically creates and alters databases, tables and columns

// Notes:
// - Nothing is automatically deleted, only created (Databases, tables, columns)
// - This system does not handle indexes (yet)

class dbSetup {
  public $conn;
  public $structure;
  public $hashFile = 'databaseHash.txt';
  function __construct($user, $password, $structure, $host) {
    if (!$structure || !count($structure)) { l('No structure specified'); return; }
    if (!$host) { l('No host specified'); return; }
    if (!$user) { l('No user specified'); return; }
    $this->structure = $structure;
    // Connect
    $this->conn = new mysqli($host, $user, $password);
    if ($this->conn->connect_error) {
      l("DB connection failed: ", $this->conn->connect_error);
      die;
    }
  }
  
  public function checkStructure() {
    $oldHash = (file_exists($this->hashFile))? file_get_contents($this->hashFile):'';
    $newHash = md5(serialize($this->structure));
    if ($oldHash == $newHash) return; // No structure change
    // Create and modify database
    foreach ($this->structure as $dbName => $tables) { // Setup databases
      $dbExsist = $this->query("SHOW databases LIKE '$dbName'");
      if (!$dbExsist) $this->query("CREATE database $dbName");
      $this->conn->select_db($dbName);
      foreach ($tables as $tableName => $columns) { // Setup tables
        $tableExsist = $this->query("SHOW tables LIKE '$tableName'");
        if (!$tableExsist)
          $this->query("CREATE table $tableName (".reset($columns)." PRIMARY KEY)"); # Create initially with first column only
        foreach ($columns as $colName => $column) { // Setup columns
          if ($colName == 'INDEX') continue;
          $columExsists = $this->query("SHOW COLUMNS FROM $tableName LIKE '$colName'");
          if (!$columExsists)
               $this->query("ALTER TABLE $tableName ADD $column");
          else $this->query("ALTER TABLE $tableName MODIFY $column");
        }
        // Todo: Implement indexe handling
        #if ($columns['INDEX']) { // Setup indexes
        #  $indexes = $this->query("SHOW INDEX FROM $tableName");
        #  #$indexes = $this->query("SELECT * FROM information_schema.statistics WHERE table_schema = '$dbName'");
        #  #l($indexes); // Debug: Why is this result blank? The query works in console.
        #  foreach ($columns['INDEX'] as $indexName => $index) {
        #    // This section is not finished: Drop matching indexes and re-create them
        #  }
        #}
      }
    }
    // Save new structure hash
    l('New database structure has been setup.');
    $hashFile = fopen($this->hashFile, "w") or die("Unable to open {$this->hashFile}");
    fwrite($hashFile, $newHash);
    fclose($hashFile);
  }
  
  public function query($sql) {
    $result = $this->conn->query($sql);
    if ($this->conn->error) {
      try {
        throw new Exception('MySQL error see log.');    
      } catch(Exception $e) {
        l($this->conn->error, $sql);
        echo '<div class="error">';
          echo $this->conn->error.'<br>';
          echo "<code>$sql</code>";
        echo '</div>';
        die;
      }
    }
    if ($result->fetch_all) {
      return $result->fetch_all(MYSQLI_ASSOC);
    } else {
      if (!$result->num_rows)
           return [];
      else return $result;
    }
  }
}
