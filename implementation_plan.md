# Implementation Plan: Clash of Clans High-Resolution Asset Scraper & Organizer

## Overview
This project aims to systematically discover, download, verify, upscale (to minimum 1080p where applicable), and organize all Clash of Clans (COC) visual assets—free of watermarks—categorized strictly by Town Hall (TH1 to TH17) and by asset types (Defenses, Resources, Army, Heroes, Pets, Spells, Traps, Walls, and Official High-Res Key Art).

---

## 1. Asset Classification & Town Hall Level Breakdown

### Town Hall Progression (TH1 - TH17)
Each Town Hall directory will be populated with:
1. **Town Hall Itself**: The Town Hall building render/sprite at each level (and weapon star levels for TH12-TH16).
2. **Defenses**: All defensive structures unlocked or reaching their peak levels at that TH.
3. **Resource Buildings**: Storages, Collectors, Mines, Drills, Clan Castle.
4. **Army Buildings**: Army Camps, Barracks, Laboratory, Spell Factory, Workshop, Pet House, Hero Altars.
5. **Troops & Dark Troops**: Renders and sprites of units unlocked at that TH.
6. **Spells & Dark Spells**: Visuals of all spells unlocked.
7. **Heroes & Pets**: Unlocked heroes (King at TH7, Queen at TH9, Warden at TH11, Champion at TH13, Minion Prince at TH17) and pets (TH14+).
8. **Traps & Walls**: Upgrades and visuals for traps and walls up to that TH level.

| Town Hall Level | Key Defense & Building Additions | Heroes & Pets Unlocked | Key Troops & Spells Unlocked |
| :--- | :--- | :--- | :--- |
| **TH 1** | Cannon, Gold Mine, Elixir Collector, Storages | None | Barbarian |
| **TH 2** | Archer Tower, Walls | None | Archer |
| **TH 3** | Mortar, Laboratory, Clan Castle rebuild | None | Giant, Goblin, Wall Breaker |
| **TH 4** | Air Defense | None | Balloon |
| **TH 5** | Wizard Tower, Spell Factory | None | Wizard, Lightning Spell |
| **TH 6** | Air Sweeper, Giant Bomb | None | Healing Spell |
| **TH 7** | Hidden Tesla, Dark Elixir Storage/Drill, Dark Barracks | **Barbarian King** | Dragon, Rage Spell, Minion, Hog Rider |
| **TH 8** | Bomb Tower, Dark Spell Factory | None | P.E.K.K.A, Valkyrie, Golem, Poison, Earthquake, Haste |
| **TH 9** | X-Bow, Baby Dragon | **Archer Queen** | Witch, Lava Hound, Jump Spell, Freeze Spell |
| **TH 10** | Inferno Tower, Siege Workshop prep | None | Miner, Bowler, Clone Spell, Bat Spell |
| **TH 11** | Eagle Artillery | **Grand Warden** | Electro Dragon, Ice Golem, Invisibility Spell |
| **TH 12** | Giga Tesla (TH weapon), Siege Workshop | None | Yeti, Headhunter, Siege Machines (Wall Wrecker, Battle Blimp, Stone Slammer) |
| **TH 13** | Scattershot, Giga Inferno | **Royal Champion** | Dragon Rider, Apprentice Warden, Log Launcher, Flame Flinger |
| **TH 14** | Battle Builders, Pet House | **Pets: L.A.S.S.I, Electro Owl, Mighty Yak, Unicorn** | Electro Titan, Battle Drill, Recall Spell |
| **TH 15** | Spell Tower, Monolith | **Pets: Frosty, Diggy, Poison Lizard, Phoenix** | Root Rider, Overgrowth Spell |
| **TH 16** | Ricochet Cannon, Multi-Archer Tower | **Pets: Spirit Fox, Angry Jelly** | Druid, Hero Equipment Renders |
| **TH 17** | Integrated Eagle Artillery / Giga Inferno | **Minion Prince** | Super Troops, New Spell & Defenses |

---

## 2. Quality Requirement: Minimum 1080p Strategy

Game assets in Clash of Clans originate in two forms:
1. **Official High-Res Renders (Fan Kit & Press Kit)**: These are natively rendered in full 1080p, 2K, and 4K transparent PNG format. They contain zero watermarks and will be collected directly in their highest native resolution.
2. **In-game Isometric Sprites**: Supercell exports in-game village sprites natively at ~300px to ~512px to optimize mobile textures. 
   - To meet the **min 1080** requirement without blurry bilinear interpolation, an automated upscaling process (high-order Lanczos3 resampling or sharp vector-preserving scaling via Node.js/Canvas) will be applied to export a high-definition `1080px` version alongside the pixel-perfect original.
   - All assets will be verified to ensure transparent backgrounds (PNG) and **zero watermarks**.

---

## 3. Directory Layout

The workspace `e:\CodeLinhTinh\COC` will be organized as follows:

```
e:\CodeLinhTinh\COC\
├── assets\
│   ├── TH01\
│   │   ├── Buildings\
│   │   ├── Defenses\
│   │   ├── Resources\
│   │   ├── Army\
│   │   └── Troops\
│   ├── TH02\
│   ├── ...
│   ├── TH16\
│   ├── TH17\
│   └── HighRes_Official_Renders_1080p+\
│       ├── Heroes\
│       ├── Troops\
│       ├── KeyArt_Wallpapers\
│       └── Logos_Badges\
├── scripts\
│   ├── download_pipeline.mjs
│   ├── organize_by_th.mjs
│   └── upscale_1080.mjs
├── data\
│   └── assets_manifest.json
└── README.md
```

---

## 4. Subagent Division of Labor

The task will be divided across specialized subagents to maximize throughput:
- **Subagent 1 (TH1 - TH6)**: Early Town Halls (Core village basics, starter defenses, standard troops).
- **Subagent 2 (TH7 - TH10)**: Mid Town Halls (Dark Elixir, Barbarian King, Archer Queen, X-Bows, Inferno Towers).
- **Subagent 3 (TH11 - TH13)**: Late Town Halls (Grand Warden, Royal Champion, Eagle Artillery, Scattershot, Siege Machines).
- **Subagent 4 (TH14 - TH17)**: End Game Town Halls (Pets, Monolith, Spell Towers, Merged Defenses, Minion Prince).
- **Subagent 5 (High-Res Fan Kit Renders)**: Official 1080p+ character renders, hero full artwork, transparent promo assets, and splash wallpapers.

---

## 5. Verification & Acceptance Criteria
- [ ] No watermarks on any collected asset.
- [ ] Every Town Hall from TH1 to TH17 has its respective folder containing all unlocked assets.
- [ ] Minimum resolution criterion (1080p) is strictly satisfied for all exported assets.
- [ ] A generated `assets_manifest.json` cataloging name, category, Town Hall level, dimensions, and relative file path.

---
---

# Kế hoạch Thực thi: Thu thập & Tổng hợp Asset Clash of Clans Chất lượng cao Không Watermark

## Tổng quan
Mục tiêu là tìm kiếm, tải về, xác thực, nâng cấp độ phân giải (tối thiểu 1080p) và tổng hợp toàn bộ asset hình ảnh của Clash of Clans (COC)—hoàn toàn không dính watermark—được phân loại chặt chẽ theo từng cấp độ Nhà Chính (Town Hall từ TH1 đến TH17) và theo từng danh mục (Công trình phòng thủ, Tài nguyên, Quân đội, Tướng, Thú cưng, Phép, Bẫy, Tường thành, và Bộ ảnh Render chính thức).

---

## 1. Phân loại Asset & Danh sách theo Cấp độ Nhà Chính (TH1 - TH17)

Mỗi thư mục Nhà Chính sẽ bao gồm:
1. **Nhà Chính (Town Hall)**: Ảnh render/sprite của chính nhà chính ở cấp độ đó (kèm các cấp sao vũ khí từ TH12-TH16).
2. **Công trình phòng thủ (Defenses)**: Các công trình mở khóa mới hoặc đạt cấp tối đa ở cấp TH đó.
3. **Công trình tài nguyên (Resources)**: Kho vàng, kho dầu, mỏ dầu đen, Lâu đài bang hội (Clan Castle).
4. **Công trình quân đội (Army Buildings)**: Trại lính, Nhà lính thường/đen, Phòng thí nghiệm, Nhà phép, Xưởng chế tạo máy, Nhà thú cưng, Bệ tướng.
5. **Lính & Lính đen (Troops & Dark Troops)**: Hình ảnh lính mở khóa ở cấp TH tương ứng.
6. **Phép (Spells & Dark Spells)**: Các bình phép mở khóa.
7. **Tướng & Thú cưng (Heroes & Pets)**: Tướng mở khóa (King TH7, Queen TH9, Warden TH11, Champion TH13, Minion Prince TH17) và thú cưng (từ TH14).
8. **Bẫy & Tường (Traps & Walls)**: Cấp độ bẫy và tường mở khóa ở TH đó.

---

## 2. Chiến lược Đảm bảo Chất lượng Tối thiểu 1080p

Asset Clash of Clans trên Internet tồn tại dưới 2 dạng:
1. **Ảnh Render Chính thức (Fan Kit & Press Kit)**: Supercell cung cấp file PNG trong suốt chuẩn 1080p, 2K, 4K, 100% không watermark. Các asset này sẽ được giữ nguyên độ phân giải gốc cao nhất.
2. **Sprite Công trình Trong Game (In-game Isometric Sprites)**: Do game tối ưu cho màn hình di động, sprite gốc của Supercell có kích thước khoảng 300px - 512px.
   - Để thỏa mãn tiêu chuẩn **min 1080** mà không bị nhòe vỡ hình, quy trình xử lý tự động (thuật toán resampling chất lượng cao Lanczos3 / sharp vector-preserving scaling qua Node.js) sẽ nâng kích thước (upscale) lên tối thiểu 1080px cạnh dài, nền trong suốt PNG.
   - Kiểm tra xác thực không chứa bất kỳ logo hay watermark của bên thứ 3.

---

## 3. Cấu trúc Thư mục

Thư mục `e:\CodeLinhTinh\COC` sẽ được bố trí như sau:

```
e:\CodeLinhTinh\COC\
├── assets\
│   ├── TH01\
│   │   ├── Buildings\
│   │   ├── Defenses\
│   │   ├── Resources\
│   │   ├── Army\
│   │   └── Troops\
│   ├── TH02\
│   ├── ...
│   ├── TH16\
│   ├── TH17\
│   └── HighRes_Official_Renders_1080p+\
│       ├── Heroes\
│       ├── Troops\
│       ├── KeyArt_Wallpapers\
│       └── Logos_Badges\
├── scripts\
│   ├── download_pipeline.mjs
│   ├── organize_by_th.mjs
│   └── upscale_1080.mjs
├── data\
│   └── assets_manifest.json
└── README.md
```

---

## 4. Phân chia Subagent Xử lý Song song

Để tối ưu hiệu suất và tốc độ:
- **Subagent 1 (TH1 - TH6)**: Giai đoạn đầu game (Công trình cơ bản, lính khởi đầu, phòng thủ căn bản).
- **Subagent 2 (TH7 - TH10)**: Giai đoạn trung cấp (Dầu đen, Vua Barbarian, Nữ hoàng Archer, X-Bow, Tháp Inferno).
- **Subagent 3 (TH11 - TH13)**: Giai đoạn cao cấp (Đại quản giáo Grand Warden, Nữ tướng Royal Champion, Pháo đại bàng Eagle Artillery, Máy công thành).
- **Subagent 4 (TH14 - TH17)**: Giai đoạn đỉnh cao (Thú cưng, Tháp phép, Cột nguyên khối Monolith, Công trình phòng thủ ghép Ricochet Cannon/Multi-Archer Tower, Minion Prince).
- **Subagent 5 (High-Res Fan Kit Renders)**: Thu thập toàn bộ các ảnh render tướng, lính, hình nền sự kiện chất lượng gốc 1080p/2K/4K từ Supercell Fan Kit.

---

## 5. Tiêu chí Nghiệm thu
- [ ] Không có watermark trên bất kỳ asset nào.
- [ ] Mỗi cấp độ Nhà chính (TH1 đến TH17) đều có thư mục riêng chứa đầy đủ các asset mở khóa tương ứng.
- [ ] Tiêu chuẩn độ phân giải tối thiểu 1080p được đáp ứng trọn vẹn cho toàn bộ ảnh xuất ra.
- [ ] Có file `assets_manifest.json` ghi nhận đầy đủ danh mục, tên, kích thước, cấp TH và đường dẫn của từng file.
