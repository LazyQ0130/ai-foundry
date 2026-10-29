// 改编自锁定版本 docs/cordis-tutorial/03-services.zh.md:11–35。
import { Service } from '@deepseek-ai/cordis';
export class GreeterService extends Service {
    constructor(ctx) { super(ctx, 'greeter'); }
    greet(who) { return `Hello, ${who}!`; }
}
export const name = 'greeter';
export function apply(ctx) { ctx.plugin(GreeterService); }
