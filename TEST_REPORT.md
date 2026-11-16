# Kết quả kiểm thử — 13/11/2026

## Đã thực hiện

| Kiểm tra | Kết quả | Phạm vi |
| --- | --- | --- |
| Backend `npm test` | PASS | 10 nhóm kiểm tra trong 1 bài tổng; Node báo 11 tests, 0 fail |
| Frontend `npm test -- --watchAll=false --runInBand` | PASS | 9 tests, 2 suites, 0 fail |
| Frontend `npm run build` | PASS | Compiled successfully |
| Seed chạy hai lần | PASS | 15 món, 4 danh mục; tài khoản/menu không bị tạo trùng hoặc xóa |
| HTTP smoke check | PASS | Trang SPA trả entry HTML, API đăng nhập admin và CORS cho localhost:3000 hoạt động |

## Backend dùng database thật riêng cho test

`mongodb-memory-server` chạy một tiến trình MongoDB tạm. Express được gọi qua HTTP, không mock model/database. Các kiểm tra bao gồm:

- Băm mật khẩu, chuẩn hóa email, trùng email, mật khẩu ngắn và ép role customer khi đăng ký.
- Đăng nhập đúng/sai, phiên hiện tại, token không hợp lệ.
- Chặn API quản trị với người chưa đăng nhập và customer; không trả mật khẩu trong danh sách user.
- Tạo/sửa/xóa danh mục, trùng tên, tên rỗng và danh mục còn sản phẩm.
- Tạo/lấy chi tiết/lọc/sửa/xóa món; giá và category không hợp lệ, ID sai/không tồn tại.
- Từ chối đơn chưa đăng nhập, giỏ rỗng, số lượng lẻ, lựa chọn không hợp lệ, số điện thoại sai và món Unavailable.
- Tự tính giá từ MongoDB, bỏ qua total/status/user do client gán, giữ số 0 đầu của số điện thoại.
- Cách ly lịch sử đơn theo tài khoản; customer không đọc được toàn bộ đơn.
- Chuyển trạng thái đơn đúng quy tắc; snapshot giá cũ vẫn giữ khi giá món thay đổi.
- Đổi thông tin/quyền/xóa người dùng; chặn tự xóa và tự bỏ quyền admin; token tài khoản đã xóa không dùng tiếp được.
- Xóa sản phẩm không mất tên/giá chi tiết đơn; route không tồn tại trả 404.

## Frontend dùng React Testing Library với API mô phỏng

- Menu lọc theo category, đăng nhập và quay lại trang món, chọn món, thêm giỏ, checkout và xem chi tiết lịch sử đơn.
- Đăng ký: từ chối xác nhận mật khẩu sai, tạo phiên khi thành công.
- Admin: tạo/sửa/xóa danh mục và sản phẩm; sửa người dùng.
- Admin: mở chi tiết đơn, Confirmed → Completed, không còn lựa chọn chuyển tiếp khi đơn đã hoàn tất.
- Khi đặt hàng lỗi: hiển thị lỗi, mở lại nút và không xóa giỏ.
- Giá thay đổi: hiển thị tổng mới, chưa tạo đơn trước khi khách xem lại và đặt lại.
- Gộp món giống nhau; tách món có ghi chú khác nhau.
- Giỏ riêng từng tài khoản, không sao chép giỏ khi đổi tài khoản/đăng xuất.
- Số lượng và xóa giỏ được lưu qua lần mount mới.

## Giới hạn xác nhận

Không dùng database hoặc tài khoản thật của người dùng. Chưa kết nối trực tiếp MongoDB Atlas của người dùng.

Các test giao diện chạy trong jsdom và dùng API mock; chúng không thay thế kiểm thử trên trình duyệt thật. Đã thử kiểm tra trực quan nhưng môi trường trình duyệt không kết nối được server local; chưa xác nhận hình ảnh, khoảng cách và kích thước responsive bằng trình duyệt/điện thoại thật. CSS responsive đã được viết, nhưng cần làm bước kiểm tra trực quan trong checklist README khi chạy trên máy của bạn.

Chưa deploy, load test, thử thanh toán/giao hàng/email thật hoặc kiểm toán bảo mật. Đây là bản chức năng local để tiếp tục phát triển.
