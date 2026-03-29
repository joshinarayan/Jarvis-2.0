#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use tauri::Manager;

#[tauri::command]
fn save_chat(content: String) -> Result<(), String> {
    let home = dirs::document_dir()
        .ok_or("Could not find Documents folder")?;
    let jarvis_dir = home.join("JARVIS");
    std::fs::create_dir_all(&jarvis_dir)
        .map_err(|e| e.to_string())?;
    std::fs::write(jarvis_dir.join("chat_history.json"), content)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_chat() -> Result<String, String> {
    let home = dirs::document_dir()
        .ok_or("Could not find Documents folder")?;
    let file_path = home.join("JARVIS").join("chat_history.json");
    if !file_path.exists() { return Ok("[]".to_string()); }
    std::fs::read_to_string(file_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_credentials(username: String, password_hash: String) -> Result<(), String> {
    let home = dirs::document_dir()
        .ok_or("Could not find Documents folder")?;
    let jarvis_dir = home.join("JARVIS");
    std::fs::create_dir_all(&jarvis_dir)
        .map_err(|e| e.to_string())?;
    let creds = format!(
        "{{\"username\":\"{}\",\"hash\":\"{}\"}}",
        username, password_hash
    );
    std::fs::write(jarvis_dir.join("auth.json"), creds)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_credentials() -> Result<String, String> {
    let home = dirs::document_dir()
        .ok_or("Could not find Documents folder")?;
    let file_path = home.join("JARVIS").join("auth.json");
    if !file_path.exists() { return Ok("{}".to_string()); }
    std::fs::read_to_string(file_path).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            save_chat,
            load_chat,
            save_credentials,
            load_credentials,
        ])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.eval("
                document.addEventListener('contextmenu', e => e.preventDefault());
                document.addEventListener('keydown', e => {
                    if (e.key === 'F12') e.preventDefault();
                    if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) e.preventDefault();
                    if (e.ctrlKey && e.key === 'U') e.preventDefault();
                });
            ").ok();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running JARVIS");
}