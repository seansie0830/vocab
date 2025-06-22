# --- 手動執行步驟 6: 設定 package.json 中的測試腳本 ---
Write-Host "--- Starting Step 6: Configuring the 'test' script in 'package.json'... ---" -ForegroundColor Green

# 定義 package.json 的路徑
$PackageJsonPath = ".\package.json"

# 檢查檔案是否存在
if (-not (Test-Path $PackageJsonPath)) {
    Write-Host "Error: 'package.json' not found in the current directory." -ForegroundColor Red
    exit
}

# 讀取 package.json 並轉換為 PowerShell 物件
$PackageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json

# 使用 Add-Member 來穩定地新增 "test" 屬性到 scripts 物件
# -Force 參數可以在屬性已存在時覆寫它，確保指令能重複執行
Add-Member -InputObject $PackageJson.scripts -MemberType NoteProperty -Name "test" -Value "vitest" -Force

# 將物件轉換回格式化的 JSON 字串，並寫回檔案
$PackageJson | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath

Write-Host "✅ Successfully added the 'test' script to package.json!" -ForegroundColor Yellow
