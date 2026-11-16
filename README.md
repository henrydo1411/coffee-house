# Coffee House — React + Express + MongoDB

Bản hoàn thiện chức năng cho Mock Project CoffeeShop. Giữ Create React App, React Router, Context API, Axios; thay JSON Server bằng Express + MongoDB/Mongoose.

## 1. Chạy trên Windows

Cần Node.js từ 20.19 trở lên và một MongoDB đang hoạt động. Có thể dùng MongoDB local hoặc URI MongoDB Atlas hiện có. MongoDB Compass chỉ là ứng dụng quản lý, không thay thế MongoDB server.

Giải nén dự án vào thư mục mới, mở thư mục `coffee-house` bằng VS Code.

### Terminal 1 — Backend

```powershell
cd backend
npm ci
Copy-Item .env.example .env
```

Mở `backend/.env`, cấu hình:

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/coffee_house
JWT_SECRET=replace-with-a-long-random-secret-before-running
CLIENT_URL=http://localhost:3000
ADMIN_EMAIL=admin@coffeehouse.local
ADMIN_PASSWORD=CoffeeHouse123!
```

- Nếu đã dùng Atlas: thay `MONGODB_URI` bằng connection string của bạn, điền đúng mật khẩu database user và tên database. Atlas phải cho phép kết nối từ IP hiện tại.
- Nếu dùng local: MongoDB server/service phải được khởi động trước. URI mẫu dùng database `coffee_house`.
- Tạo chuỗi ngẫu nhiên cho `JWT_SECRET` bằng lệnh sau rồi dán kết quả vào `.env`:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Tạo dữ liệu mẫu rồi chạy API:

```powershell
npm run seed
npm run dev
```

Chạy seed sau khi cấu hình xong MongoDB. Seed chỉ bổ sung danh mục/sản phẩm chưa có theo tên và tạo admin nếu email chưa tồn tại; không xóa đơn, tài khoản hoặc menu hiện có. Chạy seed lại không đổi mật khẩu/quyền của tài khoản đã tồn tại. Nên dùng database mới để demo bản này, vì database cũ có thể còn đơn với số điện thoại kiểu Number hoặc dữ liệu khác schema.

API chạy tại `http://localhost:5000/api`. Mở `http://localhost:5000/api/health` phải nhận `{"status":"ok"}`.

### Terminal 2 — Frontend

Mở terminal mới tại thư mục gốc `coffee-house`:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm start
```

Mở `http://localhost:3000`. Giữ cả hai terminal đang chạy.

Tài khoản admin mới theo `.env.example`:

- Email: `admin@coffeehouse.local`
- Password: `CoffeeHouse123!`

Đây là tài khoản mẫu local. Nếu bạn đổi `ADMIN_EMAIL`/`ADMIN_PASSWORD` trước khi seed, dùng thông tin bạn đã đặt. Khách hàng đăng ký ngay trên giao diện; không có tài khoản khách được tạo sẵn.

Không chạy JSON Server. `frontend/src/data/db.json` chỉ còn menu mẫu cho seed, không phải database của ứng dụng. Giỏ/tài khoản JSON Server cũ không được tự động di chuyển sang MongoDB.

## 2. Chức năng đã triển khai

### Khách hàng

- Trang chủ, menu, tìm theo tên và lọc danh mục, trang chi tiết công khai.
- Đăng ký, đăng nhập JWT, khôi phục và kiểm tra phiên khi tải lại trang, đăng xuất.
- Chọn size, đường, đá, topping, số lượng 1–99 và ghi chú.
- Giỏ hàng lưu localStorage riêng theo `_id` tài khoản; ghi chú khác nhau không bị gộp.
- Tăng/giảm/xóa món, tính tổng và tiếp tục mua sắm.
- Checkout với thông tin người nhận, số điện thoại Việt Nam, địa chỉ, ghi chú và COD.
- Kiểm tra giá/tình trạng món trước khi đặt; khi giá đổi cần xác nhận bằng cách đặt lại sau khi xem tổng mới.
- Backend lấy giá từ database, không tin giá/tổng/quyền/người đặt do frontend gửi lên.
- Thông báo thành công và lịch sử/chi tiết đơn của chính tài khoản.

### Admin

- Dashboard: doanh thu đơn Completed, số đơn Pending, số sản phẩm, số tài khoản và đơn gần nhất.
- Thêm, sửa, xóa sản phẩm; ảnh bằng URL, danh mục và Available/Unavailable.
- Thêm, đổi tên, xóa danh mục; không xóa danh mục còn sản phẩm.
- Xem/tìm sản phẩm, xem/lọc đơn, chi tiết người nhận và lựa chọn từng món.
- Trạng thái: Pending → Confirmed → Completed; Pending/Confirmed có thể Cancelled. Đơn Completed/Cancelled không được mở lại.
- Xem/sửa tên, email, vai trò người dùng và xóa khách hàng; không trả mật khẩu ra API.
- Không tự xóa hoặc tự bỏ quyền admin; muốn xóa admin khác phải đổi họ thành customer trước.
- Xóa sản phẩm/tài khoản không xóa snapshot các đơn đã đặt.

### Giao diện

Tông xanh lá/kem, trang chủ có minh họa CSS, thẻ sản phẩm, ảnh dự phòng, menu mobile, form và bảng có trạng thái tải/lỗi/rỗng. Các bảng có vùng cuộn ngang trên màn hình nhỏ. Toàn bộ giao diện dùng tiếng Anh để giữ nhất quán với dự án gốc.

## 3. Quy tắc demo

- VND; size và topping hiện cùng giá niêm yết. Chưa có bảng phụ phí.
- COD, không thanh toán online; không thu phí giao hàng trong bản demo.
- Available/Unavailable là trạng thái bán, chưa có kho nguyên liệu hoặc tồn kho định lượng.
- Ảnh sản phẩm dùng URL bên ngoài, có ô dự phòng nếu ảnh không tải được. Chưa upload ảnh.
- Đăng nhập bắt buộc để dùng giỏ và đặt hàng; có thể xem menu/chi tiết khi chưa đăng nhập.
- Giỏ nằm trên trình duyệt, không đồng bộ giữa thiết bị.
- Lịch sử đơn được lưu MongoDB và có thể xem lại khi đăng nhập từ thiết bị khác.
- Không có email/SMS thật, reset mật khẩu, coupon hay hệ thống vận chuyển.

## 4. Cấu trúc

| Thư mục/file | Vai trò |
| --- | --- |
| `backend/app.js` | Express app, middleware và API routes |
| `backend/server.js` | Đọc cấu hình, kết nối MongoDB, mở cổng |
| `backend/src/models` | Schema MongoDB |
| `backend/src/controllers` | Logic auth, menu, user, order |
| `backend/src/middleware` | Kiểm tra phiên/quyền và xử lý lỗi |
| `backend/src/utils/helpers.js` | Kiểm tra dữ liệu nhập |
| `backend/seed.js` | Thêm dữ liệu mẫu mà không xóa dữ liệu cũ |
| `backend/tests` | Kiểm thử API với MongoDB tạm riêng |
| `frontend/src/services/api.js` | Axios chung, URL API và gắn JWT |
| `frontend/src/context` | Phiên đăng nhập và giỏ hàng |
| `frontend/src/pages` | Các trang khách hàng |
| `frontend/src/Admin` | Các trang quản trị |
| `frontend/src/components/UI.js` | Thành phần dùng chung và lấy dữ liệu |
| `frontend/src/index.css` | Giao diện và responsive |
| `API.md` | Hợp đồng API |
| `TEST_REPORT.md` | Kết quả kiểm thử và phạm vi xác nhận |

## 5. Kiểm thử/build

Backend:

```powershell
cd backend
npm test
```

Test tự chạy MongoDB tạm bằng `mongodb-memory-server`, không đọc `.env` và không dùng database của bạn. Lần đầu cần internet để tải binary MongoDB. Database test bị hủy sau khi test.

Frontend:

```powershell
cd frontend
npm test -- --watchAll=false --runInBand
npm run build
```

React tests kiểm tra luồng với API mô phỏng; backend tests kiểm tra API với MongoDB thật riêng biệt. `setupTests.js` và ánh xạ Jest trong package.json giúp công cụ test của CRA làm việc với React Router 7.

## 6. Kiểm tra demo trước báo cáo

1. Đăng ký khách mới, đăng xuất và đăng nhập lại.
2. Lọc Coffee/Cake, tìm món, xem chi tiết và thêm hai món có ghi chú khác nhau.
3. Tải lại trang: giỏ vẫn còn. Đổi tài khoản: không thấy giỏ của người trước.
4. Đặt COD, mở My orders và kiểm tra số điện thoại còn số 0 đầu.
5. Admin vào Orders xác nhận rồi hoàn tất đơn; khách refresh My orders thấy trạng thái mới.
6. Admin thêm/sửa/xóa một món mẫu và danh mục trống; thử xóa danh mục còn món để thấy thông báo.
7. Thử đặt món bị chuyển Unavailable; giỏ vẫn còn và có thông báo xử lý.
8. Mở DevTools kiểm tra responsive, ảnh, khoảng cách và cuộn bảng trên điện thoại thực tế.

## 7. Lỗi cấu hình thường gặp

| Hiện tượng | Cách xử lý |
| --- | --- |
| Không kết nối được backend | Giữ terminal backend chạy, kiểm tra cổng 5000 và `/api/health` |
| MongoDB connection failed | Kiểm tra server local hoặc URI, mật khẩu và IP allowlist Atlas |
| CORS / không gọi được API từ frontend | Mở frontend tại `http://localhost:3000`, khớp `CLIENT_URL`; nếu đổi host/port, sửa `.env` ở cả hai bên rồi khởi động lại |
| Port already in use | Dừng tiến trình cũ hoặc đổi PORT và REACT_APP_API_URL cho khớp |
| Sửa `.env` nhưng không thấy đổi | Khởi động lại backend/frontend; cấu hình CRA được đọc khi start/build |
| Admin cũ không đăng nhập bằng mật khẩu mẫu mới | Seed không đổi mật khẩu tài khoản đã tồn tại; dùng tài khoản cũ hoặc database demo mới |
| Đổi JWT_SECRET và bị đăng xuất | Đăng nhập lại để lấy token mới |
| Ảnh không hiển thị | URL bên ngoài có thể hết hiệu lực; sửa URL trong Admin → Products |

## 8. Giai đoạn nâng cấp tiếp

Bản này tập trung chạy chức năng local. Các phần cho vận hành web sẽ là bước sau: chiến lược lưu/refresh/revoke token, giới hạn request, logging/monitoring, phân trang/index theo tải thực tế, chống đơn trùng ở phía server khi retry mạng, backup/restore, load testing, CI/CD và cấu hình triển khai. Chưa triển khai production hoặc thực hiện load test trong phiên này.

Mật khẩu được băm, API admin được kiểm tra quyền và dữ liệu đầu vào đã có kiểm tra cơ bản. Token vẫn nằm trong localStorage theo cách phù hợp bản luyện tập hiện tại; cần đánh giá lại cơ chế phiên trước khi nhận người dùng thật.
