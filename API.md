# Coffee House API

Base URL local: `http://localhost:5000/api`. Body/response dùng JSON. Endpoint có đăng nhập cần header `Authorization: Bearer <token>`.

| Method | Endpoint | Quyền | Mục đích |
| --- | --- | --- | --- |
| GET | `/health` | Public | Kiểm tra API |
| POST | `/auth/register` | Public | Tạo customer và nhận token |
| POST | `/auth/login` | Public | Đăng nhập và nhận token |
| GET | `/auth/me` | Đăng nhập | Kiểm tra phiên, lấy profile hiện tại |
| GET | `/categories` | Public | Danh mục |
| POST | `/categories` | Admin | Tạo danh mục |
| PUT | `/categories/:id` | Admin | Đổi tên danh mục |
| DELETE | `/categories/:id` | Admin | Xóa danh mục không còn sản phẩm |
| GET | `/products` | Public | Menu, có thể truyền `?category=<id>` |
| GET | `/products/:id` | Public | Chi tiết một món |
| POST | `/products` | Admin | Tạo món |
| PUT | `/products/:id` | Admin | Cập nhật toàn bộ trường có thể sửa |
| DELETE | `/products/:id` | Admin | Xóa món |
| GET | `/users` | Admin | Danh sách tài khoản, không có password |
| PUT | `/users/:id` | Admin | Sửa name, email, role |
| DELETE | `/users/:id` | Admin | Xóa customer khác |
| POST | `/orders` | Đăng nhập | Tạo đơn thuộc tài khoản từ JWT |
| GET | `/orders/my` | Đăng nhập | Đơn của chính tài khoản |
| GET | `/orders` | Admin | Toàn bộ đơn |
| PUT | `/orders/:id/status` | Admin | Đổi trạng thái theo chuyển tiếp cho phép |

## Auth

Đăng ký:

```json
{"name":"Customer","email":"customer@example.com","password":"Customer123!"}
```

Đăng nhập: gửi email và password. Kết quả đăng nhập/đăng ký:

```json
{"_id":"<MongoDB ObjectId>","name":"Customer","email":"customer@example.com","role":"customer","token":"<JWT>"}
```

Token hết hạn sau 7 ngày. `/auth/me` trả cùng profile nhưng không trả token. Quyền ở API được đọc lại từ database theo token, không tin role trong localStorage.

## Product

```json
{"name":"Latte","price":40000,"description":"Fresh latte","image":"https://example.com/latte.jpg","category":"<category ObjectId>","status":"Available"}
```

`price` là number, lớn hơn 0 và tối đa 100.000.000. `category` phải tồn tại. `image` có thể là chuỗi rỗng; URL có giá trị phải dùng http/https. GET/POST/PUT trả product với category dạng `{ "_id": "...", "name": "Coffee" }`.

## Order

```json
{
  "customerName":"Customer",
  "customerPhone":"0912345678",
  "customerAddress":"FPT University, Hoa Lac",
  "note":"Call before delivery",
  "items":[
    {"productId":"<product ObjectId>","quantity":2,"size":"Large","sugarLevel":"50%","iceLevel":"Normal Ice","topping":"Pearl","note":"Separate cups"}
  ]
}
```

Không gửi giá/tổng để quyết định đơn: server tự lấy từ Product. Các trường `user`, `total`, `status`, `paymentMethod` từ client không điều khiển giá trị lưu.

Giá trị lựa chọn:

| Trường | Giá trị |
| --- | --- |
| size | Small, Medium, Large |
| sugarLevel | 0%, 50%, 100% |
| iceLevel | No Ice, Less Ice, Normal Ice |
| topping | None, Pearl, Cream |
| quantity | Số nguyên 1–99 |
| customerPhone | 0 + 9 chữ số, hoặc +84 + 9 chữ số |

Đơn có `createdAt`, `updatedAt`, `_id`; từng item có `_id` riêng. Mỗi item lưu snapshot tên/giá/ảnh/options tại lúc đặt. Sản phẩm bị xóa sau đó không làm mất chi tiết lịch sử.

Đổi trạng thái: `{"status":"Confirmed"}`. Pending → Confirmed/Cancelled, Confirmed → Completed/Cancelled. Trạng thái cuối không chuyển tiếp.

## Lỗi

Response dạng `{"message":"..."}`. 400: dữ liệu không hợp lệ; 401: chưa đăng nhập/phiên hết hạn; 403: thiếu quyền; 404: không tìm thấy; 409: trùng dữ liệu, món không bán hoặc trạng thái xung đột; 500: lỗi server. Không trả stack trace ra client.
