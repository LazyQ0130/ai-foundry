from pathlib import Path
import hashlib,json
R=Path(__file__).resolve().parents[1];H=R.parent;P=R.parents[3];baseline=json.loads((R/'evidence/baseline.json').read_text());original={f['path']:f['sha256'] for f in baseline['files']};changed=[]
files=['README.md','quality-review.md','coverage-matrix.md','module-six-review-prep/README.md','module-six-review-prep/risks.md','module-six-review-prep/capability-matrix.md','module-six-review-prep/integration-level.md','module-six-review-prep/evidence-index.md']
for name in files:
 path=H/name;archive=R/'original-reports'/name;assert hashlib.sha256(archive.read_bytes()).hexdigest()==original[path.relative_to(P).as_posix()]
 text=archive.read_text(encoding='utf-8');link='../p1-windows-sdk-http-exit/' if name.startswith('module-six-review-prep/') else 'p1-windows-sdk-http-exit/'
 note=f'''\n\n<!-- H24-P1-special-revalidation -->
## P1专项复验补记（2026-11-05）

**当前仍为NO-GO，未解除原P1。** 上文为fd4f147的原交付报告/矩阵，历史正文与原始证据保留；原字节副本在专项original-reports中。

现已定位到Windows x64/官方Node24.16.0默认显式退出的Runtime触发条件：全新正式锁环境的真实SDK+HTTP仍失败，纯Node内置模块最小例关闭Listener后也3/3同断言。三个npm包审计为pretty-ms9.3.1→9.3.0、pure-rand8.4.2→8.4.0、yoctocolors2.2.0→2.1.2；后两项替换前状态由缓存SRI/时间和元数据高可信还原，原before锁缺失，未伪造完整历史。它们不能独立解释无npm也可触发的故障。

候选SDK自然退出补丁只在副本验证，原24.16下H24同23项和H23补丁版同25项通过；经官方SHA核验的Node24.22.1上，固定SDK原版默认出口同23项通过。原23钩子配置、H23原25、Renderer12及1440/390/320回归也过；重复/分支测试不累计成新的独立场景。没有把补丁或替代Runtime写成原24.16基线已修复。

活跃HTTP时EOF/直接Dispose另有终态缺口：exit0、Socket0和端口释放，甚至root Dispose Promise结算，都未观察到持久turn/end。该项保持未通过，不将正常关闭进程等同所有领域事实闭合。正式lib/发行完整Profile/E、产品Web、真实Provider、性能成本、学员试读/实测时长/独立外审和学习负担P2继续开放。

[专项入口]({link}README.md) · [真实退出矩阵]({link}reproduction-matrix.md) · [根因与限制]({link}root-cause.md) · [重新验收门禁]({link}gate-decision.md)。本轮没有正式第六模块审查、H25或发布。
'''
 path.write_text(text.rstrip()+note,encoding='utf-8');changed.append(path.relative_to(P).as_posix())
generator=H/'scripts/write-reports.py';text=generator.read_text(encoding='utf-8');needle="metrics=json.loads((E/'content-check.json').read_text())['metrics'];"
guard="if (R/'p1-windows-sdk-http-exit/evidence/gate-decision.json').exists():raise SystemExit('Historical H24 generator: preserve appended P1 revalidation; use the专项 scripts instead of overwriting current reports.')\n"
if guard not in text:
 assert needle in text;text=text.replace(needle,guard+needle);generator.write_text(text,encoding='utf-8')
changed.append(generator.relative_to(P).as_posix())
(R/'evidence/allowed-parent-changes.json').write_text(json.dumps(changed,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('Eight parent reports appended; historical generator guarded; original bytes retained')
