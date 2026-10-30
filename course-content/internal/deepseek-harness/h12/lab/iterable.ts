// 最小JavaScript/TypeScript异步迭代例子；它不模拟Harness。
export async function iterablePractice() {
  async function* pieces() { yield '请'; await Promise.resolve(); yield '读'; yield 'README'; }
  const states: string[] = []; let text = '';
  for await (const piece of pieces()) { text += piece; states.push(text); }
  return states;
}
