import type { PatternId } from "../types";

export const PATTERNS: { id: PatternId; name: string; description: string }[] =
  [
    {
      id: "trophy",
      name: "Cúp vinh quang",
      description:
        "Quả cầu, dáng người nâng cúp và bệ ba tầng · theo ảnh bạn gửi",
    },
    {
      id: "sword",
      name: "Kiếm Odin",
      description:
        "Mũi kiếm hướng xuống, sống lưỡi thẳng, chuôi và hộ thủ hình thoi",
    },
    {
      id: "skull",
      name: "Kiếm hải tặc",
      description:
        "Đầu lâu rỗng, hốc mắt nghiêng và thanh kiếm xuyên chính giữa",
    },
    {
      id: "phoenix",
      name: "Phượng hoàng",
      description: "Đôi cánh vươn cao, lông vũ tách lớp và đuôi rủ",
    },
    {
      id: "dragon",
      name: "Long ảnh",
      description: "Đầu rồng nhìn nghiêng, sừng nhọn và cổ cuộn chữ S",
    },
    {
      id: "lotus",
      name: "Liên hoa",
      description: "Năm cánh sen ôm nhau, cuống cong và mặt nước",
    },
    {
      id: "koi",
      name: "Cá chép",
      description: "Thân cong, đuôi xòe và khoảng âm rộng giữa các vây",
    },
    {
      id: "butterfly",
      name: "Hồ điệp",
      description: "Cánh bướm mềm, gân cánh thanh và đuôi đối xứng",
    },
  ];

// Authored continuous centerlines, informed by actual wall-art references.
// No raster scaling: every curve is sampled once in the chosen game frame.
export const ARTWORK: Record<PatternId, string[]> = {
  trophy: [
    "M 14 0 C 6 -1 1 4 2 9 C 2 13 7 16 12 16",
    "M 14 0 C 22 0 27 5 25 10 C 24 14 20 16 17 16",
    "M 3 10 L 8 13 L 12 10",
    "M 12 10 C 9 7 11 5 13 6 C 16 6 16 9 14 11 L 18 14 L 22 12 L 25 9",
    "M 4 15 L 9 18 L 12 20 L 13 26 L 9 30",
    "M 14 12 L 16 18 L 17 24 L 14 29 L 10 31",
    "M 23 15 L 20 20 L 19 29 L 22 33",
    "M 8 18 L 7 22 L 11 24",
    "M 10 28 L 7 32 L 9 34 L 21 34 L 22 33",
    "M 8 32 L 19 27",
    "M 7 35 L 23 35 L 25 38 L 4 38 Z",
    "M 4 39 L 26 39 L 28 41 L 2 41 Z",
  ],
  sword: [
    "M 15 0 L 18 3 L 15 6 L 12 3 Z",
    "M 14 6 L 14 11",
    "M 16 6 L 16 11",
    "M 4 10 L 7 12 L 23 12 L 26 10 L 29 13 L 26 16 L 23 14 L 7 14 L 4 16 L 1 13 Z",
    "M 12 15 L 12 36 L 15 40 L 18 36 L 18 15",
    "M 15 17 L 15 36",
    "M 0 20 L 2 18 L 4 20 L 4 24 L 2 26 L 0 24 Z",
    "M 6 18 L 8 18 L 10 20 L 10 24 L 8 26 L 6 26 Z",
    "M 21 18 L 21 26",
    "M 25 26 L 25 18 L 29 26 L 29 18",
  ],
  skull: [
    "M 20 0 L 23 3 L 20 6 L 17 3 Z",
    "M 18 6 L 18 12",
    "M 22 6 L 22 12",
    "M 10 11 L 14 13 L 26 13 L 30 11 L 32 14 L 28 17 L 24 16 L 16 16 L 12 17 L 8 14 Z",
    "M 17 17 L 17 26 L 20 29 L 23 26 L 23 17",
    "M 13 18 C 4 18 0 23 1 29 C 1 34 5 36 9 36 L 10 40 L 14 40 L 15 42 L 25 42 L 26 40 L 30 40 L 31 36 C 36 36 39 32 39 27 C 39 22 34 19 27 18",
    "M 7 27 L 14 29 L 12 32 L 6 31 Z",
    "M 33 27 L 26 29 L 28 32 L 34 31 Z",
    "M 20 31 L 18 34 L 22 34 Z",
    "M 14 36 L 14 39",
    "M 18 37 L 18 40",
    "M 22 37 L 22 40",
    "M 26 36 L 26 39",
  ],
  phoenix: [
    "M 20 10 Q 16 6 20 4 L 24 5 L 21 7 L 23 10",
    "M 17 12 C 10 11 4 6 0 0 C 0 9 4 15 12 18 L 7 19 L 15 22 L 12 24 L 18 25",
    "M 23 12 C 30 11 36 6 40 0 C 40 9 36 15 28 18 L 33 19 L 25 22 L 28 24 L 22 25",
    "M 4 8 L 13 15",
    "M 36 8 L 27 15",
    "M 17 14 Q 15 20 19 25 L 16 32 L 20 29 L 24 32 L 21 25 Q 25 20 23 14",
  ],
  dragon: [
    "M 9 9 L 3 1 L 13 5 L 18 1 L 17 7 L 25 10 L 28 14 L 23 14 L 20 12 L 18 15 L 24 18 L 29 17 L 26 21 L 19 22",
    "M 9 9 L 3 8 L 6 13 L 1 15 L 7 18 L 3 22 L 10 23 L 8 28",
    "M 19 22 C 9 23 12 30 23 29 C 33 28 34 35 25 38 C 17 41 5 36 8 28",
    "M 13 27 C 7 35 22 37 28 33",
    "M 13 11 L 16 11 L 15 13",
    "M 21 25 L 29 22 L 27 27",
  ],
  lotus: [
    "M 20 24 C 10 20 10 11 20 0 C 30 11 30 20 20 24 Z",
    "M 16 21 C 9 20 4 14 5 5 C 11 7 15 11 17 15",
    "M 24 21 C 31 20 36 14 35 5 C 29 7 25 11 23 15",
    "M 14 23 C 7 24 2 21 0 13 C 5 13 9 15 12 18",
    "M 26 23 C 33 24 38 21 40 13 C 35 13 31 15 28 18",
    "M 20 25 Q 19 29 14 30",
    "M 4 28 Q 9 26 14 28",
    "M 26 28 Q 31 26 36 28",
    "M 10 33 Q 20 35 30 33",
  ],
  koi: [
    "M 6 8 C 12 0 23 3 26 12 C 29 21 22 26 25 31 L 36 30 L 30 36 L 33 42 L 22 37 C 17 32 13 29 10 23 C 6 17 2 12 6 8 Z",
    "M 6 9 Q 12 8 16 5",
    "M 8 14 Q 14 17 21 11",
    "M 23 15 Q 34 17 28 25 L 24 23",
    "M 11 22 Q 3 28 6 31 L 16 28",
    "M 16 18 Q 22 22 20 29",
    "M 24 33 L 30 36",
    "M 10 8 L 11 8",
  ],
  butterfly: [
    "M 20 12 C 17 8 9 -2 3 1 C -2 5 2 17 14 20 C 3 17 2 25 8 29 C 12 32 17 26 19 22",
    "M 22 12 C 25 8 33 -2 39 1 C 44 5 40 17 28 20 C 39 17 40 25 34 29 C 30 32 25 26 23 22",
    "M 20 11 L 20 23 L 21 27 L 22 23 L 22 11",
    "M 20 11 Q 16 6 17 4",
    "M 22 11 Q 26 6 25 4",
    "M 6 7 Q 12 9 16 15",
    "M 36 7 Q 30 9 26 15",
    "M 10 24 L 15 23",
    "M 32 24 L 27 23",
  ],
};
