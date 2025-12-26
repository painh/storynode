fn main() {
    // 빌드 시간을 환경변수로 설정
    let build_time = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();
    println!("cargo:rustc-env=BUILD_TIME={}", build_time);

    tauri_build::build()
}
