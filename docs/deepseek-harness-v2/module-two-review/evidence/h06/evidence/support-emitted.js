// H06 教学事件；真实 Cordis 运行时，虚构业务数据。名称不属于 Harness 官方 API。
import { Context } from '@deepseek-ai/cordis';
export async function inContext(work) {
    const ctx = new Context();
    try {
        return await work(ctx);
    }
    finally {
        await ctx.fiber.dispose();
    } // 夹具收尾；资源回收机制留 H07。
}
