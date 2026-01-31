# PremixTrack

**Hệ thống quản lý và theo dõi lịch đặt premix**

Thay thế quy trình Excel rời rạc bằng ứng dụng web tập trung, giúp quản lý premix nhất quán, minh bạch và hiệu quả hơn.

---

## 📋 Tổng Quan

PremixTrack là hệ thống web quản lý lịch đặt premix (hỗn hợp nguyên liệu) cho các nhà máy sản xuất. Hệ thống giúp:

- ✅ Tập trung dữ liệu, truy xuất lịch sử & audit trail
- ✅ Cập nhật thời gian thực, tránh xung đột phiên bản
- ✅ Phân quyền theo vai trò, giảm sai sót vận hành
- ✅ Báo cáo nhanh và xuất dữ liệu theo nhiều tiêu chí
- ✅ Tự động cảnh báo khi thiếu nguyên liệu hoặc trùng lịch

---

## 🎯 Mục Đích Dự Án

Dự án này được phát triển cho **báo cáo tốt nghiệp Công nghệ Thông tin**, với mục tiêu xây dựng một hệ thống web hoàn chỉnh có thể triển khai thực tế.

---

## 📚 Tài Liệu

### 📖 Bắt Đầu
- **[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)** - Roadmap phát triển chi tiết, tech stack, timeline
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Thiết kế database, ERD, các bảng và quan hệ
- **[API_DESIGN.md](./API_DESIGN.md)** - Thiết kế RESTful API, endpoints, authentication

### 📄 Trang Web
- `index.html` - Trang chủ
- `about.html` - Giới thiệu về hệ thống

---

## 🚀 Tech Stack (Đề xuất)

### Frontend
- **React 18+** - UI Framework
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP Client

### Backend
- **Node.js + Express** - Backend Framework
- **PostgreSQL/MySQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication

### Deployment
- **Vercel/Netlify** - Frontend hosting
- **Railway/Render** - Backend hosting
- **Supabase/PlanetScale** - Database hosting

---

## 📊 Tính Năng Chính

### ✅ Đã Hoàn Thành
- [x] Landing page cơ bản
- [x] Trang giới thiệu
- [x] Responsive design

### 🚧 Đang Phát Triển
- [ ] Authentication & Authorization
- [ ] Dashboard
- [ ] Quản lý lịch đặt premix (CRUD)
- [ ] Quản lý kho nguyên liệu
- [ ] Báo cáo & thống kê
- [ ] Thông báo & cảnh báo

---

## 🏗️ Cấu Trúc Dự Án

```
PremixTrack/
├── frontend/          # React app (sẽ tạo)
├── backend/           # Node.js API (sẽ tạo)
├── docs/              # Tài liệu
│   ├── DEVELOPMENT_ROADMAP.md
│   ├── DATABASE_SCHEMA.md
│   └── API_DESIGN.md
├── index.html         # Landing page
├── about.html         # About page
└── README.md          # File này
```

---

## 🛠️ Setup & Development

### Yêu Cầu
- Node.js 18+
- PostgreSQL/MySQL hoặc MongoDB
- Git

### Bước Tiếp Theo

1. **Đọc tài liệu:**
   - Bắt đầu với [DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)
   - Xem [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) để hiểu database
   - Tham khảo [API_DESIGN.md](./API_DESIGN.md) để thiết kế API

2. **Chọn tech stack:**
   - Khuyến nghị: MERN Stack (MongoDB/PostgreSQL + Express + React + Node.js)
   - Hoặc Laravel (PHP) nếu quen thuộc hơn

3. **Setup project:**
   ```bash
   # Backend
   mkdir backend && cd backend
   npm init -y
   npm install express mongoose dotenv bcryptjs jsonwebtoken cors
   
   # Frontend
   cd ..
   npx create-react-app frontend
   cd frontend
   npm install react-router-dom axios tailwindcss
   ```

4. **Phát triển theo roadmap:**
   - Tuần 1-2: Authentication & Database
   - Tuần 3-4: Core Features (CRUD)
   - Tuần 5-6: Advanced Features
   - Tuần 7-8: Testing & Deploy

---

## 👥 Stakeholders

- **Nhân viên lập kế hoạch sản xuất** (Production planners)
- **Nhân công vận hành** (Operators)
- **Kiểm soát chất lượng** (QC)
- **Kho và logistics**
- **Bảo trì thiết bị**
- **Quản lý & nhà cung cấp**

---

## 📅 Timeline

- **Tuần 1-2:** Setup & Authentication
- **Tuần 3-4:** Core Features
- **Tuần 5-6:** Advanced Features
- **Tuần 7:** Testing & Polish
- **Tuần 8:** Documentation & Deploy

---

## 🎓 Cho Báo Cáo Tốt Nghiệp

### Điểm Nổi Bật
- ✅ Phân tích bài toán thực tế
- ✅ Thiết kế database chuẩn hóa
- ✅ RESTful API với JWT
- ✅ Responsive design
- ✅ Phân quyền theo role
- ✅ Audit trail
- ✅ Export báo cáo (PDF/Excel)
- ✅ Deploy lên cloud

### Tài Liệu Cần Có
- Phân tích yêu cầu
- Thiết kế hệ thống (ERD, Use Case, Sequence Diagram)
- Tài liệu API
- Hướng dẫn sử dụng
- Source code với comments

---

## 📝 License

Dự án này được phát triển cho mục đích học tập và báo cáo tốt nghiệp.

---

## 📞 Liên Hệ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng tham khảo các file tài liệu trong thư mục `docs/`.

---

**Chúc bạn thành công với dự án! 🚀**
