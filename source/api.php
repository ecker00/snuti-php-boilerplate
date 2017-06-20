<?php

// A lightweight API class
// :: Queries are made with an input array with the API calls you want.
// :: The results are returned in the same structure as your input.
// :: Errors are returned as ['error'=>'msg']
    
class API {
  public $db;
  public $isAjax;
  public $postResult;
  
  function __construct($db) {
    $this->isAjax = (strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest')? true:false;
    $this->db = $db;
    
    // Handle onLoad API calls (for Ajax and HTML post)
    if ($_POST['api']) {
      if (is_array($_POST['api']))
           $this->postResult = $this->query($_POST['api']); // Regular call from JS
      else $this->postResult = $this->query([$_POST['api'] => '']); // Single post from HTML
      if ($this->isAjax) {
        header('Content-Type: application/json');
        echo json_encode($this->postResult);
        die;
      }
    }
  }
  
  public function query($queries) {
    $error = false;
    $results = [];
    foreach ($queries as $call => $input) {
      $method = 'method_'.$call;
      if (method_exists($this, $method)) // Find API function to call
           $results[$call] = $this->$method($input);
      else $results[$call] = ['error'=>'The method "'.$call.'" does not exsist.'];
      // Error handling
      // Note: All errors are expected to be arrays ['error'=>'msg'];
      if (is_array($results[$call]) && $results[$call]['error']) {
        l("API error: '$call'", $results[$call]['error']);
        $error = true;
        break; // Stop queries when encountering an error
      }
    }
    return $results;
  }
  
  // Example: This API call count the number of page loads
  private function method_example($input = []) {
    // Increment number by 1
    $result = $this->db->query("
      UPDATE exampleTable 
      SET number = number + 1
      WHERE exampleID = 1");
    // Get new number
    $number = (int) $this->db->get_var(
      "SELECT number
      FROM exampleTable
      WHERE exampleID = 1", ARRAY_A);
    return $number;
  }
}

