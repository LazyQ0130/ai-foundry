// Explicit official runtime-only test hook. It does not test production process.exit wiring.
import type {Context} from '@deepseek-ai/cordis';
import * as SDK from '@deepseek-ai/dsh-sdk-jsonrpc-server';
export const name='h24-sdk-process-owner',inject=SDK.inject,Config=SDK.Config;
export function apply(ctx:Context,config:SDK.JsonRpcConfig){
 SDK.apply(ctx,{...config,exit(code){process.exitCode=code;process.stdin.pause();}});
}
