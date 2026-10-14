import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import { decodeBlueprint } from "../../src/lib/engine";
import { ART_FONTS } from "../../src/lib/art-fonts";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("heading", { name: "Bản dựng của bạn" }).waitFor();
});
test("name input, Vietnamese normalization, wall constraints and blank state", async ({
  page,
}) => {
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("Đặng");
  await expect(page.getByLabel("Tên, biệt danh hoặc lời nhắn")).toHaveValue(
    "Đặng",
  );
  await expect(page.locator(".text-entry .inline-error")).toHaveCount(0);
  await page.getByLabel("Cấp Town Hall").selectOption("1");
  await expect(page.getByText("TH1 chưa có tường.")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tải bản dựng" }),
  ).toBeDisabled();
  await page.getByLabel("Cấp Town Hall").selectOption("5");
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("A");
  await page.getByRole("button", { name: "Tự căn vừa Town Hall" }).click();
  await expect(
    page.getByRole("button", { name: "Tải bản dựng" }),
  ).toBeEnabled();
  await page.getByLabel("Kích thước").fill("3");
  await page.getByRole("button", { name: "2 ô", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tải bản dựng" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Tự căn vừa Town Hall" }).click();
  await expect(
    page.getByRole("button", { name: "Tải bản dựng" }),
  ).toBeEnabled();
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("");
  await expect(page.getByText("Bắt đầu bằng tên của bạn")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Chia sẻ mẫu", exact: true }),
  ).toBeDisabled();
});
test("bilingual text, buildings, exact JSON exports and imported blueprints", async ({
  page,
}) => {
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("Đỗ My");
  await page.getByRole("button", { name: "Tự căn vừa Town Hall" }).click();
  await page.getByLabel("Xếp công trình theo TH16").check();
  await expect(page.getByText(/141\/141 công trình/)).toBeVisible();
  await page.getByRole("button", { name: "Tải bản dựng" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Mẫu JSON" }).click();
  const file = await download,
    path = await file.path();
  const json = JSON.parse(await fs.readFile(path!, "utf8"));
  expect(json.buildings).toHaveLength(141);
  expect(json.walls.length).toBeLessThanOrEqual(325);
  expect(json.unplaced).toEqual([]);
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("New");
  await page.locator("input[type=file]").setInputFiles({
    name: "blueprint.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(json)),
  });
  await expect(page.getByLabel("Tên, biệt danh hoặc lời nhắn")).toHaveValue(
    "Đỗ My",
  );
  await expect(page.getByLabel("Xếp công trình theo TH16")).toBeChecked();
});
test("coordinate editing, undo, redo and game-link invalidation", async ({
  page,
}) => {
  const before = Number(
    (await page.locator(".canvas-statusbar").innerText()).match(
      /(\d+) tường/,
    )![1],
  );
  await page.getByText("Chỉnh theo tọa độ", { exact: false }).last().click();
  await page.getByLabel("Cột X").fill("0");
  await page.getByLabel("Hàng Y").fill("0");
  await page.getByRole("button", { name: "Thêm tường", exact: true }).click();
  await expect(page.locator(".canvas-statusbar")).toContainText(
    `${before + 1} tường`,
  );
  await page.getByRole("button", { name: "Hoàn tác", exact: true }).click();
  await expect(page.locator(".canvas-statusbar")).toContainText(
    `${before} tường`,
  );
  await page.getByRole("button", { name: "Làm lại", exact: true }).click();
  await expect(page.locator(".canvas-statusbar")).toContainText(
    `${before + 1} tường`,
  );
  await page
    .getByLabel("Gắn link base đã tạo trong game")
    .fill("https://evil.example/?action=OpenLayout");
  await page.getByRole("button", { name: "Gắn link", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("link.clashofclans.com");
  await page
    .getByLabel("Gắn link base đã tạo trong game")
    .fill(
      "https://link.clashofclans.com/en?action=OpenLayout&id=TH16%3AHV%3AAAAAAAAAAAMFcYu_brVfYoJRUceHWlPi",
    );
  await page.getByRole("button", { name: "Gắn link", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Mở bố cục trong COC" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xoay mẫu 90 độ" }).click();
  await expect(
    page.getByRole("link", { name: "Mở bố cục trong COC" }),
  ).toHaveCount(0);
});
test("share URL restores exact design; corrupted links recover clearly", async ({
  page,
  context,
}) => {
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("LINH");
  await page.getByRole("button", { name: "Tự căn vừa Town Hall" }).click();
  await page.getByRole("button", { name: "Chia sẻ mẫu", exact: true }).click();
  const url = await page.getByLabel("Link chia sẻ mẫu web").inputValue();
  const encoded = new URLSearchParams(new URL(url).hash.slice(1)).get(
    "layout",
  )!;
  expect(decodeBlueprint(encoded).options.text).toBe("LINH");
  const other = await context.newPage();
  await other.goto(url);
  await expect(other.getByLabel("Tên, biệt danh hoặc lời nhắn")).toHaveValue(
    "LINH",
  );
  await other.goto("/#layout=INVALID");
  await expect(other.getByRole("status")).toContainText(
    "Không mở được link mẫu",
  );
  await expect(
    other.getByRole("heading", { name: "Bản dựng của bạn" }),
  ).toBeVisible();
});
test("PNG and CSV export real downloadable files", async ({ page }) => {
  const count = Number(
    (await page.locator(".canvas-statusbar").innerText()).match(
      /(\d+) tường/,
    )![1],
  );
  for (const [name, extension] of [
    ["Ảnh PNG", ".png"],
    ["Tọa độ CSV", ".csv"],
  ]) {
    await page.getByRole("button", { name: "Tải bản dựng" }).click();
    const waiting = page.waitForEvent("download");
    await page.getByRole("button", { name }).click();
    const file = await waiting;
    expect(file.suggestedFilename()).toContain(extension);
    const buffer = await fs.readFile((await file.path())!);
    if (extension === ".png") {
      expect(buffer.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(buffer.length).toBeGreaterThan(10000);
    } else {
      const text = buffer.toString("utf8");
      expect(text).toContain('"type","id","name","x","y"');
      expect(text.split("\r\n")).toHaveLength(count + 1);
    }
  }
});
test("mobile keeps the live preview visible during input, with scrollable view canvas and large editing targets", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  const preview = page.getByRole("region", { name: "Xem nhanh mẫu tường" });
  await expect(preview).toBeVisible();
  const initial = await preview.boundingBox();
  expect(initial!.y).toBeLessThan(260);
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("AB");
  const box = await preview.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThan(844);
  expect(
    await page
      .locator(".mobile-live-preview canvas")
      .evaluate((el) => getComputedStyle(el).touchAction),
  ).toBe("pan-y");
  const target = await page
    .getByRole("button", { name: "Vẽ tường", exact: true })
    .boundingBox();
  expect(target!.width).toBeGreaterThanOrEqual(44);
  expect(target!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});

test("oversized designs stop completely, survive reload as a warning, and recover", async ({
  page,
}) => {
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("W".repeat(120));
  await expect(page.locator(".canvas-blocked")).toContainText(
    "ngoài làng 44 × 44",
  );
  await expect(page.locator(".workbench canvas")).toHaveAttribute(
    "aria-label",
    /0 tường/,
  );
  await expect(
    page.getByRole("button", { name: "Vẽ tường", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Tải bản dựng" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Chia sẻ mẫu", exact: true }),
  ).toBeDisabled();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("wallcraft-draft-v1") || "null")
            ?.walls.length,
      ),
    )
    .toBe(0);
  await page.reload();
  await expect(page.locator(".canvas-blocked")).toBeVisible();
  await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill("COC");
  await expect(page.locator(".canvas-blocked")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Vẽ tường", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Cấp Town Hall").selectOption("2");
  await expect(page.locator(".canvas-blocked")).toContainText("tường khả dụng");
  await page.getByLabel("Cấp Town Hall").selectOption("16");
  await expect(
    page.getByRole("button", { name: "Tải bản dựng" }),
  ).toBeEnabled();
});

test("decorative fonts and rotated coordinates persist in exact shared exports", async ({
  page,
}) => {
  const fingerprints = new Set<string>();
  for (const { name, id } of ART_FONTS) {
    await page
      .getByRole("button", { name: `Chữ ${name}`, exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Tải bản dựng" }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: "Chia sẻ mẫu", exact: true })
      .click();
    const url = await page.getByLabel("Link chia sẻ mẫu web").inputValue();
    const b = decodeBlueprint(
      new URLSearchParams(new URL(url).hash.slice(1)).get("layout")!,
    );
    expect(b.options.font).toBe(id);
    expect(b.options.frame).toBe("diagonal");
    fingerprints.add(JSON.stringify(b.walls));
  }
  expect(fingerprints.size).toBe(7);
  await page.getByRole("button", { name: "Theo ô vuông", exact: true }).click();
  await page.getByRole("button", { name: "Chia sẻ mẫu", exact: true }).click();
  const url = await page.getByLabel("Link chia sẻ mẫu web").inputValue();
  const grid = decodeBlueprint(
    new URLSearchParams(new URL(url).hash.slice(1)).get("layout")!,
  );
  expect(grid.options.frame).toBe("grid");
  expect(fingerprints.has(JSON.stringify(grid.walls))).toBe(false);
  await page.goto(url);
  await expect(
    page.getByRole("button", { name: "Theo ô vuông", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Chữ Caveat", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("a stroke stops at the village boundary and does not reconnect when dragged back", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Bản vẽ", exact: true }).click();
  await page.getByRole("button", { name: "Vẽ tường", exact: true }).click();
  const box = (await page.locator(".workbench canvas").boundingBox())!;
  const unit = Math.min((box.width - 64) / 44, (box.height - 64) / 44);
  const ox = box.x + (box.width - 44 * unit) / 2,
    oy = box.y + (box.height - 44 * unit) / 2;
  const before = Number(
    (await page.locator(".canvas-statusbar").innerText()).match(
      /(\d+) tường/,
    )![1],
  );
  await page.mouse.move(ox + 1.5 * unit, oy + 20.5 * unit);
  await page.mouse.down();
  await expect(page.locator(".canvas-statusbar")).toContainText(
    `${before + 1} tường`,
  );
  await page.mouse.move(ox - 10, oy + 20.5 * unit);
  await expect(page.getByRole("status")).toContainText(
    "Đã dừng nét vẽ tại biên làng",
  );
  await page.mouse.move(ox + 5.5 * unit, oy + 20.5 * unit);
  await page.mouse.up();
  await expect(page.locator(".canvas-statusbar")).toContainText(
    `${before + 1} tường`,
  );
  await page.getByText("Chỉnh theo tọa độ", { exact: false }).last().click();
  await page.getByLabel("Cột X").fill("44");
  await page.getByRole("button", { name: "Thêm tường", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "Tọa độ phải là số nguyên từ 0 đến 43",
  );
  await expect(page.locator(".canvas-statusbar")).toContainText(
    `${before + 1} tường`,
  );
});

test("arbitrary Vietnamese and English content retains accents and flourishes without word or shape presets", async ({
  page,
}) => {
  for (const [text, flourish] of [
    ["Tự do", "none"],
    ["Sky", "swash"],
    ["Đỗ My", "none"],
    ["Hello", "blade"],
  ]) {
    await page.getByLabel("Tên, biệt danh hoặc lời nhắn").fill(text);
    await page
      .getByLabel("Nét dưới chữ", { exact: true })
      .selectOption(flourish);
    await page.getByRole("button", { name: "Tự căn vừa Town Hall" }).click();
    await expect(page.getByLabel("Tên, biệt danh hoặc lời nhắn")).toHaveValue(
      text,
    );
    await expect(
      page.getByRole("button", { name: "Tải bản dựng" }),
    ).toBeEnabled();
    await page
      .getByRole("button", { name: "Chia sẻ mẫu", exact: true })
      .click();
    const url = await page.getByLabel("Link chia sẻ mẫu web").inputValue();
    const design = decodeBlueprint(
      new URLSearchParams(new URL(url).hash.slice(1)).get("layout")!,
    );
    expect(design.options.text).toBe(text);
    expect(design.options.flourish).toBe(flourish);
    expect(design.walls.length).toBeLessThanOrEqual(325);
  }
  await expect(page.getByRole("button", { name: "Thư viện hình" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("group", { name: "Mẫu chữ gợi ý" })).toHaveCount(
    0,
  );
});

test("surplus ornaments can be toggled without filling the lettering or spending the entire inventory", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Làm thanh chữ & thêm họa tiết", exact: true })
    .click();
  const allocation = page.getByLabel("Phân bổ tường");
  await expect(allocation).toContainText("Họa tiết");
  const before = (await allocation.innerText()).match(
    /Nét chữ (\d+) · Họa tiết (\d+) · Còn (\d+)/,
  )!;
  expect(Number(before[2])).toBeGreaterThan(0);
  expect(Number(before[3])).toBeGreaterThan(0);
  await page.getByLabel("Dùng tường dư cho họa tiết phụ").uncheck();
  await expect(allocation).toContainText(`Nét chữ ${before[1]} · Họa tiết 0`);
  await page.getByRole("button", { name: "Chia sẻ mẫu", exact: true }).click();
  const url = await page.getByLabel("Link chia sẻ mẫu web").inputValue();
  const design = decodeBlueprint(
    new URLSearchParams(new URL(url).hash.slice(1)).get("layout")!,
  );
  expect(design.options.stroke).toBe("light");
  expect(design.options.ornaments).toBe(false);
  expect(design.walls.length).toBe(Number(before[1]));
});
