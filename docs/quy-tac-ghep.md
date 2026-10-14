# Quy tắc ghép chữ tiếng Việt pixel

> Áp dụng cho: vẽ chữ pixel (đen trắng, ô hình thoi hoặc ô vuông), mọi font,
> vẽ tay trên giấy kẻ ô cũng dùng được.
> Thư viện mẫu làm sẵn cho font Dancing Script: `thu-vien/thu-vien-tieng-viet.json`

## 0. Vì sao ghép từ mẫu rời hay bị "rối"?

Ba lỗi phổ biến nhất:

1. **Crop từng chữ rồi xếp khít nhau** — mỗi chữ bị cắt theo khung riêng nên
   baseline (đường chân chữ) lệch nhau, chữ cao chữ thấp.
2. **Font thư pháp có nét nối/chồng lấn** — các chữ script được thiết kế để
   đè lên nhau một phần; xếp khít như xếp gạch sẽ phá vỡ kerning.
3. **Đặt dấu theo cảm tính** — dấu thanh bị lệch sang chữ bên cạnh, dấu chạm
   vào nét chữ, hoặc dấu huyền của `ỳ` rơi sai vị trí.

## 1. Nguyên tắc cốt lõi (3 điều)

- **N1 — Chung một khung tọa độ:** mọi chữ cái và mọi dấu dùng chung một khung
  với **baseline cố định** (hàng pixel số 24 trong thư viện này). Không bao giờ
  crop riêng từng chữ rồi mới ghép.
- **N2 — Ghép = phép cộng pixel:** đặt miếng dấu đúng vị trí tương đối rồi cộng
  (OR) tọa độ vào. Không xóa, không đè (ngoại trừ chữ `i`, xem R6).
- **N3 — Thứ tự xếp chồng** (từ dưới lên): **chữ gốc → dấu phụ → dấu thanh.**

## 2. Phân loại dấu tiếng Việt

| Nhóm | Dấu | Tên | Gắn vào chữ nào |
|---|---|---|---|
| Dấu phụ | `^` | mũ | â, ê, ô |
| Dấu phụ | `˘` | trăng (dấu non) | ă |
| Dấu phụ | `̛` | móc | ơ, ư |
| Thanh trên | `´` | sắc | mọi nguyên âm |
| Thanh trên | `` ` `` | huyền | mọi nguyên âm |
| Thanh trên | `̉` | hỏi | mọi nguyên âm |
| Thanh trên | `~` | ngã | mọi nguyên âm |
| Thanh dưới | `.` | nặng | mọi nguyên âm |
| Đặc biệt | `–` | gạch ngang | d → đ |

Nguyên âm mang dấu trong tiếng Việt: **a, ă, â, e, ê, i, o, ô, ơ, u, ư, y**
(+ in hoa tương ứng).

## 3. Quy tắc vị trí (đơn vị = 1 ô pixel)

- **R1 — Dấu phụ (mũ, trăng):** đặt **phía trên** chữ gốc, **canh giữa** theo
  chiều ngang của chữ, cách nét trên cùng của chữ **1 ô** trắng.
- **R2 — Dấu móc (ơ, ư):** đặt **trên, lệch phải**; chân móc ngang bằng đỉnh
  chữ, cách mép phải của chữ 0–1 ô.
- **R3 — Dấu thanh sắc/huyền/hỏi/ngã:** đặt **trên cùng**; nếu chữ đã có dấu
  phụ thì nằm **trên dấu phụ**, cách dấu phụ **1 ô**; canh giữa theo chữ gốc.
- **R4 — Dấu nặng:** đặt **phía dưới** chữ gốc, canh giữa, cách nét dưới
  cùng **1 ô**.
- **R5 — Khoảng cách an toàn:** dấu không chạm nét chữ (≥ 1 ô trắng), không
  chạm sang chữ bên cạnh.
- **R6 — Chữ `i` + dấu thanh:** **bỏ dấu chấm** của `i` trước khi đặt dấu thanh
  (í, ì, ỉ, ĩ, ị — không bao giờ giữ chấm).
- **R7 — Chữ `đ`:** `d` + gạch ngang ở **giữa thân chữ** (khoảng nửa chiều cao
  x-height), gạch thò ra mỗi bên **1 ô**.
- **R8 — Ghép thành từ:** mọi chữ đặt trên **cùng một baseline** (không canh
  giữa theo chiều dọc). Font script giữ nguyên kerning gốc — cách chắc ăn nhất
  là render/canh cả từ rồi mới tách, chứ không ghép từ chữ rời.

## 4. Công thức ghép (đọc: chữ gốc + các dấu)

```
â = a + mũ        ê = e + mũ        ô = o + mũ
ă = a + trăng     ơ = o + móc       ư = u + móc
đ = d + gạch ngang

X + thanh (X là nguyên âm bất kỳ ở trên):
  ấ = a + mũ + sắc      ắ = a + trăng + sắc     ố = o + mũ + sắc
  ầ = a + mũ + huyền    ữ = u + móc + ngã      ệ = e + mũ + nặng
  ... (mọi tổ hợp đều theo đúng thứ tự N3)
```

## 5. Mẫu pixel các dấu (vẽ tay / tham khảo, `█` = ô đen)

```
sắc ´        huyền `      hỏi ̉        ngã ~
..█          █..          █.          .███..
.█.          .█.          █.          ...███
█..          ..█          .█

nặng .       mũ ^         trăng ˘      móc ̛
██           ..█..        █...█        ██.
██           .█.█.        .█.█.        .█.
             █...█        ..█..        .█.
```

> Các mẫu trên là sơ đồ. Trong thư viện JSON, mọi dấu đã được tách đúng theo
> thiết kế của font (xem `overlays_tach_rieng`).

## 6. Dùng thư viện có sẵn (`thu-vien/thu-vien-tieng-viet.json`)

```python
import json
lib = json.load(open('thu-vien/thu-vien-tieng-viet.json'))
W, H = lib['meta']['canvas']          # 71 x 41, baseline ở hàng 24
print(lib['recipes']['ấ'])            # ['a', 'mu+sac|a']
print(lib['recipes']['ữ'])            # ['u', 'moc+nga|u']
print(lib['recipes']['đ'])            # ['d', 'gach|d']

def compose(char):
    """Ghép 1 chữ hoàn chỉnh: cộng (OR) tọa độ các miếng theo recipes."""
    ink = set()
    for part in lib['recipes'][char]:
        coords = lib['bases'].get(part) or lib['overlays'][part]
        ink |= set(map(tuple, coords))
    return ink                        # tập (x, y) — khớp 100% render từ font
```

- `bases`: 53 chữ cái gốc (a–z, A–Z, ı) dạng danh sách tọa độ `[x, y]`.
- `overlays`: 134 miếng dấu (đã đặt đúng vị trí, chỉ việc cộng vào).
- `overlays_tach_rieng`: từng dấu tách riêng (mũ, sắc, móc...) để tham khảo
  hoặc tự phối theo quy tắc R1–R8.
- `recipes`: công thức từng chữ, ví dụ `'ệ': ['e', 'mu+nang|e']`.
- Đã kiểm chứng: **134/134 chữ ghép bằng quy tắc khớp 100%** với render
  trực tiếp từ font (xem `thu-vien/kiem-chung.png`).

## 7. Đổi sang font khác thì làm sao?

Dùng module `xay_dung_font.py`:

```python
from xay_dung_font import FontBuilder
b = FontBuilder("fonts/TenFont.ttf", "phong-chu/tenfont", "tenfont",
                "Tên Font — mô tả", weight=700,   # None nếu font tĩnh
                stroke=12, thresh=110)            # độ đậm nét & ngưỡng
stats = b.build()   # tự tách dấu, kiểm chứng, xuất JSON + ảnh demo
```

Hoặc thêm spec vào danh sách `FONTS` trong `build_all.py` rồi chạy một lệnh
cho tất cả font. Script tự tách dấu bằng phép trừ ảnh
(`dấu = render(chữ_có_dấu) − render(chữ_gốc)`) rồi kiểm chứng tự động.
Quy tắc R1–R8 không đổi khi đổi font.

---

## Phụ lục A — Thông số và lưu ý theo từng font

Quy tắc N1–N3 và R1–R8 áp dụng chung cho mọi font. Mỗi font khác nhau ở
kích thước khung, vị trí baseline và cách vẽ dấu — bảng dưới đây là thông số
đã đo thực tế (đơn vị: ô pixel):

| Font | Khung (canvas) | Baseline (hàng) | Tỉ lệ | Tách base+dấu | Lưu nguyên chữ | Điểm đen "Quỳnh" |
|---|---|---|---|---|---|---|
| Dancing Script | 71×41 | 24 | 0.02736 | 134/134 | 0 | 211 |
| Allura | 74×42 | 25 | 0.02857 | 134/134 | 0 | 206 |
| Great Vibes | 81×47 | 28 | 0.03144 | 133/134 | 1 (Đ) | 259 |
| Lobster | 70×40 | 24 | 0.02701 | 134/134 | 0 | 278 |
| Playfair Display | 57×33 | 19 | 0.02219 | 134/134 | 0 | 206 |
| Coiny | 57×32 | 19 | 0.02198 | 133/134 | 1 (Ẽ) | 225 |
| Caveat | 87×50 | 30 | 0.03357 | 91/134 | 43 | 248 |

Thư viện từng font nằm ở `phong-chu/<tag>/thu-vien-tieng-viet.json`
(kèm `demo-ghep.png`, `kiem-chung.png`, `quynh-44x44-diamond.png`).
Ảnh so sánh chữ "Quỳnh" cả 7 font: `phong-chu/so-sanh-7-font.png`.

### Ghi chú từng font

- **Dancing Script** — bản tham chiếu: 134/134 chữ khớp 100% render trực tiếp.
- **Allura** — nét mảnh cổ điển, dấu mũ/trăng nhỏ và đặt cao; 8 chữ lệch đúng
  1px ở viền nét (mắt thường không thấy được).
- **Great Vibes** — nét bay bướm, dấu thanh mảnh; chữ `Đ` hoa được lưu nguyên
  vì gạch ngang chạm/đè lên nét chữ gốc.
- **Lobster** — nét đậm retro; họ `ê` (ế ề ể ễ ệ...) lệch đều 2px ở chỗ mũ giao
  với nét chữ — là đặc trưng raster của font, không ảnh hưởng thẩm mỹ.
- **Playfair Display** — serif tương phản cao (nét ngang mảnh, nét dọc đậm);
  khung chữ gọn nhất (57×33); dấu thanh mảnh, đặt cao thoáng.
- **Coiny** — tròn trịa, vui nhộn; dấu to và đặt sát chữ; `Ẽ` lưu nguyên.
- **Caveat** — chữ viết tay: font **vẽ lại nét gốc theo từng dấu** (43/134 chữ
  lưu nguyên, gồm cả họ `i`+thanh và nhiều chữ hoa). Đây là đặc tính bình
  thường của font handwriting, không phải lỗi quy tắc.

### R9 — Ngoại lệ "lưu nguyên chữ"

Khi một font vẽ lại nét gốc khi thêm dấu (kiểm chứng thấy lệch cấu trúc
> 4px, không phải nhiễu viền), chữ đó trong `recipes` sẽ trỏ tới **một miếng
duy nhất chứa nguyên chữ** (key dạng `nguyen|<chữ>`, ví dụ `'nguyen|Ẩ'`),
thay vì tách base+dấu. Cách dùng `compose()` không đổi — vẫn là phép OR các
miếng trong `recipes[ch]`. Danh sách các chữ này nằm ở
`meta.luu_nguyen_chu` trong JSON từng font.
