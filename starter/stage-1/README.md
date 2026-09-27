# 个人知识工作台（Stage 1 Starter）

AIFoundry Stage 1 的起点项目：一个已经有一点产品感的小应用——个人知识工作台。
从这里开始，你会带着 AI 一步步把它变成自己的东西。

## 环境要求

- Node.js **18.18 或更高**（建议官网当前 LTS，安装见第 0 课）
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
