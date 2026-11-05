# 实际最高集成等级

四课实际最高均D。H24综合链是：真实SDK Client进程→作者源入口→loadProfileDirectory/AppBoot/Loader加载核心YAML→真实LLMRuntime/DeepSeek Messages Adapter→官方回环Mock Server→Retry/Loop/Tools→安全工具真实文件→Session/JSONL→关闭→新Session推导消息。使用官方测试exit钩子。

完整发行Profile、正式lib/package exports/普通Node入口正向均未通过实际运行；产品Web、ACP和真实Provider分别未验证。因此**没有E证据**，不把完整“作者核心”改名为完整“应用”来升级。

若以后运行完整交付Profile和真实入口，无密钥E可以成立，但仍需标Keyless Mock Provider；真实Provider/互联网E2E、产品Web浏览器、真实计费各自独立。当前默认SDK+HTTP exit P1阻断，不因D数量多而准入。

<!-- H24-P1-special-revalidation -->
## P1专项复验补记（2026-11-05）

**当前仍为NO-GO，未解除原P1。** 上文为fd4f147的原交付报告/矩阵，历史正文与原始证据保留；原字节副本在专项original-reports中。

现已定位到Windows x64/官方Node24.16.0默认显式退出的Runtime触发条件：全新正式锁环境的真实SDK+HTTP仍失败，纯Node内置模块最小例关闭Listener后也3/3同断言。三个npm包审计为pretty-ms9.3.1→9.3.0、pure-rand8.4.2→8.4.0、yoctocolors2.2.0→2.1.2；后两项替换前状态由缓存SRI/时间和元数据高可信还原，原before锁缺失，未伪造完整历史。它们不能独立解释无npm也可触发的故障。

候选SDK自然退出补丁只在副本验证，原24.16下H24同23项和H23补丁版同25项通过；经官方SHA核验的Node24.22.1上，固定SDK原版默认出口同23项通过。原23钩子配置、H23原25、Renderer12及1440/390/320回归也过；重复/分支测试不累计成新的独立场景。没有把补丁或替代Runtime写成原24.16基线已修复。

活跃HTTP时EOF/直接Dispose另有终态缺口：exit0、Socket0和端口释放，甚至root Dispose Promise结算，都未观察到持久turn/end。该项保持未通过，不将正常关闭进程等同所有领域事实闭合。正式lib/发行完整Profile/E、产品Web、真实Provider、性能成本、学员试读/实测时长/独立外审和学习负担P2继续开放。

[专项入口](../p1-windows-sdk-http-exit/README.md) · [真实退出矩阵](../p1-windows-sdk-http-exit/reproduction-matrix.md) · [根因与限制](../p1-windows-sdk-http-exit/root-cause.md) · [重新验收门禁](../p1-windows-sdk-http-exit/gate-decision.md)。本轮没有正式第六模块审查、H25或发布。
