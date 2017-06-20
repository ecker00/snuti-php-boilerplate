<?php

// Safe division
// When attempting to divide by 0, return 0
function division($a, $b) {         
	if($b == 0) return 0;
	return $a/$b;
}

function safeStr( $str ) {
	return trim(esc_attr(stripslashes( $str ))); // Do not strip emoticon characters here, it breaks other things
}
function safeInt( $int ) {
	return (int) trim(esc_attr(stripslashes( $int )));
}
function safeBool( $bool ) {
	return (bool) filter_var(trim(esc_attr(stripslashes( $bool ))), FILTER_VALIDATE_BOOLEAN);
}
function safeArr( $input ) {
	if (!is_array($input)) {
		if ($input === 'true' || $input === 'True' || $input === 'false' || $input === 'False')
			return safeBool($input);
		if (ctype_digit($input) || is_int($input))
			return safeInt($input);
		else
			return safeStr($input);
	}
	$output = [];
	foreach ($input as $key => $child) {
		$output[$key] = safeArr($child);
	}
	return $output;
}

// Beautiful logging
// –––––––––––––––––––––––––––––––––––––––––––––––––– //
function l() {
	$str = '';
	$args = func_get_args();
	foreach ($args as $i => $input) {
		if ($i>0) $str .= ', ';
		$str .= lArr($input, 0, isAssoc($input));
	}
	// Subtle trace and timestamp
	$str = trim($str);
	$trace = debug_backtrace();
	$line  = $trace[0]['line'];
	$func  = $trace[1]['function'];
	$file  = basename($trace[0]['file']);
	$time = date('H:i'); // :s
	$str .= " \033[90m«{$time}» line $line ➢ $func() ➢ $file \033[0m"; #  ➡ line $line2 in $file2
	$str .= PHP_EOL;
	if (getenv('IS_DOCKER')) { // Output logs to Docker stdout
		$stderr = fopen('php://stdout', 'w+');
  	fwrite($stderr, $str);
  	fclose($stderr);
	} else {
		error_log($str, 3);
	}
}

function lArr($input, $level=0, $parentAssoc=false) {
	$str = '';
	$isObj = is_object($input);
	if ($isObj) {
		$objType = get_class($input);
		$input = get_object_vars($input);
	}
  if (is_array($input)) {
    $isAssoc = isAssoc($input);
    if ($isAssoc) $str .= '{';
    else          $str .= '[';
    if ($isObj) $str .= " \033[90m($objType object)\033[0m";
  	$level += 1;
    if ($isAssoc) $str .= PHP_EOL;
    foreach ($input as $k => $val) {
    	if ($isAssoc) $str .= str_pad('', $level*2);
    	if ($isAssoc) $str .= "'\033[33m$k\033[0m': "; # The special-space character is intentional
      $str .= lArr($val, $level+1, isAssoc($input));
      if (!$isAssoc)
      	if ($k+1 < count($input))
      		$str .= ', ';
    }
    $level -= 1;
    if ($isAssoc) $str .= str_pad('', $level*2).'}';
    else          $str .= ']';
  	if ($parentAssoc) $str .= PHP_EOL;
  } else {
  	$str .= lVar($input);
  	if ($parentAssoc) $str .= PHP_EOL;
  }
  return $str;
}

function lVar($input) {
	$white  = "\033[0m"; // Ref: http://blog.lenss.nl/2012/05/adding-colors-to-php-cli-script-output/
	$gray   = "\033[90m";
	$blue   = "\033[34m";
	$green  = "\033[32m";
	$cyan   = "\033[36m";
	$red    = "\033[31m";
	$purple = "\033[35m";
	$yellow = "\033[33m";
	$white  = "\033[37m";
	if (is_string($input)) $input = str_replace(': "', ': "', $input); // Special exception as this logs blank l(': "');
	    if (is_int(   $input)) $input = $blue.$input.$white;
	elseif (is_float( $input)) $input = $cyan.$input.$white;
	#elseif (is_string($input)) $input = "\"$green".str_replace(PHP_EOL, PHP_EOL.$green, $input)."$white\""; # Expand multi line string
	elseif (is_string($input)) $input = "\"$green".str_replace(PHP_EOL, $white.'\n'.$green, $input)."$white\""; # Multi-line string as one line
	elseif (is_bool(  $input)) $input = $purple.($input?'true':'false').$white;
	elseif (is_null(  $input)) $input = $red.'null'.$white;
	return $input;
}

function isAssoc($arr) { // http://stackoverflow.com/questions/173400/how-to-check-if-php-array-is-associative-or-sequential
	if (!is_array($arr)) return false;
  if (array() === $arr) return false;
  return array_keys($arr) !== range(0, count($arr) - 1);
}
