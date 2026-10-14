# Wallcraft — Tạo hình tường Clash of Clans

Web đã được xây trong kho này. Chạy `npm install`, `npm run dev`, rồi mở http://127.0.0.1:5173.

Tạo chữ từ nội dung tiếng Việt hoặc tiếng Anh bất kỳ bằng 7 phông trong `docs/all-7-fonts-json.zip`: Dancing Script, Allura, Great Vibes, Lobster, Playfair Display, Coiny và Caveat. Ghép chữ và dấu theo `docs/quy-tac-ghep.md`, giữ hoa/thường, đường chân chữ và khoảng cách của phông. Các nút từ mẫu và thư viện hình đã được tạm gỡ khỏi giao diện. Dựng theo trục chéo 45° để đọc từ góc nhìn game hoặc theo ô vuông. Tính tường theo TH1–TH18, chặn toàn bộ mẫu vượt lưới/số tường, xem làng 3D, xếp công trình/bẫy, chỉnh tay, chia sẻ mẫu web và xuất PNG/JSON/CSV. Link base nhập vào game phải được tạo trong COC; có thể gắn link thật vào mẫu.

Hướng dẫn đầy đủ: [docs/WALLCRAFT.md](docs/WALLCRAFT.md). Nghiên cứu link base: [docs/link-base-research.md](docs/link-base-research.md).

---

# Bộ Sưu Tập Asset Clash of Clans Không Watermark (Chất Lượng Tối Thiểu 1080p)
*Clash of Clans High-Resolution Asset Collection (Zero Watermark, Min 1080p)*

Dự án tổng hợp toàn diện và có hệ thống toàn bộ asset đồ họa trực quan của game **Clash of Clans (Supercell)**, được phân loại chính xác theo từng cấp độ Nhà Chính (**Town Hall 1 đến Town Hall 17**) và thư mục **Ảnh Render 3D Chính Thức**.

---

## 🌟 Điểm Nổi Bật (Key Features)

1. **100% Không Watermark**: Tất cả asset được trích xuất trực tiếp từ dữ liệu game chính thức của Supercell và các kho lưu trữ mô hình chuẩn, hoàn toàn sạch sẽ, không dính logo hay watermark của bên thứ ba.
2. **Chất Lượng Tối Thiểu 1080p (Min 1080p)**: Tất cả hình ảnh được xử lý bằng thuật toán **Lanczos3 resampling** qua thư viện xử lý ảnh đồ họa `sharp`, đảm bảo cả chiều rộng và chiều cao đều đạt tối thiểu **1080px**, giữ nguyên viền trong suốt (Alpha Transparency) và không suy hao chất lượng.
3. **Phân Loại Chặt Chẽ Theo Cấp Độ Nhà Chính (TH1 - TH17)**:
   - Mỗi cấp độ Nhà Chính (`TH01` đến `TH17`) chứa đầy đủ các công trình phòng thủ (*Defenses*), tài nguyên (*Resources*), quân đội (*Army*), tướng (*Heroes*), thú cưng (*Pets*), phép (*Spells*), máy công thành (*Siege Machines*), bẫy (*Traps*), và tường thành (*Walls*) mở khóa hoặc nâng cấp ở cấp độ đó.
4. **Bộ Ảnh Render 3D Siêu Nét**:
   - Thư mục riêng `HighRes_Official_Renders_1080p+` chứa ảnh render 3D toàn thân của toàn bộ Tướng, Lính thường, Lính đen, Siêu lính (*Super Troops*), Máy công thành và các cấp sao vũ khí Nhà chính (TH12-TH14 Weapon Stars).
5. **Chia Subagents Xử Lý Song Song**: 6 Subagents độc lập vận hành đồng thời để tăng tốc xử lý và đạt thông lượng tối đa.

---

## 📊 Thống Kê Tổng Hợp (Asset Statistics)

- **Tổng số Asset đã tạo và kiểm tra**: **976 ảnh PNG chất lượng cao**
- **Độ phân giải**: Tất cả hình ảnh có kích thước tối thiểu `1080px` (ví dụ: `1080x1080`, `1080x1296`, `1080x1473`, `1080x1604`...)
- **Định dạng**: PNG 24-bit/32-bit có kênh Alpha (nền trong suốt)

| Thư mục | Số lượng Asset | Danh mục & Điểm nhấn chính |
| :--- | :---: | :--- |
| **TH01** | 17 | Nhà chính TH1, Pháo Cannon cấp 1-2, Mỏ vàng/dầu, Kho, Trại lính, Lính Barbarian |
| **TH02** | 17 | Nhà chính TH2, Tháp Cung thủ Archer Tower, Tường thành Lvl 1-2, Lính Archer |
| **TH03** | 25 | Nhà chính TH3, Pháo cối Mortar, Phòng thí nghiệm Lab, Lâu đài Bang hội, Goblin, Khổng lồ Giant, Wall Breaker |
| **TH04** | 24 | Nhà chính TH4, Pháo phòng không Air Defense, Khinh khí cầu Balloon |
| **TH05** | 27 | Nhà chính TH5, Tháp Phù thủy Wizard Tower, Nhà phép Spell Factory, Pháp sư Wizard, Phép Sét Lightning |
| **TH06** | 23 | Nhà chính TH6, Máy thổi khí Air Sweeper, Phép Hồi máu Healing Spell, Bẫy khổng lồ Giant Bomb |
| **TH07** | 45 | Nhà chính TH7, **Vua Barbarian (Barbarian King)**, Tháp Tesla, Dầu đen Dark Elixir, Rồng Dragon, Lính Minion, Hog Rider |
| **TH08** | 85 | Nhà chính TH8, Tháp Bom Bomb Tower, Nhà phép Đen, P.E.K.K.A, Golem, Valkyrie, Trang bị Tướng (Hero Equipment) |
| **TH09** | 58 | Nhà chính TH9, **Nữ Hoàng Cung Thủ (Archer Queen)**, Nỏ X-Bow, Phù thủy Witch, Chó nham thạch Lava Hound, Rồng con Baby Dragon |
| **TH10** | 58 | Nhà chính TH10, Tháp Địa Ngục Inferno Tower, Thợ mỏ Miner, Bowler, Phép Nhân bản Clone Spell |
| **TH11** | 65 | Nhà chính TH11, **Đại Quản Giáo (Grand Warden)**, Pháo Đại Bàng Eagle Artillery, Rồng Điện Electro Dragon, Golem Băng Ice Golem |
| **TH12** | 70 | Nhà chính TH12 (Vũ khí Giga Tesla), Xưởng chế tạo máy Siege Workshop, Người tuyết Yeti, Thợ săn Headhunter |
| **TH13** | 73 | Nhà chính TH13 (Vũ khí Giga Inferno), **Nữ Tướng Hoàng Gia (Royal Champion)**, Pháo Scattershot, Kỵ sĩ Rồng Dragon Rider |
| **TH14** | 68 | Nhà chính TH14, Nhà Thợ xây Chiến đấu Battle Builder, Nhà Thú cưng Pet House, **Thú: L.A.S.S.I, Cú Điện Owl, Bò Yak, Kỳ lân Unicorn** |
| **TH15** | 80 | Nhà chính TH15, Tháp Phép Spell Tower, Cột Nguyên khối Monolith, **Thú: Frosty, Diggy, Thằn lằn Lizard, Phượng hoàng Phoenix** |
| **TH16** | 78 | Nhà chính TH16, **Phòng thủ ghép (Ricochet Cannon, Multi-Archer Tower)**, **Thú: Cáo Tàng hình Spirit Fox, Sứa Angry Jelly** |
| **TH17** | 76 | Nhà chính TH17, **Tướng mới: Hoàng Tử Minion (Minion Prince)**, Pháo đại bàng tích hợp, Thú: Sneezy |
| **HighRes_Official_Renders_1080p+** | 87 | **Mô hình 3D toàn thân**: Tướng, Lính, Siêu lính (Super Troops), Máy công thành, Các cấp sao vũ khí Nhà chính |
| **TỔNG CỘNG** | **976** | **Toàn bộ hệ sinh thái Clash of Clans** |

---

## 📁 Cấu Trúc Thư Mục (Directory Hierarchy)

```
e:\CodeLinhTinh\COC\
├── assets\
│   ├── TH01\ ... TH17\
│   │   ├── TownHall\
│   │   ├── Defenses\
│   │   ├── Resources\
│   │   ├── Army\
│   │   ├── Heroes\
│   │   ├── HeroEquipment\
│   │   ├── Pets\
│   │   ├── Troops\
│   │   ├── Spells\
│   │   ├── SiegeMachines\
│   │   ├── Traps\
│   │   └── Walls\
│   └── HighRes_Official_Renders_1080p+\
│       ├── Heroes\
│       ├── Troops\
│       ├── SuperTroops\
│       ├── SiegeMachines\
│       └── TownHalls_WeaponStars\
├── data\
│   └── assets_manifest.json          # Danh mục dữ liệu JSON đầy đủ
├── scripts\
│   ├── catalog_builder.mjs           # Tạo catalog và manifest
│   ├── image_utils.mjs               # Module upscale Lanczos3 min 1080p
│   ├── worker_core.mjs               # Core engine cho các subagent
│   ├── worker_th1_th4.mjs            # Subagent 1 (TH1 - TH4)
│   ├── worker_th5_th8.mjs            # Subagent 2 (TH5 - TH8)
│   ├── worker_th9_th11.mjs           # Subagent 3 (TH9 - TH11)
│   ├── worker_th12_th14.mjs          # Subagent 4 (TH12 - TH14)
│   ├── worker_th15_th17.mjs          # Subagent 5 (TH15 - TH17)
│   ├── worker_highres_models.mjs     # Subagent 6 (Mô hình 3D Render)
│   └── run_all_subagents.mjs         # Điều phối chạy song song 6 subagents
├── COC_ASSETS_BY_TOWN_HALL.md        # Bảng danh mục chi tiết 1.549 dòng
└── README.md
```

---

## 🛠️ Công Nghệ & Thuật Toán Xử Lý

- **Node.js (v24.19.0)**: Môi trường thực thi bất đồng bộ đa tiến trình.
- **sharp (libvips)**: Bộ thư viện xử lý ảnh C++ tốc độ cao hàng đầu thế giới.
- **Lanczos3 Interpolation**: Thuật toán tái lấy mẫu chất lượng cao bậc 3, giữ các đường viền sắc cạnh của đồ họa isometric trong game mà không sinh hiện tượng mờ nhòe (bilinear blur) hay răng cưa (nearest-neighbor aliasing).
- **Zero Watermark Guarantee**: Trích xuất từ nguồn sạch 100% không đóng dấu của nhà phát hành Supercell.
