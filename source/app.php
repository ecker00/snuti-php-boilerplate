<?php
require_once('../vendor/autoload.php');
require_once('Snuti-utilities.php');
require_once('Snuti-handlebars.php');
require_once('Snuti-dbSetup.php');
require_once('api.php');

// Dependencies:
// ezSQL - https://github.com/ezSQL/ezSQL (MySQL wrapper)
// lightncandy - https://github.com/zordius/lightncandy (Handlebars rendering)
// Bulletproof – https://github.com/samayo/bulletproof (Image uploader)

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
		$dbStructure = [
			'palegg' => [ # Database name
				'meals' => [ # Table name
					'mealID'      => 'mealID INT AUTO_INCREMENT', # Primary key first
					'title'       => 'title VARCHAR(255) NOT NULL',
					'description' => 'description TEXT NOT NULL',
					'author'      => 'author VARCHAR(255) NOT NULL',
					'image'       => 'image VARCHAR(255) NOT NULL',
					'votes'       => 'votes INT DEFAULT 0',
					'time'        => 'time TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
				],
			],
		];
		$testDB = new dbSetup('localhost', 'root', '', $dbStructure);
		$testDB->hashFile = '../_tmp/databaseHash.txt';
		$testDB->checkStructure(); // Initalises DB as described above
		$testDB->conn->close();
		// After DB is setup, re-connect
		$this->db = new ezSQL_mysql('root','','palegg','localhost');
		
		$this->api = new API($this->db);
		if ($this->api->isAjax) return; // Don't render the rest, if it's an Ajax call
		// Pages
		// –––––––––––––––––––––––––––––––––––––––––––––––––– //
  	$this->pages = [ // Each key is a url target
			'home'   => ['name'=>'home',   'title'=>'Lunch love',        'hbs'=>'home-main',    'api'=>['getMeals'=>[]]],
			'create' => ['name'=>'create', 'title'=>'Create a new meal', 'hbs'=>'newMeal-main', 'api'=>[]],
			'about'  => ['name'=>'about',  'title'=>'About',             'hbs'=>'about-main',   'api'=>[]],
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

$app = new App();

// -------------------- Database -------------------- //
#$db = new mysqli('localhost', 'root', '');
#if ($db->connect_error) {
#  l("DB connection failed: ", $db->connect_error);
#  exit;
#}






// -------------------- Routing -------------------- //
// API request
#if (isset($_GET['api'])) {
#	require("api.php");
#	return;
#
#// Page request
#} else {
#    $page = 'home';
#}


// -------------------- Rendering -------------------- //

#$meals = $db->query("SELECT * FROM meals");
$meals = [
	['title'=>'Salmon burger', 'ingredients'=>[['name'=>'ham', 'color'=>'pink'],['name'=>'tomato', 'color'=>'lightblue']], 'description'=>'This is how you make it', 'author'=>'Bobzomator'],
	['title'=>'Jam toasty', 'ingredients'=>[['name'=>'bread', 'color'=>'salmon'],['name'=>'Strawberry jam', 'color'=>'lightblue'],['name'=>'Lettuce', 'color'=>'lightgreen']], 'description'=>'This is how you make it2', 'author'=>'Food Mage 98'],
	['title'=>'Jam toasty2', 'ingredients'=>[['name'=>'bread', 'color'=>'salmon'],['name'=>'Strawberry jam', 'color'=>'lightblue'],['name'=>'Lettuce', 'color'=>'lightgreen']], 'description'=>'This is how you make it2', 'author'=>'Food Mage 98'],
];
$colors = [
	'LightBlue',
	'DarkSeaGreen','SeaGreen','OliveDrab','Olive','LimeGreen','LightGreen',
	'OrangeRed','Orange','SandyBrown','DarkSalmon','Salmon','LightSalmon','PaleVioletRed','LightPink',
	'RosyBrown','Bisque','Beige','PeachPuff','Cornsilk','Khaki',
];
$data = [
	'showForm' => isset($_GET['new']),
	'version' => $version,
	'meals'  => $meals,
	'colors' => $colors,
];

#echo HBS::render('index', $data);
#echo 'Hello world';