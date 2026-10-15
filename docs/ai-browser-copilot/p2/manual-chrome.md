# P2 最小原生 Chrome 验收（一次完成）

只剩产品的原生授权路径需人工补证；不重复28项确定性测试、隐私/限长夹具、worker重启、Lesson Renderer或P1全部流程。预计5分钟；只加载一份已构建的生产扩展，不需要安装依赖、启动dev或模型API。

原生电脑控制此前因无法可靠判定Chrome当前URL而中止；当前可用浏览器工具只操作网页，不能代替原生工具栏点击。作者已用独立Chrome155 headless实际打开受控Side Panel，验证真实消息/提取/React/刷新/切换/worker重启；那个夹具有单独本机host权限，不能据此填写本指南PASS。

## 先打开专用窗口

扩展已由最终Reference生产ZIP解压并核对哈希，稳定加载路径如下。**直接复制这一整行到“加载已解压的扩展程序”的文件夹地址栏，不选源码根目录：**

```text
C:\Users\QYF\Desktop\AIFoundry\.runtime\p2-native-20261014-final\extension
```

可在PowerShell执行下面这一条命令，打开独立Profile，避免之前P1/Phase0扩展或授权干扰。不在原来的日常Chrome窗口里测试：

```powershell
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' '--user-data-dir=C:\Users\QYF\Desktop\AIFoundry\.runtime\p2-native-20261014-final\profile' --no-first-run --no-default-browser-check --new-window 'https://example.com/'
```

在这个窗口打开`chrome://extensions`，开启开发者模式，加载上面的extension目录。名称应为“AI 网页阅读与知识整理助手 · P2”，版本0.2.0。固定本扩展到工具栏，记录卡片上的扩展ID。不要使用带“开发”或“AUTHOR CONTROLLED FIXTURE”的扩展。

## 仅做三组操作

| 编号 | 具体操作 | 预期及需记下的结果 |
|---|---|---|
| P2-22 | 回到https://example.com/，点击工具栏本扩展图标；在原生侧栏点“确认已看到侧栏”，再点“读取当前网页” | 侧栏打开、确认成功、读取成功；标题/来源/正文属于example.com，没有摘要。保存一张带网页地址和侧栏结果的截图；这同时完成P1入口回归及新Profile生产安装验收 |
| P2-23 | 新开标签页访问https://www.iana.org/help/example-domains，先**不点工具栏**，直接在已有侧栏点读取；随后点工具栏本扩展图标再读取。再在这个IANA标签页地址栏输入https://example.com/，导航完成后不点工具栏读取一次，最后点工具栏再读 | 两次未授权/跨源后的读取均拒绝且无旧正文；两次授权后均成功、来源正确。若侧栏未自动留在新tab，使用Chrome侧栏列表恢复它；这个恢复动作不等于点击扩展工具栏。拒绝可为NEEDS_PERMISSION；若错误不同，原样报告 |
| P2-24 | 在成功的example.com页面展开“核对来源与页面代次”，记下token/documentId；刷新网页，观察旧正文清除，再读并比较。最后到chrome://version点读取，随后回普通网页点工具栏重读 | 刷新清旧正文，新token/documentId不同；同源grant可能仍在，所以刷新后可直接读成功是正常的。chrome://version拒绝且不残留旧正文，回普通页可恢复。按钮均能继续操作，无新增扩展错误 |

不需要等待worker空闲、手动终止worker、再做隐私/超长页或第二个Profile，这些已有本轮自动化证据。若出现差异，只停在失败组，把错误原文给我，不需要从头重复三组。

## 一次回复即可

请按实际操作填写，可复制：

```text
P2-22：安装/工具栏打开/确认/HTTPS读取：____
P2-23：新tab未授权拒绝____，授权读取____；同tab跨源拒绝____，重授权读取____；无旧正文____
P2-24：刷新清空____，token/documentId改变____；内置页拒绝____，返回恢复____；无新增错误____
扩展ID：____
确实在上述独立窗口完成：是/否
```

一张成功截图、一张拒绝截图足够辅助定位；原生交互结论以真实操作和明确回复为准，不用配置文件或代码断言替代。若没执行，保留未执行，不能填“符合预期”。

## 出错时最少收集什么

先记发生组号、完整错误、网页URL和扩展ID。在`chrome://extensions`看本扩展是否有“错误”；点“Service Worker”查看后台Console；在侧栏正文右键“检查”看侧栏Console，复现一次并截图。不要只截网页Console。日志中的个人网页和密钥不要发送。本课无API，出现fetch或模型Key提示说明加载错了工程。

P2-22/23/24在收到实际结果前均为BLOCKED；当前报告不宣布P2 GO。完成后只更新P2验收与报告，不进入P3、不发布。
