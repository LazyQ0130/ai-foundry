# 个人知识工作台（Stage 1 Starter）

AIFoundry Stage 1 的起点项目：一个已经有一点产品感的小应用——个人知识工作台。
从这里开始，你会带着 AI 一步步把它变成自己的东西。

## 环境要求

- Node.js **18.18 或更高**（建议 20 LTS，安装见第 0 课）
- npm（随 Node.js 一起安装）

## 运行

```bash
npm install
npm run dev
```

打开浏览器访问 <http://localhost:3000>，看到「个人知识工作台」页面即成功。

## 目录速览

```
app/
  layout.tsx    全站外框（标题、字体等）
  page.tsx      首页（你现在看到的一切）
  globals.css   全局样式
components/
  ResourceCard.tsx  单张资料卡片
  icons.tsx         两个小图标
lib/
  resources.ts      资料数据（卡片内容都在这里）
```

## 给课程作者的话（学生不用读）

- 1.2「只看重要」功能：卡片上的星标只是展示，还没有任何筛选入口，这是留给学生的改造点。
- 1.3 排错课：首页「共 N 条资料」统计的是全部资料，筛选后数字不变——这是有意留下的可复现 Bug，修复方式是把统计改为使用过滤后的列表。
- 1.5 Git 课：项目未初始化 Git，学生按课程自行 `git init`。
- 除 next / react / react-dom / typescript / tailwind 外无任何依赖，`package-lock.json` 已提交。
