# 📊 Database Schema - PremixTrack

## Tổng Quan

Hệ thống sử dụng **PostgreSQL** hoặc **MySQL** với các bảng quan hệ chuẩn hóa.

---

## 📋 ERD (Entity Relationship Diagram)

```
users ──┬── premix_schedules (created_by)
        ├── premix_schedules (approved_by)
        ├── reports (generated_by)
        ├── notifications (user_id)
        └── audit_logs (user_id)

premix_schedules ──┬── premix_items (schedule_id)
                   └── reports (có thể tham chiếu)

inventory ──┐
            └── premix_items (tham chiếu ingredient_name)
```

---

## 🗄️ Chi Tiết Các Bảng

### 1. **users** - Người dùng hệ thống

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'planner', 'operator', 'qc', 'warehouse')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Roles:**
- `admin`: Quản trị viên - toàn quyền
- `planner`: Người lập kế hoạch - tạo và duyệt lịch
- `operator`: Nhân viên vận hành - cập nhật trạng thái
- `qc`: Kiểm soát chất lượng - xác nhận chất lượng
- `warehouse`: Kho - quản lý nguyên liệu

---

### 2. **premix_schedules** - Lịch đặt premix

```sql
CREATE TABLE premix_schedules (
    id SERIAL PRIMARY KEY,
    schedule_code VARCHAR(50) UNIQUE NOT NULL,
    planned_date DATE NOT NULL,
    planned_time TIME NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
    priority VARCHAR(10) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high')),
    notes TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_schedules_date ON premix_schedules(planned_date);
CREATE INDEX idx_schedules_status ON premix_schedules(status);
CREATE INDEX idx_schedules_created_by ON premix_schedules(created_by);
```

**Status Flow:**
```
pending → approved → in_progress → completed
  ↓
cancelled
```

**Schedule Code Format:** `PM-YYYYMMDD-001` (ví dụ: PM-20260115-001)

---

### 3. **premix_items** - Chi tiết nguyên liệu trong premix

```sql
CREATE TABLE premix_items (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER NOT NULL REFERENCES premix_schedules(id) ON DELETE CASCADE,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity_required DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    percentage DECIMAL(5, 2), -- Phần trăm trong tổng premix
    supplier VARCHAR(100),
    batch_number VARCHAR(50),
    expiry_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_schedule ON premix_items(schedule_id);
CREATE INDEX idx_items_ingredient ON premix_items(ingredient_name);
```

---

### 4. **inventory** - Kho nguyên liệu

```sql
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    ingredient_name VARCHAR(100) UNIQUE NOT NULL,
    current_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    min_threshold DECIMAL(10, 2) NOT NULL DEFAULT 0,
    max_capacity DECIMAL(10, 2),
    location VARCHAR(100),
    supplier VARCHAR(100),
    category VARCHAR(50), -- Phân loại nguyên liệu
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_inventory_name ON inventory(ingredient_name);
CREATE INDEX idx_inventory_threshold ON inventory(current_quantity, min_threshold);
```

**Cảnh báo:** Khi `current_quantity < min_threshold`, hệ thống sẽ gửi thông báo.

---

### 5. **inventory_transactions** - Lịch sử nhập/xuất kho

```sql
CREATE TABLE inventory_transactions (
    id SERIAL PRIMARY KEY,
    inventory_id INTEGER NOT NULL REFERENCES inventory(id),
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('in', 'out')),
    quantity DECIMAL(10, 2) NOT NULL,
    reference_type VARCHAR(50), -- 'schedule', 'purchase', 'adjustment'
    reference_id INTEGER, -- ID của schedule hoặc purchase order
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_inventory ON inventory_transactions(inventory_id);
CREATE INDEX idx_transactions_date ON inventory_transactions(created_at);
```

---

### 6. **reports** - Báo cáo đã tạo

```sql
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    report_type VARCHAR(20) NOT NULL 
        CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
    title VARCHAR(200) NOT NULL,
    date_from DATE,
    date_to DATE,
    filters JSONB, -- Lưu các filter đã áp dụng
    file_path VARCHAR(500), -- Đường dẫn file PDF/Excel
    file_size INTEGER, -- Kích thước file (bytes)
    generated_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_date ON reports(date_from, date_to);
CREATE INDEX idx_reports_user ON reports(generated_by);
```

---

### 7. **notifications** - Thông báo

```sql
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' 
        CHECK (type IN ('info', 'warning', 'error', 'success')),
    related_type VARCHAR(50), -- 'schedule', 'inventory', 'report'
    related_id INTEGER, -- ID của đối tượng liên quan
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

**Các loại thông báo:**
- `info`: Thông tin chung
- `warning`: Cảnh báo (ví dụ: sắp hết nguyên liệu)
- `error`: Lỗi (ví dụ: thiếu nguyên liệu)
- `success`: Thành công (ví dụ: hoàn thành lịch)

---

### 8. **audit_logs** - Nhật ký audit

```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(20) NOT NULL 
        CHECK (action IN ('create', 'update', 'delete', 'approve', 'cancel')),
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    old_values JSONB, -- Giá trị cũ (nếu update)
    new_values JSONB, -- Giá trị mới
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_table ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
```

**Mục đích:** Theo dõi mọi thay đổi trong hệ thống để audit và khôi phục dữ liệu nếu cần.

---

## 🔗 Quan Hệ Giữa Các Bảng

### Foreign Keys

```sql
-- premix_schedules
ALTER TABLE premix_schedules 
    ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    ADD CONSTRAINT fk_approved_by FOREIGN KEY (approved_by) REFERENCES users(id);

-- premix_items
ALTER TABLE premix_items 
    ADD CONSTRAINT fk_schedule FOREIGN KEY (schedule_id) REFERENCES premix_schedules(id) ON DELETE CASCADE;

-- inventory_transactions
ALTER TABLE inventory_transactions 
    ADD CONSTRAINT fk_inventory FOREIGN KEY (inventory_id) REFERENCES inventory(id),
    ADD CONSTRAINT fk_transaction_user FOREIGN KEY (created_by) REFERENCES users(id);

-- inventory
ALTER TABLE inventory 
    ADD CONSTRAINT fk_inventory_user FOREIGN KEY (updated_by) REFERENCES users(id);

-- reports
ALTER TABLE reports 
    ADD CONSTRAINT fk_report_user FOREIGN KEY (generated_by) REFERENCES users(id);

-- notifications
ALTER TABLE notifications 
    ADD CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- audit_logs
ALTER TABLE audit_logs 
    ADD CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id);
```

---

## 📝 Dữ Liệu Mẫu (Seed Data)

### Users

```sql
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@premixtrack.com', '$2b$10$...', 'Quản Trị Viên', 'admin'),
('planner1', 'planner1@premixtrack.com', '$2b$10$...', 'Nguyễn Văn A', 'planner'),
('operator1', 'operator1@premixtrack.com', '$2b$10$...', 'Trần Thị B', 'operator'),
('qc1', 'qc1@premixtrack.com', '$2b$10$...', 'Lê Văn C', 'qc'),
('warehouse1', 'warehouse1@premixtrack.com', '$2b$10$...', 'Phạm Thị D', 'warehouse');
```

### Inventory

```sql
INSERT INTO inventory (ingredient_name, current_quantity, unit, min_threshold, location) VALUES
('Bột mì', 500.00, 'kg', 100.00, 'Kho A'),
('Đường', 300.00, 'kg', 50.00, 'Kho A'),
('Muối', 200.00, 'kg', 30.00, 'Kho B'),
('Bột nở', 50.00, 'kg', 10.00, 'Kho B'),
('Trứng', 1000.00, 'quả', 200.00, 'Kho lạnh');
```

### Premix Schedule (Ví dụ)

```sql
INSERT INTO premix_schedules (schedule_code, planned_date, planned_time, quantity, unit, status, priority, created_by) VALUES
('PM-20260115-001', '2026-01-15', '08:00:00', 100.00, 'kg', 'pending', 'high', 2);

INSERT INTO premix_items (schedule_id, ingredient_name, quantity_required, unit, percentage) VALUES
(1, 'Bột mì', 50.00, 'kg', 50.00),
(1, 'Đường', 30.00, 'kg', 30.00),
(1, 'Muối', 2.00, 'kg', 2.00),
(1, 'Bột nở', 1.00, 'kg', 1.00),
(1, 'Trứng', 100.00, 'quả', 17.00);
```

---

## 🔍 Các Query Thường Dùng

### 1. Lấy lịch đặt theo ngày

```sql
SELECT 
    ps.*,
    u.full_name as creator_name,
    a.full_name as approver_name
FROM premix_schedules ps
LEFT JOIN users u ON ps.created_by = u.id
LEFT JOIN users a ON ps.approved_by = a.id
WHERE ps.planned_date = CURRENT_DATE
ORDER BY ps.planned_time;
```

### 2. Kiểm tra nguyên liệu có đủ không

```sql
SELECT 
    pi.ingredient_name,
    pi.quantity_required,
    i.current_quantity,
    (i.current_quantity - pi.quantity_required) as remaining
FROM premix_items pi
JOIN inventory i ON pi.ingredient_name = i.ingredient_name
WHERE pi.schedule_id = 1
AND i.current_quantity < pi.quantity_required;
```

### 3. Thống kê theo trạng thái

```sql
SELECT 
    status,
    COUNT(*) as count,
    SUM(quantity) as total_quantity
FROM premix_schedules
WHERE planned_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY status;
```

### 4. Lấy thông báo chưa đọc

```sql
SELECT *
FROM notifications
WHERE user_id = 1 AND is_read = FALSE
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🛠️ Migration Scripts

### Tạo tất cả bảng (PostgreSQL)

```sql
-- Chạy các CREATE TABLE statements ở trên theo thứ tự
-- Sau đó chạy các ALTER TABLE để thêm foreign keys
```

### Migration với Prisma (Khuyến nghị)

Tạo file `prisma/schema.prisma` và dùng Prisma Migrate để quản lý database schema.

---

## 📊 Indexes để Tối Ưu Performance

```sql
-- Đã thêm trong các CREATE TABLE statements
-- Có thể thêm thêm nếu cần:

CREATE INDEX idx_schedules_date_status ON premix_schedules(planned_date, status);
CREATE INDEX idx_items_schedule_ingredient ON premix_items(schedule_id, ingredient_name);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

---

## 🔒 Security Considerations

1. **Password Hashing**: Dùng bcrypt với salt rounds >= 10
2. **SQL Injection**: Dùng parameterized queries (Prisma/Sequelize tự động)
3. **XSS**: Sanitize input ở frontend và backend
4. **CSRF**: Dùng CSRF tokens cho các form
5. **Rate Limiting**: Giới hạn số request từ một IP

---

## 📈 Backup Strategy

1. **Daily Backup**: Backup database mỗi ngày
2. **Transaction Logs**: Lưu audit_logs để có thể khôi phục
3. **Export Data**: Export định kỳ ra CSV/JSON

---

File này sẽ được cập nhật khi có thay đổi trong database design.
