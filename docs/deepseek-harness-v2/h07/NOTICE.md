# 来源、许可与实验限制

官方来源DeepSeek Harness，固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，vendor Cordis `4.0.6-alpha.1`。少量API形状/源码依据及参考官方生命周期教程的教学改写依MIT许可保留。[Harness原许可](SOURCE-LICENSE.txt)与[Cordis原许可](CORDIS-LICENSE.txt)分别保留DeepSeek和Shigma版权。运行时源码仍在只读研究缓存，没有复制或修改成另一个Cordis实现。

三张SVG及生成器为原创矢量教学图，PNG由真实浏览器输出，不含第三方图片、截图或附带字体文件。状态图为普通非根实例精选路径，关系图含明确省略，不能称完整官方状态机或实现图。

24项作者测试实际加载固定vendor Cordis/Cosmokit；ManualClock和连接布尔值只替代外部资源，受控Node定时器另测。没有以Mock框架或状态常量数组代替生命周期。官方resource-lifecycle/shutdown-drain只读，未执行其递归文件清理、完整Harness或磁盘恢复。

所有运行只用新建临时环境、课程代码、内存夹具和受控时间，不访问真实模型API、个人Home/.env/凭据或用户私人资料。只传OS启动必需变量，不联网；目录保留，不批量删除。本机QA HTTP服务只用于教材/图片检查，未访问外部账户。

静态预览保留原生折叠和可选择代码，不放未水合复制按钮。复制按钮行为在实际React挂载夹具检查。正文、答案和图均保留私有研发路径，/course-media本地映射不代表上线。线上权限、媒体、进度及真实教学效果均未以作者测试替代。
