# Đánh giá mẫu tường theo góc làng 3D — 2026-10-05

## Cập nhật sau cải thiện

**Lượt kiểm tra mới nhất:** xem [báo cáo đủ tiếng Việt và dấu câu](vietnamese-full-review.md), gồm 2.133 ca ký tự trên ba font/ba cỡ và 48 bảng ảnh đã xem trực tiếp. Gallery Alphabet cũng đã được tạo lại bằng mã hiện tại. Các số liệu và nhận xét tiếp theo ghi lại các lượt trước để đối chiếu.

Đã thay nét a/e/m/n/r/i/j và Đ/đ bằng đường tâm tự vẽ khi chọn nét thanh. Các dấu của a/e/i được dựng riêng, tổ hợp mũ + thanh có khoảng cách rõ; chấm i/j tách khỏi thân. Chiều cao thân chữ thường được cân lại với các nét mới. Họa tiết tự động chỉ còn hai bên và dưới chữ, tránh cạnh tranh với dấu.

Cá chép đã vẽ lại theo thân cong, vây lệch và đuôi xòe, dùng 209 tường ở bản tự căn TH16 (trước 246). Bảng ảnh tại `alphabet-3d/index.html` đã được tạo lại từ mã mới. Quét lại đủ 468 trường hợp Alphabet không có lỗi sinh mẫu; 17 kiểm tra thuật toán và 11 kiểm tra trình duyệt đạt, build thành công.

Ảnh xác nhận a/e có lòng chữ mở hơn, m/n/r có dáng riêng, Đ/đ có thanh ngang rõ và i/j có chấm riêng. Giới hạn còn lại: font Great Vibes vẫn khá dày ở các chữ chưa vẽ lại như u/w; tên dài phải giảm cỡ để vừa làng nên mất một phần chi tiết. Chưa tuyên bố mọi chữ/dấu ở mọi cỡ đều hoàn hảo. Các nhận xét phía dưới là bản đánh giá **trước cải thiện**, giữ lại để đối chiếu.

Phạm vi: quét và tự đánh giá các mẫu hiện có, đủ A–Z và a–z của ba font. Đây là đánh giá chất lượng hình dựng, không phải xác nhận mọi chữ đã đẹp hoặc đã sửa hết lỗi.

## Bằng chứng và cách tái lập

- Chạy Vite tại 127.0.0.1:5173 rồi `node scripts/audit-art.mjs`.
- Script import trực tiếp engine và renderer đang dùng trong ứng dụng; dùng sprite tường TH16, `isometric: true`, hướng chữ diagonal và nét light.
- 468 ca kỹ thuật: 52 ký tự Alphabet × 3 font × 3 cỡ. Không có mẫu trống, ký tự thiếu hay lỗi sinh mẫu ở ngân sách 325.
- 320 mẫu được dựng thành 11 bảng ảnh: toàn bộ chữ hoa/thường của ba font, 44 ký tự tiếng Việt mỗi font, 8 hình và 24 mẫu từ. Đã xem trực tiếp toàn bộ 11 bảng.
- Ảnh trong `.impeccable/review/alphabet-3d/`; mở `index.html`. Dữ liệu từng ca nằm trong `scan.json`. Không có lỗi JavaScript trên trình duyệt trong lượt dựng.
- Chữ đơn xem ở cỡ vừa, không trang trí. Mẫu từ và hình dùng autoFit với ngân sách 325. Ảnh được cắt và phóng đều theo từng ô để đọc hình, không so diện tích giữa các chữ. Các cỡ nhỏ/lớn có kiểm tra kỹ thuật, chưa có đánh giá thị giác toàn bộ.

## Kết luận về chữ

| Font | Điểm tốt | Vấn đề nhìn thấy trong 3D | Đánh giá |
|---|---|---|---|
| Great Vibes / Thư pháp | Chữ hoa có vòng lượn rộng, B/D/P/R/L/Q tạo điểm nhấn tốt | C/G/O rất cách điệu; I/J gần nhau. Chữ thường a/b/d/e/m/n/u/w dồn tường và khoảng âm nhỏ, r mất dáng rõ. Tên Trường/Butterfly bị đặc ở thân chữ | Hợp chữ đầu trang trí; chưa đạt độ đọc đồng đều cho tên dài |
| Allura / Uyển chuyển | C/D/O/P/Q/R/S/T/U/V/X/Z mở và dễ nhận; Phúc/Linh/JayPee thoáng nhất trong ba font | a/e/h/n/r/x/z vẫn có cụm giao nét dày. Tên dài bị giảm cỡ khi autoFit, làm mất sự thoáng. Dấu nhỏ có thể thành chấm đơn | Tốt nhất để dùng tên ngắn hiện tại, chưa phải mọi chữ đều đạt |
| Charm / Bút nghiêng | C/D/G/H/J/K/L/N/O/P/Q/R/S/T/U/V/X/Y đọc khá trực tiếp; tên Quỳnh/Nguyễn rõ thân chữ | E/F thiếu độ dài thanh ngang, M/W chật; e/m/r/s/t/z khó phân biệt ở cỡ nhỏ. i/j không thấy dấu chấm tách rõ trong ảnh hiện tại | Dáng dễ đọc nhưng raster nét nhỏ cần chỉnh |

Các nhóm còn lại trong từng bảng vẫn đã được xem, không có ký tự bị bỏ qua. Chữ cách điệu vốn khác chữ in; không đánh đồng sự khác biệt phong cách với lỗi. Vấn đề ưu tiên là mất nét phân biệt hoặc khoảng âm bị sprite che lấp.

## Dấu tiếng Việt

- Các ký tự mẫu đều có dữ liệu và sinh được tường; điều này không chứng minh dấu đọc được.
- Great Vibes và Allura: D/Đ nhìn gần như trùng, thanh ngang Đ không đủ rõ trong bản dựng. Đây là lỗi nhận diện ưu tiên cao.
- Dấu sắc/huyền thường có hướng nhận ra. Hỏi/ngã và tổ hợp mũ + thanh có ca rút thành cụm vài viên, khó phân biệt, đặc biệt Great Vibes.
- ă/â của Great Vibes thiếu khác biệt hình dấu rõ. Allura tách dấu khỏi thân tốt hơn. Charm thể hiện phần thân Đ rõ hơn hai font còn lại.
- Họa tiết hình thoi phía trên tên dễ cạnh tranh với dấu; trang trí phía dưới/hai bên hợp hơn cho tên tiếng Việt có nhiều dấu.

## Tám mẫu hình

| Mẫu | Tường sau autoFit | Đánh giá 3D |
|---|---:|---|
| Cúp vinh quang | 275 | Nhận ra cúp và dáng nâng; bệ ba tầng hơi dày, phần tay/thân còn trừu tượng |
| Kiếm Odin | 238 | Đạt: trục kiếm, chuôi, hộ thủ và mũi rõ; chữ hai bên cân đối |
| Kiếm hải tặc | 287 | Đạt: đầu lâu và kiếm rõ; mắt có khoảng âm, răng còn sát nhau |
| Phượng hoàng | 239 | Cánh và đuôi cân đối; đầu đơn giản, dễ đọc thành chim biểu tượng hơn phượng chi tiết |
| Long ảnh | 222 | Nhận ra đầu rồng nhìn nghiêng; cổ và hàm có nhiều nét ngang cạnh nhau |
| Liên hoa | 304 | Đạt: cánh ngoài thoáng, cuống và nước rõ; gần ngân sách TH16 |
| Cá chép | 246 | Chưa đạt đặc trưng cá chép: thân đứng gần hình huy hiệu, vây/đuôi đơn giản, thiếu dáng bơi cong |
| Hồ điệp | 305 | Đạt: cánh đối xứng, gân tách rõ, silhouette nhận ra ngay |

## Thứ tự sửa đề xuất từ bằng chứng

1. Bảo toàn dấu chấm i/j và thanh ngang Đ; kiểm tra riêng khác biệt ký tự sau raster hóa.
2. Vẽ nét trung tâm có chủ đích cho các chữ thường bị bí (e/m/n/r/a), thay vì chỉ làm mỏng vùng tô font; giữ khe hở khi nhìn sprite 3D.
3. Tránh họa tiết trên vùng dấu, ưu tiên hai bên/dưới tên.
4. Vẽ lại cá chép với thân cong và đuôi xòe, giảm cụm nét cạnh nhau ở cúp/rồng.

Đợt này thêm công cụ quét, ảnh bằng chứng và báo cáo; không thay đổi thuật toán hoặc tuyên bố các vấn đề trên đã được sửa. Hoàn tất yêu cầu quét/đánh giá đủ Alphabet theo góc làng 3D.
