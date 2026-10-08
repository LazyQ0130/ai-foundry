// Trusted Project Lab metadata only. Protected Markdown is read by the server.
export type CapstoneLesson = { id: string; title: string; order: number; estimatedTime: string; published: boolean; checkKeys: string[]; contentPath: string }
export const capstoneLessons: CapstoneLesson[] = [
  {
    "id": "c1",
    "title": "先别写代码：把 AI 研究工作台想清楚",
    "order": 1,
    "estimatedTime": "60～75 分钟",
    "published": true,
    "checkKeys": [
      "check-c1a1000000000001",
      "check-c1a1000000000002",
      "check-c1a1000000000003",
      "check-c1a1000000000004",
      "check-c1a1000000000005",
      "check-c1a1000000000006"
    ],
    "contentPath": "course-content/capstone/c1.md"
  },
  {
    "id": "c2",
    "title": "从需求到架构：搭起第一个可运行版本",
    "order": 2,
    "estimatedTime": "90～120 分钟",
    "published": true,
    "checkKeys": [
      "check-c2a2000000000001",
      "check-c2a2000000000002",
      "check-c2a2000000000003",
      "check-c2a2000000000004",
      "check-c2a2000000000005",
      "check-c2a2000000000006"
    ],
    "contentPath": "course-content/capstone/c2.md"
  },
  {
    "id": "c3",
    "title": "让真实文件变成可搜索的研究资料",
    "order": 3,
    "estimatedTime": "120～150 分钟",
    "published": true,
    "checkKeys": [
      "check-c3a3000000000001",
      "check-c3a3000000000002",
      "check-c3a3000000000003",
      "check-c3a3000000000004",
      "check-c3a3000000000005",
      "check-c3a3000000000006",
      "check-c3a3000000000007"
    ],
    "contentPath": "course-content/capstone/c3.md"
  },
  {
    "id": "c4",
    "title": "让研究报告中的每个结论都有证据",
    "order": 4,
    "estimatedTime": "110～140 分钟",
    "published": true,
    "checkKeys": [
      "check-c4b4000000000001",
      "check-c4b4000000000002",
      "check-c4b4000000000003",
      "check-c4b4000000000004",
      "check-c4b4000000000005",
      "check-c4b4000000000006",
      "check-c4b4000000000007"
    ],
    "contentPath": "course-content/capstone/c4.md"
  },
  {
    "id": "c5",
    "title": "把已学 Agent 变成真正的 Research Workflow",
    "order": 5,
    "estimatedTime": "120～150 分钟",
    "published": true,
    "checkKeys": [
      "check-c5c5000000000001",
      "check-c5c5000000000002",
      "check-c5c5000000000003",
      "check-c5c5000000000004",
      "check-c5c5000000000005",
      "check-c5c5000000000006",
      "check-c5c5000000000007"
    ],
    "contentPath": "course-content/capstone/c5.md"
  },
  {
    "id": "c6",
    "title": "让 Agent 学会使用外部研究来源",
    "order": 6,
    "estimatedTime": "130～160 分钟",
    "published": true,
    "checkKeys": [
      "check-c6d6000000000001",
      "check-c6d6000000000002",
      "check-c6d6000000000003",
      "check-c6d6000000000004",
      "check-c6d6000000000005",
      "check-c6d6000000000006",
      "check-c6d6000000000007"
    ],
    "contentPath": "course-content/capstone/c6.md"
  },
  {
    "id": "c7",
    "title": "把研究结果安全沉淀成知识资产",
    "order": 7,
    "estimatedTime": "120～150 分钟",
    "published": true,
    "checkKeys": [
      "check-c7e7000000000001",
      "check-c7e7000000000002",
      "check-c7e7000000000003",
      "check-c7e7000000000004",
      "check-c7e7000000000005",
      "check-c7e7000000000006",
      "check-c7e7000000000007"
    ],
    "contentPath": "course-content/capstone/c7.md"
  },
  {
    "id": "c8",
    "title": "证明整个 AI 产品真的可靠",
    "order": 8,
    "estimatedTime": "150～180 分钟",
    "published": true,
    "checkKeys": [
      "check-c8e8000000000001",
      "check-c8e8000000000002",
      "check-c8e8000000000003",
      "check-c8e8000000000004",
      "check-c8e8000000000005",
      "check-c8e8000000000006",
      "check-c8e8000000000007"
    ],
    "contentPath": "course-content/capstone/c8.md"
  },
  {
    "id": "c9",
    "title": "把毕业项目真正交付出去",
    "order": 9,
    "estimatedTime": "180～240 分钟（不含云账号、DNS 与 Provider 等待）",
    "published": true,
    "checkKeys": [
      "check-c9a4018e65d20b71",
      "check-c9b5270d83f16a42",
      "check-c9c6392f14a75e03",
      "check-c9d7481a02b36f95",
      "check-c9e8506b73d19a24",
      "check-c9f9617c24e08b36",
      "check-c901723d95a46e08"
    ],
    "contentPath": "course-content/capstone/c9.md"
  }
]
export const capstoneTotal = 9
export function capstoneLesson(id: string) { return capstoneLessons.find(lesson => lesson.id === id && lesson.published) }
