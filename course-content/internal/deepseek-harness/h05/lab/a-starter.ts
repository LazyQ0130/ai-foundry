// 练习 A：教学简化；纯内存、固定模型，没有真实 API 或持久日志。
export class NoteAgent {
  async summarize(text: string) {
    const reply = `固定模型A：${text}`;
    console.log(`完成：${reply}`);
    return reply;
  }
}
