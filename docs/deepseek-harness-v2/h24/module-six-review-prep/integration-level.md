# 实际最高集成等级

四课实际最高均D。H24综合链是：真实SDK Client进程→作者源入口→loadProfileDirectory/AppBoot/Loader加载核心YAML→真实LLMRuntime/DeepSeek Messages Adapter→官方回环Mock Server→Retry/Loop/Tools→安全工具真实文件→Session/JSONL→关闭→新Session推导消息。使用官方测试exit钩子。

完整发行Profile、正式lib/package exports/普通Node入口正向均未通过实际运行；产品Web、ACP和真实Provider分别未验证。因此**没有E证据**，不把完整“作者核心”改名为完整“应用”来升级。

若以后运行完整交付Profile和真实入口，无密钥E可以成立，但仍需标Keyless Mock Provider；真实Provider/互联网E2E、产品Web浏览器、真实计费各自独立。当前默认SDK+HTTP exit P1阻断，不因D数量多而准入。
