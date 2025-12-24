// StoryNode Player - Tauri Backend
// Handles embedded game data extraction and window configuration

use std::fs::{self, File};
use std::io::{Read, Seek, SeekFrom};
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::Manager;

const MAGIC_BYTES: &[u8; 4] = b"SNPK";

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct GameSettings {
    title: Option<String>,
    window_width: Option<u32>,
    window_height: Option<u32>,
    resizable: Option<bool>,
    fullscreen: Option<bool>,
    default_theme_id: Option<String>,
    default_game_mode: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ProjectMeta {
    name: String,
    version: Option<String>,
    stages: Vec<String>,
    game_settings: Option<GameSettings>,
}

/// Extract embedded game data from the executable
fn extract_embedded_data() -> Option<Vec<u8>> {
    let exe_path = std::env::current_exe().ok()?;
    let mut file = File::open(&exe_path).ok()?;

    // Read footer: [ZIP size: 8 bytes][Magic: 4 bytes]
    file.seek(SeekFrom::End(-12)).ok()?;

    let mut footer = [0u8; 12];
    file.read_exact(&mut footer).ok()?;

    // Check magic bytes
    if &footer[8..12] != MAGIC_BYTES {
        return None;
    }

    // Get ZIP size
    let zip_size = u64::from_le_bytes(footer[0..8].try_into().ok()?);

    // Read ZIP data
    file.seek(SeekFrom::End(-(12 + zip_size as i64))).ok()?;
    let mut zip_data = vec![0u8; zip_size as usize];
    file.read_exact(&mut zip_data).ok()?;

    Some(zip_data)
}

/// Extract ZIP data to a temporary directory
fn extract_game_to_temp(zip_data: &[u8]) -> Result<PathBuf, String> {
    let temp_dir = std::env::temp_dir().join("storynode_game");

    // Clean up existing temp directory
    if temp_dir.exists() {
        fs::remove_dir_all(&temp_dir).map_err(|e| e.to_string())?;
    }
    fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;

    // Extract ZIP
    let cursor = std::io::Cursor::new(zip_data);
    let mut archive = zip::ZipArchive::new(cursor).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = temp_dir.join(file.name());

        if file.name().ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(parent) = outpath.parent() {
                fs::create_dir_all(parent).map_err(|e| e.to_string())?;
            }
            let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }
    }

    Ok(temp_dir)
}

/// Read game settings from project.json
fn read_game_settings(game_dir: &PathBuf) -> Option<GameSettings> {
    let project_path = game_dir.join("project.json");
    let content = fs::read_to_string(project_path).ok()?;
    let project: ProjectMeta = serde_json::from_str(&content).ok()?;
    project.game_settings
}

#[tauri::command]
fn get_game_data_path() -> Result<String, String> {
    // Check for embedded data
    if let Some(zip_data) = extract_embedded_data() {
        let game_dir = extract_game_to_temp(&zip_data)?;
        return Ok(game_dir.to_string_lossy().to_string());
    }

    // Fallback: look for game data in current directory
    let current_dir = std::env::current_dir().map_err(|e| e.to_string())?;
    if current_dir.join("project.json").exists() {
        return Ok(current_dir.to_string_lossy().to_string());
    }

    Err("No game data found".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Try to extract embedded data and read settings
    let (window_title, window_width, window_height) = if let Some(zip_data) = extract_embedded_data() {
        if let Ok(game_dir) = extract_game_to_temp(&zip_data) {
            if let Some(settings) = read_game_settings(&game_dir) {
                (
                    settings.title.unwrap_or_else(|| "StoryNode Player".to_string()),
                    settings.window_width.unwrap_or(1280),
                    settings.window_height.unwrap_or(720),
                )
            } else {
                ("StoryNode Player".to_string(), 1280, 720)
            }
        } else {
            ("StoryNode Player".to_string(), 1280, 720)
        }
    } else {
        ("StoryNode Player".to_string(), 1280, 720)
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_game_data_path])
        .setup(move |app| {
            // Configure main window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title(&window_title);
                let _ = window.set_size(tauri::Size::Logical(tauri::LogicalSize {
                    width: window_width as f64,
                    height: window_height as f64,
                }));
                let _ = window.center();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
