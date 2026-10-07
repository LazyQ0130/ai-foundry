# AI 研究工作台｜用户流程（C1 内部 Reference）

## Before：现在怎么完成研究

```text
已有 PDF / 笔记
      ↓
人工搜索、复制片段 ─────┐
                         ↓
浏览器搜索 → 外部资料 → 手动整理
                         ↓
                       写报告
                         ↓
                  回头寻找原始出处
```

问题集中在资料切换、证据合并与来源回找。

## After：V1 的主路径

```text
Login → Personal Workspace
              ↓
     Upload Knowledge
              ↓
    Create Research Task
              ↓
     Start Research Run
        ├─ Search Knowledge
        └─ Search External
              ↓
            Evidence
              ↓
   Citation-backed Report
              ↓
   Review citations and sources
              ↓
  Approve / Edit / Reject proposal
              ↓
    Knowledge Note (if approved)
```

ResearchTask 表示一个可持续的研究目标；ResearchRun 表示某次执行。资料更新后再次研究，仍归属于同一 Task，但产生新的 Run 和报告。

## 分支和失败

- 文件无法解析：显示失败原因，允许检查文件或重试；不把失败文件标为可检索。
- 证据不足：报告明确说明缺口，不生成看似确定的引用。
- 外部来源失败：显示外部证据不可用；内部证据仍按其实际支持范围呈现。
- Run 取消或失败：在 Runs 保留状态与已完成步骤，允许用户判断是否重试。
- Note 被拒绝：不写入 KnowledgeNote；报告及审批决定仍可查看。

## 页面从任务推导

Dashboard 提供继续入口；Knowledge 管理资料与详情；Research 管理 Task、报告和来源；Runs 展示执行状态与步骤。Knowledge Detail、Research Detail、Run Detail 承载上下文。Citation 是报告中的可点击证据，不需要独立一级页面；V1 没有必须单列的 Settings 页面。
