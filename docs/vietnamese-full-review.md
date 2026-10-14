# Kiểm tra tiếng Việt và dấu câu trên mẫu tường 3D

Đã sửa cách dựng dấu và nét đơn, quét đủ bảng ký tự bên dưới và xem trực tiếp toàn bộ 48 bảng ảnh tiếng Việt/dấu câu. Cỡ vừa cân đối nhất: thân chữ thoáng, dấu đủ rõ mà không lấn át chữ. Cỡ nhỏ vẫn cần dấu tương đối lớn để phân biệt trên lưới tường; các chữ hoa nhiều vòng lượn và một số phụ âm chưa có độ dễ đọc đồng đều.

## Phạm vi và bằng chứng

- 12 nguyên âm `a ă â e ê i o ô ơ u ư y` × 6 thanh (ngang, huyền, sắc, hỏi, ngã, nặng) × hoa/thường = **144 dạng**, thêm **Đ/đ**.
- 52 ký tự Alphabet, 10 chữ số và 41 dấu câu/ký hiệu. Sau loại trùng với nguyên âm: **237 ký tự riêng biệt**.
- Ba font Great Vibes, Allura, Charm × ba cỡ nhỏ/vừa/lớn = **2.133 ca ký tự**. Mỗi ca đối chiếu Unicode dựng sẵn NFC với dạng tổ hợp NFD, kiểm tra mẫu không rỗng, đủ ký tự, không trùng ô và nằm trong làng.
- So sánh hình sau chuẩn hóa vị trí trong từng họ sáu thanh; bổ sung kiểm tra dấu khi ghép sau chữ `b`, dấu câu trong `a…a`, cùng 13 chuỗi có tên, ngoặc kép, dấu câu và xuống dòng. Script quét có 117 ca chuỗi theo font/cỡ; autoFit có thể giảm cỡ.
- [Gallery đầy đủ](../.impeccable/review/vietnamese-full/index.html): **48 bảng, 1.704 bản dựng** bằng engine và renderer thật, tường TH16, góc làng 3D, hướng chéo, nét thanh. Có 36 bảng nguyên âm, 9 bảng dấu câu và 3 bảng chuỗi. Ảnh từng ô được cắt/phóng để xem nét, không dùng để so kích thước thực giữa các chữ.
- [Dữ liệu quét](../.impeccable/review/vietnamese-full/scan.json), [dữ liệu ảnh](../.impeccable/review/vietnamese-full/renders.json), [kết quả trước sửa](../.impeccable/review/vietnamese-before/scan.json).
- Đã dựng lại và xem đủ 11 bảng [Alphabet và mẫu hình](../.impeccable/review/alphabet-3d/index.html), gồm 320 bản dựng. Quét Alphabet riêng đạt 468/468 ca.
- Đã xem [giao diện máy tính](../.impeccable/review/art-lettering.png) và [điện thoại](../.impeccable/review/mobile-input.png); không tràn ngang ở 1440 px và 390 px, không ghi nhận lỗi JavaScript trong lượt chụp.

Bộ 41 dấu câu/ký hiệu:

~~~text
. , ; : ! ? … - – — ' " “ ” ‘ ’ « » ( ) [ ] { } / \ & @ # % * + = _ < > $ ^ ` | ~
~~~

Đây là toàn bộ tổ hợp nguyên âm và thanh tiếng Việt hợp lệ trong phạm vi trên, kèm chuỗi đại diện; không phải mọi từ, mọi chuỗi Unicode hoặc mọi tổ hợp tùy chọn giao diện.

## Lỗi đã sửa

| Hạng mục | Trước sửa | Sau sửa |
|---|---:|---:|
| Ca ký tự không đạt kiểm tra kỹ thuật | 252 | 0 |
| Cặp thanh trùng hình trong cùng họ nguyên âm | 39 | 0 |
| Ca chuỗi không tự căn vừa được | 3 | 0 |

1. **Dựng dấu riêng khỏi thân chữ.** Dấu mũ, trăng, móc và thanh có hình vẽ riêng, đặt theo biên thực của thân. Tổ hợp mũ + thanh có khoảng hở; dấu nặng nằm dưới thân. Dấu thanh trên `i` thay chấm, còn `ị` giữ chấm trên và dấu nặng dưới.
2. **Móc Ơ/Ư gắn vào thân.** Điểm neo lấy từ mép thân thực, tránh móc rời trên những chữ hoa có vòng lượn.
3. **Giữ đủ nét đơn.** Nét tự vẽ được lấy ô trực tiếp dọc đường bằng Bresenham sau đơn giản hóa. Cách tô rồi làm mỏng trước đây có thể xóa thân dấu chấm than, gạch ngang hoặc nhánh dấu cộng khi nét rơi vào giữa ô. Kiểm tra mới chạy qua 64 độ lệch vị trí và bốn hướng, đồng thời kiểm tra độ dài các dấu.
4. **Mở thân chữ thường.** Bổ sung nét tự vẽ cho `o/u/y`, nối tiếp nhóm `a/e/m/n/r/i/j/Đ/đ`; cân chiều cao các chữ còn lại để ghép từ nhất quán hơn. Không tăng độ dày để tiêu hết ngân sách.
5. **Bổ sung dấu câu.** Dữ liệu mỗi font hiện có 238 ký tự gồm khoảng trắng. Hầu hết dấu câu có nét đơn riêng; `&` giữ đường bao theo phong cách font. Vẽ lại ngoặc, `%`, `#`, `@` và các ký hiệu để giữ nét phân biệt.
6. **Khoảng cách dòng theo hình thực.** Dòng kế tiếp tính cả dấu trên và nét xuống của dòng trước, tránh chồng tổ hợp dấu trong mẫu `aế\nậy`.

## Đánh giá bằng mắt

| Nhóm | Kết quả quan sát | Giới hạn còn lại |
|---|---|---|
| Nguyên âm, cả hoa/thường | Sắc/huyền có hướng đối nhau; hỏi/ngã có dáng riêng; mũ/trăng và thanh tách rõ hơn; dấu nặng hiện đủ | Cỡ nhỏ phải giữ dấu tương đối lớn; chưa đạt độ tinh tế của chữ viết trên giấy |
| Allura / Uyển chuyển | Tổng thể cân đối nhất cho tên ngắn; `Phúc`, `Đỗ Mỹ`, `Hữu Ý` thoáng, dấu dễ theo dõi | Một số nét giao ở chữ hoa và đuôi `q` vẫn dày; tên dài bị giảm cỡ |
| Charm / Bút nghiêng | Thân nhiều chữ hoa dễ nhận; `Quỳnh`, `Nguyễn` rõ hơn khi ghép tên | A có lòng hẹp, E/F có thanh ngang ngắn; M/W và vài phụ âm thường còn bí ở cỡ nhỏ |
| Great Vibes / Thư pháp | Hợp chữ đầu trang trí; nhóm nguyên âm thường tự vẽ mở hơn trước | O/U/I/J rất cách điệu; `w` và các chỗ giao nét có thể thành cụm dày khi thu nhỏ |
| Dấu câu | Gạch ngang giữ độ dài; `!`, `+`, ngoặc và dấu phần trăm giữ các nét chính | Chấm/phẩy/nháy cần ngữ cảnh dòng để nhận đúng vị trí; ký hiệu phức tạp vẫn khá góc cạnh |
| Ghép tên và xuống dòng | Đã xem 13 chuỗi mỗi font và 24 mẫu tên ở gallery Alphabet; dấu không bị họa tiết trên đầu cạnh tranh | Kết quả tự căn tên dài ưu tiên vừa làng, nên có thể kém thanh hơn tên ngắn |

Tám mẫu hình vẫn nhận được đường bao chính. Kiếm Odin, đầu lâu xuyên kiếm, sen và bướm rõ nhất; cúp có bệ dày, rồng còn nhiều nét ngang sát nhau. Cá chép mới có thân cong và đuôi xòe, dùng 209 tường, nhưng vẫn là biểu tượng cách điệu. Các nhận xét này không được suy ra từ việc bài kiểm tra tự động đạt.

## Tái lập

~~~powershell
npm test
npm run test:vietnamese
npm run test:e2e
npm run build
~~~

Kết quả mã hiện tại: **47 kiểm tra thuật toán + 11 kiểm tra trình duyệt đạt; build thành công**. Bộ 2.133 ca quét là kiểm tra bổ sung, không cộng vào số 58 bài kiểm tra. Build còn cảnh báo kích thước JavaScript lớn; không phải lỗi dựng chữ.

Để tạo lại ảnh, mở Vite bằng `npm run dev`, rồi ở terminal khác:

~~~powershell
npm run review:vietnamese
node scripts/audit-art.mjs
node scripts/capture-ui.mjs
~~~

Các phép kiểm tra khác biệt hình không thay thế đánh giá độ dễ đọc. Ảnh và kết luận thẩm mỹ tập trung vào hướng chéo, nét thanh, sprite TH16; không khẳng định mọi cấp tường và mọi tên đều đẹp như nhau. Bản nháp cũ giữ tọa độ đã lưu; dùng **Làm thanh chữ & thêm họa tiết** để dựng lại bằng thuật toán mới.
