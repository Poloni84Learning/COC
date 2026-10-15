# Wallcraft — web tạo hình tường COC

## Chạy web

Yêu cầu Node.js 24+.

```powershell
npm install
npm run dev
```

Mở http://127.0.0.1:5173. Build tĩnh: `npm run build`; xem build: `npm run preview` (http://127.0.0.1:4173). Có thể đưa nội dung `dist/` lên một host web tĩnh. Chưa triển khai lên Internet trong phiên này.

## Chức năng

- Mặc định chữ dùng **nét đơn**, bỏ phần tô đặc bên trong nhưng giữ đường nối và dấu. “Tự căn vừa” không tự tăng chữ lên cỡ lớn nhất; ưu tiên cỡ hiện tại tối đa Vừa, thu nhỏ nếu cần. Có nút **Làm thanh chữ & thêm họa tiết** để dựng lại bản nháp cũ.
- Tường còn dư được tính cho họa tiết phụ: cặp hình thoi hai bên và nét lượn dưới. Vùng trên chữ dành cho dấu tiếng Việt. Mỗi nhóm được thêm trọn vẹn khi đủ ngân sách và khoảng trống, không chạm chữ/ra ngoài làng; tối đa 64 viên cho nhóm phụ. Có thể tắt. Bảng ngân sách tách nét chữ, họa tiết và số còn lại. Tường chưa dùng được để dư.

- Town Hall 1–18, số tường và cấp tường tương ứng.
- Chín phông từ tài liệu mới: **Dancing Script, Allura, Great Vibes, Caveat, Alex Brush, Pinyon Script, Bad Script, Qwigley, Charm**. Áp dụng cho nội dung tiếng Việt hoặc tiếng Anh bất kỳ, giữ dấu và hoa/thường. Tối đa 120 ký tự; ký tự ngoài bảng hỗ trợ được báo và thay bằng dấu hỏi.
- Nét thanh dựng riêng thân chữ, mũ/trăng/móc và thanh theo [quy tắc ghép](quy-tac-ghep.md) cho đủ 144 dạng nguyên âm hoa/thường, thêm Đ/đ; NFC và Unicode tổ hợp cho cùng mẫu. Hỗ trợ a–z, A–Z, chữ số và 41 dấu câu/ký hiệu; khoảng cách dòng tính cả dấu và đuôi chữ. Cỡ vừa cân đối nhất, cỡ nhỏ giữ dấu đủ lớn để đọc được. [Đối chiếu thư viện và ngoại lệ dữ liệu](lettering-library-review.md).
- Ghép chữ trên cùng baseline của phông, giữ advance và kerning trước khi chuyển sang ô tường ở hệ trục cuối. Mẫu xem trước của mỗi phông lấy từ nội dung đang nhập. Không có bộ mẫu dành riêng cho một từ; có tùy chọn nét lượn hoặc dải kiếm bên dưới chữ.
- Enter xuống dòng; kích thước, nét dày, khoảng cách, đường viền và tự căn vừa Town Hall. Mẫu vượt lưới 44 × 44 hoặc vượt số tường sẽ dừng toàn bộ, hiện lý do và khóa vẽ/xuất/chia sẻ. Không cắt hoặc tự ngắt dòng làm biến dạng nội dung.
- Hai hệ trục dựng: **Chéo 45° · Theo game** (mặc định, chữ nằm ngang trong góc nhìn làng, có bù độ nén phối cảnh) và **Theo ô vuông** (đọc từ bản vẽ nhìn trên). Đây là thay đổi tọa độ tường thật, độc lập với nút đổi góc nhìn.
- Thư viện hình đã được tạm gỡ khỏi giao diện. Mẫu hình cũ nhập lại vẫn giữ tọa độ và có thể chỉnh tay/xuất; nhập chữ hoặc chọn phông để tạo bản dựng chữ.
- Bản vẽ từ trên và góc nhìn làng với ảnh game, vẽ/xóa bằng con trỏ, hoàn tác/làm lại, xoay/lật/dịch, chỉnh bằng tọa độ cho bàn phím và điện thoại.
- Xếp công trình/bẫy theo TH, tránh các ô tường và kiểm tra vị trí. Dùng cấu hình công trình nâng tối đa, tính các phòng thủ đã ghép; B.O.B. là tùy chọn. Không gồm công trình chế tạo theo mùa, trang trí và chướng ngại vật.
- Xuất PNG, JSON có thể nhập lại, CSV tọa độ, chia sẻ chính xác qua URL hash, lưu bản nháp trên thiết bị. Không cần tài khoản hoặc API key.
- Gắn link base thật đã tạo trong game. Link phải đúng miền Supercell và đúng Town Hall; chỉnh mẫu sẽ gỡ link. Không xác minh được link có còn tồn tại hoặc khớp mẫu.

## Link base

Chưa có tích hợp công khai được xác minh để gửi tọa độ từ web và tạo ID layout trên máy chủ Supercell. Link chia sẻ web không nhập trực tiếp vào COC. Xếp theo bản vẽ trong game → Share Layout → gắn link thật vào Wallcraft. Xem [nghiên cứu nguồn](link-base-research.md).

Link web dùng địa chỉ nơi mở web. Khi chạy localhost, người khác cần chạy cùng web hoặc thay phần origin bằng địa chỉ web đã triển khai; dữ liệu mẫu nằm trong hash. Không tự tạo URL `link.clashofclans.com` giả.

## Dữ liệu

`public/game-data.json` chứa dữ liệu TH và số lượng công trình, `public/sprites/` có 449 PNG nhỏ tối ưu từ gói COC đã có. TH18 được sửa số tường từ 400 thành 325. Các số lượng gắn với một ngày đối chiếu, không tự cập nhật từ server game.

Tạo lại tài nguyên: `npm run data:prepare`. Font giao diện Be Vietnam Pro được lưu trong `public/fonts`; cập nhật bằng `node scripts/prepare-font.mjs`. Font tạo tường nằm trong `public/fonts/art`, có giấy phép OFL và nguồn đi kèm. Chạy `npm run fonts:prepare` để tái tạo `src/lib/art-glyphs.json`. Web chạy độc lập với Google Fonts. Nguồn sprite được nhúng trong metadata PNG.

Hệ trục chéo biến đổi đường cong liên tục bằng `x = u/2 + v`, `y = -u/2 + v` trước khi quy thành ô nguyên. Chữ được raster hóa theo diện tích bằng quy tắc nonzero winding, lấy mẫu 4 × 4 mỗi ô; nét mẫu hình được lấy mẫu dọc đường cong. Không phóng to bitmap hoặc nối mọi ô kề sau xoay, vì làm vậy có thể bít khoảng rỗng và làm phình nét. Với phép chiếu làng `(x−y, (x+y)/2)`, trục chữ `u` thành phương ngang, `v` thành phương dọc. Mẫu v1 cũ giữ nguyên tọa độ khi nhập, chuyển mã font/mẫu đã gỡ sang lựa chọn mới cho lần tạo lại.

Vẽ tay dừng nét ngay khi con trỏ ra ngoài làng; kéo trở lại không nối tiếp nét cũ. Nhập tọa độ ngoài 0–43 bị từ chối. Đổi xuống TH không đủ tường cho mẫu đã sửa tay bị chặn để giữ mẫu. Mẫu quá giới hạn sinh tự động có thể được tự căn lại, sửa chữ, đổi font hoặc tăng TH.

## Kiểm tra

```powershell
npm test
npm run test:vietnamese
npm run test:e2e
npm run build
```

Các kiểm tra thuật toán duyệt 237 ký tự trên 9 phông × 3 cỡ, đầy đủ tổ hợp nguyên âm/thanh tiếng Việt và 41 dấu câu, NFC/NFD, phân biệt sáu thanh trong cùng họ, baseline, R6/R9 và sửa các mẫu nguồn bị trùng. Bao gồm chuỗi Việt/Anh bất kỳ, ngân sách qua 18 TH, nét đơn, phân bổ tường phụ, hai hệ trục, sát biên/vượt một ô, đặt công trình không chồng ô, chia sẻ/nhập, di trú v1 và URL game. Script `test:vietnamese` ghi báo cáo quét 4.977 ca ký tự. 11 kiểm tra trình duyệt bao gồm nhập chữ trực tiếp, đủ 9 phông, xác nhận không còn nút từ mẫu/thư viện hình, họa tiết dư, nét dưới chữ, xuất file thật, nhập lại, lịch sử, dừng nét ngoài biên, khôi phục cảnh báo và giao diện điện thoại.

Khi Vite đang chạy, dùng `npm run review:vietnamese` để tạo gallery 112 bảng 3D tại `.impeccable/review/vietnamese-full/index.html`. Dùng `node scripts/capture-ui.mjs` để xem desktop/điện thoại và cả 9 phông. Bài kiểm tra tọa độ không thay thế việc xem hình; ô game hạn chế độ chi tiết ở cỡ nhỏ. Các báo cáo cũ về ba phông chỉ còn là lịch sử đối chiếu.

Nếu chưa có Chromium: `npx playwright install chromium`. Có thể đặt `WALLCRAFT_BROWSER` trỏ đến Chromium có sẵn. Bài kiểm tra tự tìm Chromium Playwright đã có trên Windows; nơi khác dùng browser mặc định của Playwright.

## Cấu trúc

`src/lib/letter-composer.ts`: dựng nét thanh và dấu theo quy tắc chung. `src/lib/font-library/`: bảy thư viện gốc tách từ ZIP. `src/lib/centerline.ts`: lấy ô dọc nét đơn, bảo toàn đoạn thẳng. `scripts/vietnamese-corpus.mjs`: bảng ký tự và chuỗi dùng chung cho quét, bài kiểm tra và gallery.

`src/lib/engine.ts`: dựng ô, giới hạn, hệ trục, đặt công trình, kiểm tra link và tuần tự hóa. `src/lib/art-fonts.ts`: ghép pixel, giữ baseline và phục hồi mẫu nguồn bị lỗi; `art-glyphs.json`: advance, kerning và đường bao hỗ trợ. `scripts/prepare-art-fonts.mjs`: tái nhập ZIP và chuẩn bị tài nguyên cho 9 phông. `src/lib/vector-art.ts`: raster hóa trực tiếp lên lưới cuối. `src/lib/patterns.ts`: dữ liệu hình cũ cho tương thích bản nháp. `src/lib/render.ts`: vẽ cùng tọa độ theo hai góc nhìn và xuất PNG. `src/App.tsx`: bàn dựng, lịch sử, lưu/nhập/xuất. `scripts/prepare-web-data.mjs`: sinh dữ liệu và ảnh web từ gói COC, giữ nguyên kho ảnh gốc.
