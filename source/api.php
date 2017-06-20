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
    
    // Sessions data
    session_start();
    if (!$_SESSION["voted"]) $_SESSION["voted"] = [];
    
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
  
  private function method_voteMeal($input = []) {
    $mealID = (int) $input['mealID'];
    if (!$mealID) return ['error'=>'Not a valid mealID'];
    $voteIndex = array_search($mealID, $_SESSION["voted"]);
    $voteValue = ($voteIndex === false)? '+ 1':'- 1';
    $result = $this->db->query("
      UPDATE meals 
      SET votes = votes $voteValue
      WHERE mealID = $mealID");
    if (!$result) return ['error'=>"Found no meal with ID $mealID"];
    if ($voteIndex === false) {
      array_push($_SESSION["voted"], $mealID); // Remember that user has voted
    } else {
      unset($_SESSION["voted"][$voteIndex]); // Remove vote
      $_SESSION["voted"] = array_values($_SESSION["voted"]); // Re-index
    }
    return $result;
  }
  
  private function method_getMeal($input = []) {
    $mealID = (int) $input['mealID'];
    if (!$mealID) return ['error'=>'Not a valid mealID'];
    $meal = $this->db->get_row("SELECT * FROM meals WHERE mealID = $mealID", ARRAY_A);
    if (!$meal) return ['error'=>"Found no meal with ID $mealID"];
    $meal['voted'] = (in_array($mealID, $_SESSION["voted"]))? true:false;
    return $meal;
  }
  
  private function method_getMeals($input = []) {
    $offset = (int) $input['offset'];
    $maxVotes = (int) $this->db->get_var("SELECT MAX(votes) FROM meals");
    $meals = $this->db->get_results("
      SELECT SQL_CALC_FOUND_ROWS *
      FROM meals
      ORDER BY GREATEST(
        votes/$maxVotes,
        1 - (TIMESTAMPDIFF(DAY, time, now()) / 180)
      ) DESC
      LIMIT 20
      OFFSET $offset", ARRAY_A);
    $total = (int) $this->db->get_var("SELECT FOUND_ROWS()");
    $isMore = ($offset + count($meals) < $total)? true:false;
    foreach ($meals as $m => $meal)
      $meals[$m]['voted'] = (in_array($meal['mealID'], $_SESSION["voted"]))? true:false;
    return [
      'items' => $meals,
      'total' => $total,
      'next' => $isMore,
    ];
  }
  
  private function method_newMeal($input) {
    $title       = $this->db->escape(trim($_POST['title']));
    $author      = $this->db->escape(trim($_POST['author']));
    $description = $this->db->escape(trim($_POST['description']));
    $result = [
      'title' => $title,
      'author' => $author,
      'description' => $description,
      'success' => false,
    ];
    if (!$title)       return array_merge($result, ['errorTag'=>'title',       'error'=>"Not a valid title"      ]);
    if (!$author)      return array_merge($result, ['errorTag'=>'author',      'error'=>"Not a valid author"     ]);
    if (!$description) return array_merge($result, ['errorTag'=>'description', 'error'=>"Not a valid description"]);
    // File upload handling
    $image = new Bulletproof\Image($_FILES);
    if (!$image['picture']) return ['error'=>"No picture uploaded"];
    $image->setMime(['jpeg']);
    $image->setSize(100, 20000000); // Max 20 mb
    $image->setDimension(10000, 10000); // Max 10 000 pixels
    $image->setLocation($_SERVER['DOCUMENT_ROOT'].'/uploads');
    $upload = $image->upload(); 
    if (!$upload && $image['error']) return array_merge($result, $image['error'], ['errorTag'=>'picture']);
    if (!$upload) return array_merge($result, ['errorTag'=>'picture', 'error'=>'Picture upload failed']);
    $imageName = basename($upload->getFullPath());
    // Store to database
    $this->db->query("
      INSERT INTO meals (title, description, author, image)
      VALUES ('$title', '$description', '$author', '$imageName')");
    $result['insertID'] = $this->db->insert_id;
    $result['success'] = true;
    return $result;
  }
}

