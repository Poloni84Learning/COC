# Cập nhật thư viện chữ Việt / Anh

Nguồn chữ: `all-7-fonts-json.zip`. Quy tắc: [quy-tac-ghep.md](quy-tac-ghep.md).

Hệ thống xử lý chuỗi nhập bất kỳ, không có mẫu tọa độ dành riêng cho một từ. Cả 7 phông hỗ trợ a–z, A–Z, đủ 12 nguyên âm × 6 thanh × 2 kiểu hoa/thường, Đ/đ, chữ số và 41 dấu câu/ký hiệu. NFC và Unicode dấu tách cho cùng bản dựng. Dòng mới và khoảng trắng được giữ lại; chuỗi vượt lưới hoặc ngân sách bị chặn toàn bộ.

Chữ gốc và dấu được ghép bằng OR trong khung gốc, giữ baseline riêng của mỗi phông. Các công thức `nguyen|…` hợp lệ được giữ nguyên theo R9. Advance và kerning lấy từ phông tương ứng; số và dấu câu dùng đường bao của phông khi không có trong thư viện pixel. Khi làm thanh chữ, nét chữ được rút xuống nét đơn; dấu dựng theo R1–R8 với kích thước tối thiểu để sáu thanh còn phân biệt được trên ô game.

Các vấn đề trong dữ liệu đầu vào được phát hiện và xử lý theo quy tắc chung:

- **Caveat:** 44 ký tự có công thức trỏ đến cùng hình thay thế. Danh sách metadata chỉ ghi 43 ký tự và thiếu `ỉ`. Các ký tự này được ghép lại từ chữ gốc, dấu phụ và dấu thanh.
- **Coiny:** mẫu `ắ` và `ẳ` trùng tọa độ; dựng lại dấu để phân biệt.
- **Dancing Script:** mẫu `Ẫ` và `Ẵ` trùng tọa độ; dựng lại dấu phụ tương ứng.
- Cả 7 thư viện có base `ı` rỗng. Tạo thân chữ không chấm từ `i` trong cùng khung. Các mẫu `ị` còn chấm phía trên được bỏ chấm theo R6, giữ thân và dấu nặng.

Phát hiện mẫu trùng dựa trên toàn bộ tọa độ glyph, không dựa trên tên người hay danh sách từ. Những mẫu hợp lệ giữ nguyên dữ liệu cung cấp. Các file JSON tách từ ZIP được lưu trong `src/lib/font-library/` để đối chiếu; `npm run fonts:prepare` tái nhập ZIP và chuẩn bị phông hỗ trợ.

Giao diện có 7 lựa chọn phông với mẫu xem trước lấy từ nội dung đang nhập. Các nút chọn từ mẫu và thư viện hình đã được tạm gỡ. Mẫu hình cũ được nhập lại vẫn giữ tọa độ; nhập chữ hoặc chọn phông sẽ chuyển sang tạo chữ.

Kiểm tra bằng `npm test`, `npm run test:e2e` và `npm run build`. Bộ kiểm tra duyệt 237 ký tự trên 7 phông × 3 cỡ, kiểm tra đủ sáu thanh trong từng họ nguyên âm, Unicode dấu tách, chuỗi Việt/Anh chưa có mẫu, baseline, R6/R9, ngoại lệ nguồn, lưu/chia sẻ và khôi phục bản nháp cũ. Xem ảnh giao diện bằng `node scripts/capture-ui.mjs` khi Vite đang chạy.
