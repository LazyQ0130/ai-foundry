# 上游诊断输入

Node官方issue56645与PR61999为外部佐证，不替代本机失败；Node两版node_platform.cc、PR patch及官方SHASUMS仅作差异/身份核对。本机未获得C++native stack。

- https://github.com/nodejs/node/issues/56645
- https://github.com/nodejs/node/pull/61999
- https://raw.githubusercontent.com/nodejs/node/v24.16.0/src/node_platform.cc
- https://raw.githubusercontent.com/nodejs/node/v24.22.1/src/node_platform.cc
- https://nodejs.org/dist/v24.16.0/SHASUMS256.txt
- https://nodejs.org/dist/v24.22.1/SHASUMS256.txt

Node来源版权/许可见LICENSE-node.txt。官方Runtime仅下载到本轮隔离临时目录，二进制不入Git，不修改用户全局安装。仅实测Windows x64两版，不推断所有版本区间或非Windows。
