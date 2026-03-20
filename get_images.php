<?php
// 1. Define the path to your portfolio images
$dir = 'images/portfolio/';

// 2. Define which file types we want to show
$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov'];

// 3. Scan the directory
$files = scandir($dir);
$result = [];

if ($files) {
    foreach ($files as $file) {
        // Get the file extension
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

        // Filter out folders (.) and hidden files (like .DS_Store)
        if (in_array($ext, $allowed_extensions)) {
            $result[] = $file;
        }
    }
}

// 4. Tell the browser this is a JSON response
header('Content-Type: application/json');

// 5. Send the list of filenames back to your JavaScript
echo json_encode($result);
?>