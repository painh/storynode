use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager, RunEvent, WindowEvent};

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

// Copy a directory recursively
#[tauri::command]
fn copy_directory(src: String, dest: String) -> Result<(), String> {
    let src_path = Path::new(&src);
    let dest_path = Path::new(&dest);

    if !src_path.exists() {
        return Err(format!("Source directory does not exist: {}", src));
    }

    copy_dir_recursive(src_path, dest_path)
}

fn copy_dir_recursive(src: &Path, dest: &Path) -> Result<(), String> {
    if !dest.exists() {
        fs::create_dir_all(dest).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let entries = fs::read_dir(src).map_err(|e| format!("Failed to read directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let src_path = entry.path();
        let dest_path = dest.join(entry.file_name());

        if src_path.is_dir() {
            copy_dir_recursive(&src_path, &dest_path)?;
        } else {
            fs::copy(&src_path, &dest_path)
                .map_err(|e| format!("Failed to copy file: {}", e))?;
        }
    }

    Ok(())
}

// Write a text file (for index.html export)
#[tauri::command]
fn write_text_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

// Image resource info with base64 data
#[derive(Debug, Serialize, Deserialize)]
pub struct ImageResource {
    pub name: String,
    pub path: String,
    pub data_url: String,
}

// List image files in a directory with base64 data
#[tauri::command]
fn list_image_files(dir: String) -> Result<Vec<ImageResource>, String> {
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

            // Filter for image files only
            if !is_dir {
                let lower_name = file_name.to_lowercase();
                let mime_type = if lower_name.ends_with(".png") {
                    Some("image/png")
                } else if lower_name.ends_with(".jpg") || lower_name.ends_with(".jpeg") {
                    Some("image/jpeg")
                } else if lower_name.ends_with(".gif") {
                    Some("image/gif")
                } else if lower_name.ends_with(".webp") {
                    Some("image/webp")
                } else {
                    None
                };

                if let Some(mime) = mime_type {
                    // Read file and convert to base64
                    if let Ok(data) = fs::read(&entry.path()) {
                        use base64::{Engine as _, engine::general_purpose::STANDARD};
                        let base64_data = STANDARD.encode(&data);
                        let data_url = format!("data:{};base64,{}", mime, base64_data);

                        files.push(ImageResource {
                            name: file_name,
                            path: file_path,
                            data_url,
                        });
                    }
                }
            }
        }
    }

    files.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(files)
}

// Get the app config directory path
#[tauri::command]
fn get_config_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    app_handle
        .path()
        .app_config_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| format!("Failed to get config dir: {}", e))
}

// Toggle DevTools (debug only)
#[tauri::command]
fn toggle_devtools(webview_window: tauri::WebviewWindow) {
    #[cfg(debug_assertions)]
    {
        if webview_window.is_devtools_open() {
            webview_window.close_devtools();
        } else {
            webview_window.open_devtools();
        }
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
            list_image_files,
            file_exists,
            create_directory,
            delete_path,
            copy_directory,
            write_text_file,
            get_config_dir,
            toggle_devtools
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                // 디버그 모드에서 자동으로 개발자 도구 열기
                if let Some(window) = app.get_webview_window("main") {
                    window.open_devtools();
                    println!("[Tauri] DevTools opened automatically");
                }
            }
            println!("[Tauri] App started");
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            match &event {
                RunEvent::WindowEvent { label, event: WindowEvent::CloseRequested { api, .. }, .. } => {
                    println!("[Tauri] CloseRequested event received for window: {}", label);
                    // 창 닫기 요청 시 기본 동작 방지하고 프론트엔드에 알림
                    api.prevent_close();

                    // 프론트엔드에 이벤트 발송
                    if let Some(window) = app_handle.get_webview_window(label) {
                        println!("[Tauri] Emitting close-requested event to frontend");
                        let _ = window.emit("tauri://close-requested", ());
                    }
                }
                RunEvent::ExitRequested { .. } => {
                    // ExitRequested는 무시 - CloseRequested에서 처리됨
                    println!("[Tauri] ExitRequested event received - ignoring");
                }
                _ => {}
            }
        });
}
