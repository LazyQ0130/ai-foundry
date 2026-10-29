// 普通 TypeScript 参数注入，不是 Cordis 运行时。
export interface Model { complete(text: string): Promise<string> }
export interface Log { write(message: string): void }

export class NoteAgent {
  constructor(private model: Model, private log: Log) {}
  async summarize(text: string) {
    const reply = await this.model.complete(text);
    this.log.write(`完成：${reply}`);
    return reply;
  }
}

// 装配方选择实现；消费者 NoteAgent 不知道具体提供方。
export function assemble(prefix: string, entries: string[]) {
  const model: Model = { async complete(text) { return `${prefix}：${text}`; } };
  const log: Log = { write(message) { entries.push(message); } };
  return new NoteAgent(model, log);
}
