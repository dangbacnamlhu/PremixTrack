# 🔌 API Design - PremixTrack

## Tổng Quan

RESTful API cho hệ thống PremixTrack với JWT authentication.

**Base URL:** `https://api.premixtrack.com/v1` (production)  
**Local:** `http://localhost:5000/api/v1`

---

## 🔐 Authentication

### Endpoints

#### POST `/auth/register`
Đăng ký tài khoản mới (chỉ admin)

**Request:**
```json
{
  "username": "planner1",
  "email": "planner1@example.com",
  "password": "password123",
  "full_name": "Nguyễn Văn A",
  "role": "planner"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "planner1",
    "email": "planner1@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "planner"
  }
}
```

---

#### POST `/auth/login`
Đăng nhập

**Request:**
```json
{
  "email": "planner1@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "username": "planner1",
      "email": "planner1@example.com",
      "full_name": "Nguyễn Văn A",
      "role": "planner"
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

#### POST `/auth/logout`
Đăng xuất (optional - có thể chỉ cần xóa token ở frontend)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET `/auth/me`
Lấy thông tin user hiện tại

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "planner1",
    "email": "planner1@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "planner",
    "is_active": true
  }
}
```

---

## 📅 Premix Schedules

### Endpoints

#### GET `/schedules`
Lấy danh sách lịch đặt

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (filter: pending, approved, in_progress, completed, cancelled)
- `date_from` (YYYY-MM-DD)
- `date_to` (YYYY-MM-DD)
- `created_by` (user ID)
- `sort` (date, status, priority)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": 1,
        "schedule_code": "PM-20260115-001",
        "planned_date": "2026-01-15",
        "planned_time": "08:00:00",
        "quantity": 100.00,
        "unit": "kg",
        "status": "pending",
        "priority": "high",
        "notes": "Cần hoàn thành sớm",
        "created_by": {
          "id": 2,
          "full_name": "Nguyễn Văn A"
        },
        "approved_by": null,
        "items": [
          {
            "ingredient_name": "Bột mì",
            "quantity_required": 50.00,
            "unit": "kg"
          }
        ],
        "created_at": "2026-01-10T10:00:00Z",
        "updated_at": "2026-01-10T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

---

#### GET `/schedules/:id`
Lấy chi tiết một lịch đặt

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "schedule_code": "PM-20260115-001",
    "planned_date": "2026-01-15",
    "planned_time": "08:00:00",
    "quantity": 100.00,
    "unit": "kg",
    "status": "pending",
    "priority": "high",
    "notes": "Cần hoàn thành sớm",
    "created_by": {
      "id": 2,
      "full_name": "Nguyễn Văn A"
    },
    "items": [
      {
        "id": 1,
        "ingredient_name": "Bột mì",
        "quantity_required": 50.00,
        "unit": "kg",
        "percentage": 50.00,
        "supplier": "Nhà cung cấp A",
        "batch_number": "BATCH-001"
      }
    ],
    "inventory_check": {
      "all_available": false,
      "missing_items": [
        {
          "ingredient_name": "Bột nở",
          "required": 1.00,
          "available": 0.50
        }
      ]
    },
    "created_at": "2026-01-10T10:00:00Z",
    "updated_at": "2026-01-10T10:00:00Z"
  }
}
```

---

#### POST `/schedules`
Tạo lịch đặt mới

**Request:**
```json
{
  "planned_date": "2026-01-20",
  "planned_time": "09:00:00",
  "quantity": 150.00,
  "unit": "kg",
  "priority": "high",
  "notes": "Lịch đặt cho tuần sau",
  "items": [
    {
      "ingredient_name": "Bột mì",
      "quantity_required": 75.00,
      "unit": "kg",
      "percentage": 50.00
    },
    {
      "ingredient_name": "Đường",
      "quantity_required": 45.00,
      "unit": "kg",
      "percentage": 30.00
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "schedule_code": "PM-20260120-001",
    "planned_date": "2026-01-20",
    "planned_time": "09:00:00",
    "quantity": 150.00,
    "status": "pending",
    "created_at": "2026-01-10T11:00:00Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "planned_date": "Date cannot be in the past",
    "items": "At least one item is required"
  }
}
```

---

#### PUT `/schedules/:id`
Cập nhật lịch đặt (chỉ khi status = pending)

**Request:**
```json
{
  "planned_date": "2026-01-21",
  "planned_time": "10:00:00",
  "quantity": 200.00,
  "notes": "Cập nhật số lượng"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "schedule_code": "PM-20260115-001",
    "planned_date": "2026-01-21",
    "updated_at": "2026-01-10T12:00:00Z"
  }
}
```

---

#### DELETE `/schedules/:id`
Xóa lịch đặt (chỉ khi status = pending và là người tạo hoặc admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Schedule deleted successfully"
}
```

---

#### POST `/schedules/:id/approve`
Duyệt lịch đặt (planner/admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "approved",
    "approved_by": 1,
    "approved_at": "2026-01-10T13:00:00Z"
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Cannot approve schedule: insufficient inventory"
}
```

---

#### POST `/schedules/:id/start`
Bắt đầu sản xuất (operator only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "in_progress",
    "updated_at": "2026-01-15T08:00:00Z"
  }
}
```

---

#### POST `/schedules/:id/complete`
Hoàn thành lịch đặt (operator only)

**Request:**
```json
{
  "actual_quantity": 98.50,
  "notes": "Hoàn thành với số lượng thực tế"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "completed_at": "2026-01-15T10:30:00Z"
  }
}
```

---

#### POST `/schedules/:id/cancel`
Hủy lịch đặt

**Request:**
```json
{
  "reason": "Thiếu nguyên liệu"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "cancelled"
  }
}
```

---

## 📦 Inventory

### Endpoints

#### GET `/inventory`
Lấy danh sách nguyên liệu

**Query Parameters:**
- `page`, `limit`
- `search` (tìm theo tên)
- `low_stock` (true/false - chỉ lấy hàng sắp hết)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "ingredient_name": "Bột mì",
        "current_quantity": 500.00,
        "unit": "kg",
        "min_threshold": 100.00,
        "max_capacity": 1000.00,
        "location": "Kho A",
        "supplier": "Nhà cung cấp A",
        "category": "Bột",
        "status": "sufficient", // sufficient, low, out_of_stock
        "last_updated": "2026-01-10T09:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

#### GET `/inventory/:id`
Lấy chi tiết nguyên liệu

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ingredient_name": "Bột mì",
    "current_quantity": 500.00,
    "unit": "kg",
    "min_threshold": 100.00,
    "location": "Kho A",
    "transactions": [
      {
        "id": 1,
        "type": "in",
        "quantity": 100.00,
        "reference_type": "purchase",
        "created_at": "2026-01-10T08:00:00Z"
      }
    ]
  }
}
```

---

#### POST `/inventory`
Thêm nguyên liệu mới (warehouse/admin only)

**Request:**
```json
{
  "ingredient_name": "Bột gạo",
  "current_quantity": 200.00,
  "unit": "kg",
  "min_threshold": 50.00,
  "location": "Kho B",
  "supplier": "Nhà cung cấp B"
}
```

---

#### PUT `/inventory/:id`
Cập nhật nguyên liệu

**Request:**
```json
{
  "current_quantity": 450.00,
  "min_threshold": 120.00
}
```

---

#### POST `/inventory/:id/transaction`
Thêm giao dịch nhập/xuất

**Request:**
```json
{
  "type": "in", // hoặc "out"
  "quantity": 50.00,
  "reference_type": "purchase",
  "reference_id": 123,
  "notes": "Nhập hàng từ đơn hàng #123"
}
```

---

## 📊 Reports

### Endpoints

#### GET `/reports`
Lấy danh sách báo cáo đã tạo

**Query Parameters:**
- `page`, `limit`
- `report_type`
- `date_from`, `date_to`

---

#### POST `/reports/generate`
Tạo báo cáo mới

**Request:**
```json
{
  "report_type": "daily", // daily, weekly, monthly, custom
  "date_from": "2026-01-01",
  "date_to": "2026-01-31",
  "filters": {
    "status": ["completed"],
    "priority": ["high"]
  },
  "format": "pdf" // pdf, excel
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "file_path": "/reports/report_20260115_123456.pdf",
    "download_url": "https://api.premixtrack.com/reports/report_20260115_123456.pdf",
    "file_size": 245760,
    "created_at": "2026-01-15T10:00:00Z"
  }
}
```

---

#### GET `/reports/:id/download`
Tải file báo cáo

**Response:** File binary (PDF/Excel)

---

#### GET `/reports/stats`
Thống kê nhanh

**Response (200):**
```json
{
  "success": true,
  "data": {
    "today": {
      "total": 5,
      "pending": 2,
      "approved": 1,
      "in_progress": 1,
      "completed": 1
    },
    "this_week": {
      "total": 25,
      "completed": 20,
      "completion_rate": 80.0
    },
    "this_month": {
      "total": 100,
      "total_quantity": 10000.00
    },
    "low_stock_items": 3
  }
}
```

---

## 🔔 Notifications

### Endpoints

#### GET `/notifications`
Lấy thông báo

**Query Parameters:**
- `unread_only` (true/false)
- `type` (info, warning, error, success)
- `limit` (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "Lịch đặt mới",
        "message": "Bạn có lịch đặt mới: PM-20260115-001",
        "type": "info",
        "is_read": false,
        "created_at": "2026-01-10T10:00:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

---

#### PUT `/notifications/:id/read`
Đánh dấu đã đọc

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_read": true
  }
}
```

---

#### PUT `/notifications/read-all`
Đánh dấu tất cả đã đọc

---

## 👥 Users (Admin only)

### Endpoints

#### GET `/users`
Lấy danh sách users

#### GET `/users/:id`
Lấy chi tiết user

#### POST `/users`
Tạo user mới

#### PUT `/users/:id`
Cập nhật user

#### DELETE `/users/:id`
Xóa user (soft delete)

---

## ⚠️ Error Responses

Tất cả lỗi đều có format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional - chi tiết lỗi validation
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (chưa đăng nhập hoặc token hết hạn)
- `403` - Forbidden (không có quyền)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔒 Authorization Rules

| Endpoint | Admin | Planner | Operator | QC | Warehouse |
|----------|-------|---------|----------|----|-----------| 
| GET /schedules | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /schedules | ✅ | ✅ | ❌ | ❌ | ❌ |
| PUT /schedules | ✅ | ✅* | ❌ | ❌ | ❌ |
| DELETE /schedules | ✅ | ✅* | ❌ | ❌ | ❌ |
| POST /schedules/:id/approve | ✅ | ✅ | ❌ | ❌ | ❌ |
| POST /schedules/:id/start | ✅ | ✅ | ✅ | ❌ | ❌ |
| POST /schedules/:id/complete | ✅ | ✅ | ✅ | ❌ | ❌ |
| GET /inventory | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /inventory | ✅ | ❌ | ❌ | ❌ | ✅ |
| PUT /inventory | ✅ | ❌ | ❌ | ❌ | ✅ |
| GET /reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| POST /reports/generate | ✅ | ✅ | ❌ | ❌ | ❌ |
| GET /users | ✅ | ❌ | ❌ | ❌ | ❌ |

*Chỉ có thể sửa/xóa lịch do chính mình tạo và khi status = pending

---

## 📝 Notes

1. Tất cả endpoints (trừ `/auth/login` và `/auth/register`) đều cần JWT token trong header
2. Pagination mặc định: page=1, limit=10
3. Dates format: ISO 8601 (YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm:ssZ)
4. Số lượng: Decimal với 2 chữ số thập phân
5. Rate limiting: 100 requests/minute per IP (production)

---

File này sẽ được cập nhật khi có thay đổi trong API design.
