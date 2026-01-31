# Hướng dẫn cài đặt và chạy PremixTrack

## Yêu cầu

- **Node.js** 18+ (cài từ [nodejs.org](https://nodejs.org) hoặc dùng bản portable bên dưới nếu không có quyền Admin)

---

## Chạy không cần quyền Admin (Portable Node.js)

Nếu máy bị khóa Admin và không cài Node.js được, dùng **Node.js portable** (bản zip, không cần cài đặt):

### Bước 1: Tải Node.js bản zip (Windows)

1. Vào: **https://nodejs.org/dist/**
2. Chọn phiên bản **LTS** (ví dụ `v20.10.0`).
3. Vào thư mục đó, tải file **Windows (x64)** dạng zip:
   - Tên dạng: `node-v20.10.0-win-x64.zip`  
   (hoặc `node-v18.x.x-win-x64.zip` tùy phiên bản)

Hoặc link trực tiếp (LTS, 64-bit):  
**https://nodejs.org/dist/v20.10.0/node-v20.10.0-win-x64.zip**

### Bước 2: Giải nén vào thư mục của bạn

- Giải nén vào thư mục **bạn có quyền ghi**, ví dụ:
  - `C:\Users\<TênBạn>\nodejs`
  - hoặc `D:\nodejs`
  - hoặc USB: `E:\nodejs`
- Sau khi giải nén, bên trong có thư mục `node-v20.10.0-win-x64` → đổi tên thành `nodejs` cho gọn (hoặc giữ nguyên).

### Bước 3: Thêm Node vào PATH (chỉ User, không cần Admin)

**Nếu Win+R hoặc sysdm.cpl / Biến môi trường cũng bị khóa Admin** → bỏ qua Bước 3 và Bước 4, dùng **[Cách B: Chạy bằng file .bat (không cần PATH)](#cach-b-chay-bang-file-bat-khong-can-path)** bên dưới.

1. Nhấn **Win + R** → gõ `sysdm.cpl` → Enter.
2. Tab **Nâng cao** → **Biến môi trường**.
3. Ở phần **Biến cho người dùng** (không phải “Biến hệ thống”), chọn **Path** → **Chỉnh sửa**.
4. **Mới** → dán đường dẫn tới thư mục chứa `node.exe`, ví dụ:
   - `C:\Users\<TênBạn>\nodejs\node-v20.10.0-win-x64`
   - hoặc `D:\nodejs` nếu bạn đổi tên thư mục thành `nodejs`.
5. **OK** hết các cửa sổ.
6. **Đóng hết CMD/PowerShell/VS Code** rồi mở lại.
7. Kiểm tra:
   ```bash
   node -v
   npm -v
   ```
   Có version in ra là dùng được.

### Bước 4: Chạy PremixTrack như bình thường

Làm lần lượt theo phần **Bước 1: Cài đặt Backend** và **Bước 2: Cài đặt Frontend** bên dưới (dùng `npm install`, `npx prisma ...`, `npm run dev` như hướng dẫn).

---

## Cách khác: Chạy trên môi trường online (không cài gì trên máy)

Nếu vẫn không dùng được Node trên máy:

- **Replit**: https://replit.com — tạo project Node.js, upload code backend/frontend (hoặc từ GitHub), chạy trong trình duyệt. Node có sẵn.
- **StackBlitz**: https://stackblitz.com — tạo project Node/React, dán code, chạy trên web.
- **GitHub Codespaces** (nếu có tài khoản GitHub): tạo repo, mở bằng Codespaces → môi trường Linux có Node sẵn.

Ưu tiên dùng **Replit** hoặc **StackBlitz** nếu bạn chỉ cần chạy thử / demo mà không cài Node.

---

## Cách B: Chạy bằng file .bat (không cần PATH)

Dùng khi **không cài được Node** và **không mở được sysdm.cpl / Biến môi trường**. Chỉ cần giải nén Node vào một thư mục, không cần chỉnh PATH.

1. **Tải Node bản zip** (xem Bước 1 ở trên) và **giải nén** vào thư mục bạn có quyền ghi, ví dụ `D:\nodejs` (bên trong phải có file `node.exe`).
2. Mở **Notepad**, mở file `PremixTrack\scripts\run-backend.bat`.
3. Dòng đầu có `set NODE_DIR=D:\nodejs` → **sửa** thành đúng đường dẫn bạn vừa giải nén Node, ví dụ:
   - `set NODE_DIR=D:\nodejs`
   - hoặc `set NODE_DIR=C:\Users\TenBan\Downloads\node-v20.10.0-win-x64`  
   Lưu file.
4. **Double-click** `run-backend.bat` → cửa sổ CMD mở, lần đầu sẽ tự chạy `npm install`, Prisma, seed rồi chạy backend. Cửa sổ để nguyên (đừng tắt).
5. Mở tiếp file `PremixTrack\scripts\run-frontend.bat`, **sửa** `NODE_DIR` giống bước 3, lưu. **Double-click** `run-frontend.bat` → cửa sổ CMD thứ hai mở, lần đầu sẽ tự `npm install` rồi chạy frontend.
6. Mở trình duyệt: **http://localhost:3000** → đăng nhập `admin@premixtrack.com` / `admin123`.

Mỗi lần sau: chỉ cần double-click `run-backend.bat` (cửa sổ 1) rồi `run-frontend.bat` (cửa sổ 2). **Không cần mở sysdm.cpl hay chỉnh PATH.**

---

## Bước 1: Cài đặt Backend

```bash
cd PremixTrack/backend
npm install
```

Tạo file `.env` (đã có sẵn, có thể chỉnh nếu cần):

```
PORT=5000
NODE_ENV=development
JWT_SECRET=premixtrack-secret-key-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
```

Tạo database và bảng (Prisma + SQLite):

```bash
npx prisma generate
npx prisma db push
```

Tạo dữ liệu mẫu (admin + planner + inventory):

```bash
node prisma/seed.js
```

Chạy API:

```bash
npm run dev
```

API chạy tại: **http://localhost:5000**

- Health: http://localhost:5000/api/v1/health
- Login: POST http://localhost:5000/api/v1/auth/login  
  Body: `{ "email": "admin@premixtrack.com", "password": "admin123" }`

---

## Bước 2: Cài đặt Frontend

Mở terminal mới:

```bash
cd PremixTrack/frontend
npm install
```

Chạy frontend (dev):

```bash
npm run dev
```

Frontend chạy tại: **http://localhost:3000**

Cấu hình proxy: frontend gọi `/api` sẽ được chuyển tới `http://localhost:5000`, nên không cần cấu hình `VITE_API_URL`.

---

## Tài khoản mẫu

| Email                     | Mật khẩu   | Vai trò   |
|---------------------------|------------|-----------|
| admin@premixtrack.com     | admin123   | admin     |
| planner@premixtrack.com    | planner123 | planner   |

---

## Lệnh tóm tắt

**Backend (trong `PremixTrack/backend`):**
```bash
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

**Frontend (trong `PremixTrack/frontend`):**
```bash
npm install
npm run dev
```

Sau đó mở trình duyệt: **http://localhost:3000** → Đăng nhập bằng admin@premixtrack.com / admin123.
