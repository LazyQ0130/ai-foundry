// 改编自同教程:49–56；必须把整个模块对象挂载，以保留 inject。
import type { Context } from '@deepseek-ai/cordis';

export const name = 'consumer';
export const inject = ['greeter'];
export function apply(ctx: Context) {
  console.log(ctx.greeter.greet('world'));
}
