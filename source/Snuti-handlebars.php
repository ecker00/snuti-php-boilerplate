<?php

// A PHP Handlebars wrapper
// :: Automatically pre-compiles the templates and render pages
// :: Functionality extended by creating static 'helper_NAME' functions

// Dependency: lightncandy – https://github.com/zordius/lightncandy

class HBS {
	public $defaultData;
	public $compileDir = './_hbs/';
	public $helpers = [];
	
  function __construct($defaultData = []) {
		$defaultData['defaultData'] = json_encode($defaultData);
  	$this->defaultData = $defaultData;
  	// Prepare helpers
		foreach (get_class_methods($this) as $method) {
			$helper = explode('helper_', $method)[1];
			if ($helper) $this->helpers[$helper] = "HBS::$method";
		}
  }
  
  // Error logging
	// –––––––––––––––––––––––––––––––––––––––––––––––––– //
	public function error($msg) {
		l('HBS Error:', $msg);
		return ['error'=>'HBS Error: '.$msg];
	}
	
	// Render the contents of the handlebar files
	// –––––––––––––––––––––––––––––––––––––––––––––––––– //
	public function render( $tag, $data, $returnOutput=false ) {
		$this->returnOutput = returnOutput;
		$path = $this->compileDir.$tag;
		if ($data) $data = array_merge($data, $this->defaultData);
		else       $data = $this->defaultData;
		
		// Generate pre-compile template
		if (!file_exists($path.'.php'))
			$this->compileTemplate($path);

		// Fetch pre-compiled template
		$compiledFile = file_get_contents($path.'.php');
		if (!$compiledFile) return $this->error("The pre-compiled HBS '$tag' file is blank.");
		$template = eval($compiledFile);
		if ($this->returnOutput)
		   return $template( $data );
		else echo $template( $data );
	}
	
	// Pre-compile handlebars templates to PHP files
	// –––––––––––––––––––––––––––––––––––––––––––––––––– //
	public function compileTemplate($path) {
		$pathHBS = $path.'.hbs';
		if (!file_exists($pathHBS)) return $this->error("Cant render handlebars, can't find '$pathHBS'.");
		$fileHBS = file_get_contents($pathHBS);
		$compilerInput = Array(
			'helpers' => $this->helpers,
			'flags' => LightnCandy\LightnCandy::FLAG_HANDLEBARSJS_FULL,
			'partialresolver' => function ($context, $tag) { // Resolve netsed files
				$pathPart = $this->compileDir.$tag.'.hbs';
				$file = file_get_contents($pathPart);
				if (!$file) return $this->error("Unable to resolve partial, can't find '$pathPart'.");
				return $file;
			},
		);
		$compiled = LightnCandy\LightnCandy::compile($fileHBS, $compilerInput); // Compile the template
		if (!$compiled) { // Automatic debug
			$compilerInput['flags'] = LightnCandy\Runtime::DEBUG_ERROR_LOG;
			$compiled = LightnCandy\LightnCandy::compile($fileHBS, $compilerInput);
			$this->error("Unable to pre-compile HBS, compiling a debug version of '$pathHBS'.");
		}
		// Write compiled result to file
		$filePHP = fopen($path.'.php', 'w');
		if (!$filePHP) return $this->error("Unable to write compiled template to '$path.php'.");
		fwrite($filePHP, $compiled);
		fclose($filePHP);
	}
	
	// Handlebar helpers
	// –––––––––––––––––––––––––––––––––––––––––––––––––– //
	// Note: All helpers have to be implemented both PHP and JS (for client & server rendering)
	// All functions starting with helper_ are automatically added to helper function array
	
	// Used for logic checks and value comparisons
	static function helper_logic($v1, $operator, $v2, $options) {
		switch ($operator) {
			case '==' : if ($v1 ==  $v2) return $options['fn'](); break;
			case '===': if ($v1 === $v2) return $options['fn'](); break;
			case '!=' : if ($v1 !=  $v2) return $options['fn'](); break;
			case '!==': if ($v1 !== $v2) return $options['fn'](); break;
			case '<'  : if ($v1 <   $v2) return $options['fn'](); break;
			case '<=' : if ($v1 <=  $v2) return $options['fn'](); break;
			case '>'  : if ($v1 >   $v2) return $options['fn'](); break;
			case '>=' : if ($v1 >=  $v2) return $options['fn'](); break;
			case '&&' : if ($v1 &&  $v2) return $options['fn'](); break;
			case '||' : if ($v1 ||  $v2) return $options['fn'](); break;
			default: break;
		}
		if ($options['inverse'])
			return $options['inverse']();
	}
	
	// Render dynamic partials
	static function helper_include($tag, $context) {
		return $this->render($tag, $context['_this'], true);
	}
	
	// Encode data as JSON
	// Note: Useful for inspecting contents of HBS variables, or passing data to JS
	static function helper_json($data, $context) {
    return json_encode($data);
	}
	
	// Combine strings
	// Note: Useful for passing two variables as one argument
	static function helper_concat() {
		$args = func_get_args();
		$values = []; // Extract arguments
		foreach ($args as $i => $v) {
			if ($i+1 == count($args)) $context = $v; // Last argument is always the context
			else $values[] = $v; // Values to join
		}
		return implode('', $values);
	}
	
	// Multi-dimensional lookup
	// Diving into specific numeric indexes with children keys can be impossible and messy in handlebars.
	// With this approach you do: {{deepLookup inputArray key1 key2 key3...}}
	static function helper_deepLookup() {
		$args = func_get_args();
		$keys = []; // Extract keys
		foreach ($args as $i => $a) {
			if ($i+1 == count($args)) { $context = $a; continue; } // Last argument is always the context
			if ($i == 0) { $input = $a; continue; } // First argument is always the input
			if ($i > 0) { $keys[] = $a; continue; } // The other arguments are the keys
		}
		foreach ($keys as $key) {
			if ($input[$key] === null) // Key doesn't exsist
				return null;
			$input = $input[$key];
		}
		return $input;
	}
	
	// Simple math calculations
	static function helper_calc($v1, $operator, $v2, $context=null) {
		switch ($operator) {
			case '+': $v = $v1 + $v2; break;
			case '-': $v = $v1 - $v2; break;
			case '*': $v = $v1 * $v2; break;
			case '/': $v = division($v1, $v2); break;
			default: break;
		}
		return $v;
	}
	
	// Convert line breaks to paragraphs
	static function helper_toParagraph($str, $context=null) {
		$str = str_replace("\n", '</p><p>', $str);
		$str = str_replace('<p></p>', '', $str); // Remove empty paragraphs
		return "<p>$str</p>";
	}
	
}