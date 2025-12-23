use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
}

// Read a story file
#[tauri::command]
fn read_story_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

// Write a story file
#[tauri::command]
fn write_story_file(path: String, content: String) -> Result<(), String> {
    // Create parent directories if they don't exist
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

// List story files in a directory
#[tauri::command]
fn list_story_files(dir: String) -> Result<Vec<FileInfo>, String> {
    let path = Path::new(&dir);
    if !path.exists() {
        return Ok(vec![]);
    }

    let entries = fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))?;

    let mut files = Vec::new();
    for entry in entries {
        if let Ok(entry) = entry {
            let file_name = entry.file_name().to_string_lossy().to_string();
            let file_path = entry.path().to_string_lossy().to_string();
            let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);

            // Filter for .story.json files or directories
            if is_dir || file_name.ends_with(".story.json") || file_name.ends_with(".json") {
                files.push(FileInfo {
                    name: file_name,
                    path: file_path,
                    is_directory: is_dir,
                });
            }
        }
    }

    files.sort_by(|a, b| {
        // Directories first, then by name
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.cmp(&b.name),
        }
    });

    Ok(files)
}

// Check if a file exists
#[tauri::command]
fn file_exists(path: String) -> bool {
    Path::new(&path).exists()
}

// Create a directory
#[tauri::command]
fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))
}

// Delete a file or directory
#[tauri::command]
fn delete_path(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| format!("Failed to delete directory: {}", e))
    } else {
        fs::remove_file(p).map_err(|e| format!("Failed to delete file: {}", e))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            read_story_file,
            write_story_file,
            list_story_files,
            file_exists,
            create_directory,
            delete_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
