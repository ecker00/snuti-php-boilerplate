<?php
require_once('../vendor/autoload.php');
require_once('Snuti-utilities.php');
require_once('Snuti-handlebars.php');
require_once('Snuti-dbSetup.php');
require_once('api.php');

// Dependencies:
// ezSQL - https://github.com/ezSQL/ezSQL (MySQL wrapper)
// lightncandy - https://github.com/zordius/lightncandy (Handlebars rendering)

class App {
	public $db;
	public $hbs;
	public $version; // This version number is incremented with every Grunt compile, used to invalidate cached URLs ?v=$version.
	public $page = '';
	public $pages = [];
	
  function __construct() {
		$this->version = (file_exists('../_tmp/version.txt'))? (int) fgets(fopen('../_tmp/version.txt', 'r')) : 1;
		
		// Setup database
		// –––––––––––––––––––––––––––––––––––––––––––––––––– //
		// This section is optional if your ather want to build the database structure manually
		$dbStructure = [
			'exampleDB' => [ # Database name
				'exampleTable' => [ # Table name
					'exampleID' => 'exampleID INT AUTO_INCREMENT', # Primary key first
					'number'    => 'number INT DEFAULT 0',
				],
			],
		];
		$dbHost = getenv('DB_HOST')?: 'localhost';
		$dbName = getenv('DB_NAME')?: 'exampleDB';
		$dbUser = getenv('DB_USER')?: 'root';
		$dbPass = getenv('DB_PASS')?: '';
		$testDB = new dbSetup($dbUser, $dbPass, $dbStructure, $dbHost);
		$testDB->hashFile = '../_tmp/databaseHash.txt';
		$testDB->checkStructure(); // Initalises DB as described above
		$testDB->conn->close();
		
		// After DB is setup, re-connect
		$this->db = new ezSQL_mysqli($dbUser, $dbPass, $dbName, $dbHost);
		
		// Setup the API
		$this->api = new API($this->db);
		if ($this->api->isAjax) return; // Don't render the rest, if it's an Ajax call
		
		// Pages
		// –––––––––––––––––––––––––––––––––––––––––––––––––– //
  	$this->pages = [ // Each key is a url target
			'home' => ['name'=>'home', 'title'=>'Your project', 'hbs'=>'home-main', 'api'=>['example'=>[]]],
		];
		$this->page = $this->pages['home']; // Default page
		
		// Show page
		// –––––––––––––––––––––––––––––––––––––––––––––––––– //
		$this->routing();
		$this->renderPage();
  }
  
	// Routing
	// –––––––––––––––––––––––––––––––––––––––––––––––––– //
  private function routing() {
		foreach ($_GET as $key => $_) { // Find matching page
			if ($this->pages[$key]) {
				$this->page = $this->pages[$key];
				break;
			}
		}
  }
  
	// Rendering
	// –––––––––––––––––––––––––––––––––––––––––––––––––– //
  private function renderPage() {
  	$defaultData = [ // Give Handlebars access to these variables by default
			'postResult' => $this->api->postResult,
			'currentPage' => $this->page,
			'version' => $this->version,
			'year' => date('Y'),
		];
		$this->hbs = new HBS($defaultData);
		$this->hbs->compileDir = './../_hbs/';
		$data = $this->api->query($this->page['api']); // Get required page data
		echo $this->hbs->render('template', $data);  // Render page
  }
  
}

// Run
$app = new App();
