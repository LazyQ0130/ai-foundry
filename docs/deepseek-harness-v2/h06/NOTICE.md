# 来源、许可与实验边界

官方来源为DeepSeek Harness固定Commit `f3803c96974ad4a94195fb97e5c637e9c2a3afe3`，Cordis `4.0.6-alpha.1`。少量实现摘录及参考官方事件教程改写的教学代码依MIT许可保留；完整版权与许可见 [SOURCE-LICENSE.txt](SOURCE-LICENSE.txt)。课程增加中文解释、受控门闩、请求夹具和行为断言，没有复制大段官方文档代替授课。

三张图由 [draw_figures.py](scripts/draw_figures.py) 原创生成，SVG是矢量源文件，PNG由浏览器输出；未使用第三方图、官方截图或附带字体文件。图中节点与箭头是带省略的教学关系，不是完整官方实现、消息队列或进程图。

A/B真实使用锁定vendor Cordis/Cosmokit，框架未以Mock替代；course/*事件、Request/Reply、允许布尔值和工具主体是独立教学夹具。AsyncIterable实验也只产出固定片段，不连接模型。C为真实Harness代码定位与解释，官方测试只读，没有运行完整Harness或上游套件。

运行器仅在新建临时环境处理课程文件，继承必要OS启动变量，不读个人Home/.env/真实凭据，不访问私人数据、不联网，不执行批量删除，临时目录保留。emit/bail故障子进程预期非零，属于故意验证错误边界。另有本机QA HTTP服务器只用于教材与图像渲染。

静态HTML没有未挂载的复制按钮；真实复制另用React挂载夹具验证。正文、图和答案保留私有研发路径；本机/course-media映射不表示已部署、已公开或具备线上鉴权。学员理解、学习时长、独立外审和线上权限仍未验证。
