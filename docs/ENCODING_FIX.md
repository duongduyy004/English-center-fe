# Fix Encoding Issues Script

## Problem

File bị lỗi encoding với ký tự BOM (Byte Order Mark) gây ra lỗi:

```
Unexpected character '�'. (1:0)
```

## Solution

1. **Immediate Fix**: Tạo lại file với encoding UTF-8 clean
2. **Prevention**: Cấu hình VS Code để sử dụng UTF-8 without BOM

## VS Code Settings

Thêm vào `.vscode/settings.json`:

```json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  "files.trimTrailingWhitespace": true
}
```

## Manual Fix Steps

1. Copy nội dung file
2. Xóa file cũ
3. Tạo file mới với encoding UTF-8
4. Paste nội dung vào file mới

## Auto Fix với VS Code

1. Ctrl + Shift + P
2. Gõ "Change File Encoding"
3. Chọn "UTF-8"
4. Save file

Điều này sẽ ngăn chặn lỗi encoding trong tương lai.
