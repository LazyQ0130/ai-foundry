# 跨课真实行为验证与实际轨迹

固定Commit、真实组件与替身见[test-evidence.md](test-evidence.md)。运行：`node docs/deepseek-harness-v2/module-three-review/scripts/run-probes.mjs`。五例均为D级，绝无外部网络、真实模型或磁盘后端；模型端脚本，工具端常量。A/B/C是场景名，不是证据等级。每次Loop请求在llm/stream入口捕获，另在Adapter.stream捕获实际边界；对每次Loop输入用另一真实Session从当时事件前缀重建messages/config/tools/toolHistory并deepEqual，不靠关键词。

原始JSON保留完整trace、events、messages、assembly、loopRequests及adapterRequests，signal仅在输出时去掉不可序列化对象；重建不包括旧AbortController、HTTP字节与任意插件外部状态。

| 场景 | Turn / Step / 请求 / 工具 | 结算 |
|---|---|---|
| A | 1 / 1 / 1 / 0 | assistant/message@9；completed |
| B | 1 / 2 / 2 / 1 | assistant/message@9, assistant/message@16；completed |
| C-retry | 1 / 1 / 2 / 0 | assistant/attempt@9, assistant/message@10；completed |
| C-cancel | 1 / 1 / 1 / 0 | assistant/message@9；aborted |
| C-max-tokens | 1 / 1 / 1 / 0 | assistant/message@9；max-tokens |

A验证正常创建→任务→回答→退出。B第一Step提出调用，第二Step实际接收工具结果后回答；request钩子改变tone，使下一Step系统文本从简洁变详细，验证Prompt改变可解释且旧请求不被改。C-retry用Adapter.next断流抛TRANSPORT，真实Runtime规范化，失败草稿只在attempt stream；明确retry同Step第二请求成功。C-cancel在文本和半截工具参数已交付门之后本地取消，安全前缀成为interrupted message，工具不执行。C-max-tokens补核闭合合法工具仍被丢弃。

所有committed end逐条核先有匹配事实、eventType/seq准确；紧凑流expand逐片等于live chunks；正常dispose之后Agent/Session实时登记为空。没有把这些结果称真实规划能力或完整应用通过。

以下顺序从原始trace position生成；仅省略重复chunk行，全部逐片数据仍在JSON，不制造新事件。request编号为作者对Adapter实调用的计数。

## A的实际轨迹
[完整JSON](evidence/cross-course/A.json)

计数：`{"assembleCount": 1, "preStepCount": 1, "requestCount": 1, "bodyCalls": 0}`。

| position | 通道 | 实际观察 |
|---:|---|---|
| 0 | control | registry.create |
| 1 | live | session/created |
| 2 | control | setup |
| 3 | control | setup.commit |
| 4 | live | agent/created |
| 5 | control | create-return |
| 6 | fact | agent/inbox/spliced seq=0 |
| 7 | fact | turn/start seq=1 turn=1 |
| 8 | fact | agent/inbox/spliced seq=2 |
| 9 | control | assemble |
| 10 | control | pre-step |
| 11 | fact | step/start seq=3 turn=1 step=1 |
| 12 | control | agent/request |
| 13 | request | adapter.prepareCall |
| 14 | fact | system/message seq=4 turn=1 step=1 |
| 15 | fact | user/message seq=5 |
| 16 | fact | user/message seq=6 |
| 17 | fact | request/header seq=7 |
| 18 | fact | request/context seq=8 |
| 19 | live | assistant/start m3-A:1 |
| 20 | request | llm/stream |
| 21 | external-model | adapter.stream |
| 24 | fact | assistant/message seq=9 turn=1 step=1 interrupted=False |
| 25 | live | assistant/end {"kind": "committed", "eventType": "assistant/message", "seq": 9} |
| 26 | fact | step/end seq=10 turn=1 step=1 |
| 27 | fact | turn/end seq=11 turn=1 completed |
| 28 | live | agent/disposed |
| 29 | live | session/disposed |

### 实际模型请求1的关键内容

```json
{
  "provider": "fixture",
  "model": "scripted",
  "maxTokens": 96,
  "messages": [
    {
      "role": "system",
      "source": {
        "kind": "system-prompt"
      },
      "content": [
        {
          "type": "text",
          "text": "代码助手：简洁"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "user"
      },
      "content": [
        {
          "type": "text",
          "text": "请概括固定README"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "runtime-context",
        "form": "snapshot",
        "sections": [
          {
            "name": "directory",
            "text": "/fixture/after"
          }
        ]
      },
      "content": [
        {
          "type": "text",
          "text": "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\n/fixture/after"
        }
      ]
    }
  ],
  "tools": [
    {
      "name": "read_fixture",
      "description": "fixed constant only",
      "parameters": {
        "type": "object",
        "properties": {
          "part": {
            "type": "string"
          }
        }
      }
    }
  ]
}
```

对应Loop前缀止于seq=8；重建比较messages/config/tools/toolHistory全部通过。

## B的实际轨迹
[完整JSON](evidence/cross-course/B.json)

计数：`{"assembleCount": 2, "preStepCount": 2, "requestCount": 2, "bodyCalls": 1}`。

| position | 通道 | 实际观察 |
|---:|---|---|
| 0 | control | registry.create |
| 1 | live | session/created |
| 2 | control | setup |
| 3 | control | setup.commit |
| 4 | live | agent/created |
| 5 | control | create-return |
| 6 | fact | agent/inbox/spliced seq=0 |
| 7 | fact | turn/start seq=1 turn=1 |
| 8 | fact | agent/inbox/spliced seq=2 |
| 9 | control | assemble |
| 10 | control | pre-step |
| 11 | fact | step/start seq=3 turn=1 step=1 |
| 12 | control | agent/request |
| 13 | request | adapter.prepareCall |
| 14 | fact | system/message seq=4 turn=1 step=1 |
| 15 | fact | user/message seq=5 |
| 16 | fact | user/message seq=6 |
| 17 | fact | request/header seq=7 |
| 18 | fact | request/context seq=8 |
| 19 | live | assistant/start m3-B:1 |
| 20 | request | llm/stream |
| 21 | external-model | adapter.stream |
| 27 | fact | assistant/message seq=9 turn=1 step=1 interrupted=False |
| 28 | live | assistant/end {"kind": "committed", "eventType": "assistant/message", "seq": 9} |
| 29 | fact | tool/call seq=10 turn=1 step=1 |
| 30 | tool | tool-body |
| 31 | fact | tool/result seq=11 turn=1 step=1 |
| 32 | fact | step/end seq=12 turn=1 step=1 |
| 33 | control | assemble |
| 34 | control | pre-step |
| 35 | fact | step/start seq=13 turn=1 step=2 |
| 36 | control | agent/request |
| 37 | request | adapter.prepareCall |
| 38 | fact | system/message seq=14 turn=1 step=2 |
| 39 | fact | request/header seq=15 |
| 40 | live | assistant/start m3-B:2 |
| 41 | request | llm/stream |
| 42 | external-model | adapter.stream |
| 45 | fact | assistant/message seq=16 turn=1 step=2 interrupted=False |
| 46 | live | assistant/end {"kind": "committed", "eventType": "assistant/message", "seq": 16} |
| 47 | fact | step/end seq=17 turn=1 step=2 |
| 48 | fact | turn/end seq=18 turn=1 completed |
| 49 | live | agent/disposed |
| 50 | live | session/disposed |

### 实际模型请求1的关键内容

```json
{
  "provider": "fixture",
  "model": "scripted",
  "maxTokens": 96,
  "messages": [
    {
      "role": "system",
      "source": {
        "kind": "system-prompt"
      },
      "content": [
        {
          "type": "text",
          "text": "代码助手：简洁"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "user"
      },
      "content": [
        {
          "type": "text",
          "text": "请概括固定README"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "runtime-context",
        "form": "snapshot",
        "sections": [
          {
            "name": "directory",
            "text": "/fixture/after"
          }
        ]
      },
      "content": [
        {
          "type": "text",
          "text": "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\n/fixture/after"
        }
      ]
    }
  ],
  "tools": [
    {
      "name": "read_fixture",
      "description": "fixed constant only",
      "parameters": {
        "type": "object",
        "properties": {
          "part": {
            "type": "string"
          }
        }
      }
    }
  ]
}
```

对应Loop前缀止于seq=8；重建比较messages/config/tools/toolHistory全部通过。

### 实际模型请求2的关键内容

```json
{
  "provider": "fixture",
  "model": "scripted",
  "maxTokens": 96,
  "messages": [
    {
      "role": "system",
      "source": {
        "kind": "system-prompt"
      },
      "content": [
        {
          "type": "text",
          "text": "代码助手：详细"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "user"
      },
      "content": [
        {
          "type": "text",
          "text": "请概括固定README"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "runtime-context",
        "form": "snapshot",
        "sections": [
          {
            "name": "directory",
            "text": "/fixture/after"
          }
        ]
      },
      "content": [
        {
          "type": "text",
          "text": "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\n/fixture/after"
        }
      ]
    },
    {
      "role": "assistant",
      "source": {
        "kind": "model",
        "provider": "fixture",
        "model": "scripted"
      },
      "content": [
        {
          "type": "text",
          "text": "先读资料"
        },
        {
          "type": "tool-call",
          "id": "module-read",
          "name": "read_fixture",
          "arguments": "{\"part\":\"README\"}"
        }
      ]
    },
    {
      "role": "tool",
      "source": {
        "kind": "tool",
        "callId": "module-read"
      },
      "toolCallId": "module-read",
      "content": [
        {
          "type": "text",
          "text": "README: MODULE THREE FIXTURE"
        }
      ]
    }
  ],
  "tools": [
    {
      "name": "read_fixture",
      "description": "fixed constant only",
      "parameters": {
        "type": "object",
        "properties": {
          "part": {
            "type": "string"
          }
        }
      }
    }
  ]
}
```

对应Loop前缀止于seq=15；重建比较messages/config/tools/toolHistory全部通过。

## C-retry的实际轨迹
[完整JSON](evidence/cross-course/C-retry.json)

计数：`{"assembleCount": 1, "preStepCount": 1, "requestCount": 2, "bodyCalls": 0}`。

| position | 通道 | 实际观察 |
|---:|---|---|
| 0 | control | registry.create |
| 1 | live | session/created |
| 2 | control | setup |
| 3 | control | setup.commit |
| 4 | live | agent/created |
| 5 | control | create-return |
| 6 | fact | agent/inbox/spliced seq=0 |
| 7 | fact | turn/start seq=1 turn=1 |
| 8 | fact | agent/inbox/spliced seq=2 |
| 9 | control | assemble |
| 10 | control | pre-step |
| 11 | fact | step/start seq=3 turn=1 step=1 |
| 12 | control | agent/request |
| 13 | request | adapter.prepareCall |
| 14 | fact | system/message seq=4 turn=1 step=1 |
| 15 | fact | user/message seq=5 |
| 16 | fact | user/message seq=6 |
| 17 | fact | request/header seq=7 |
| 18 | fact | request/context seq=8 |
| 19 | live | assistant/start m3-C-retry:1 |
| 20 | request | llm/stream |
| 21 | external-model | adapter.stream |
| 24 | fact | assistant/attempt seq=9 turn=1 step=1 |
| 25 | live | assistant/end {"kind": "committed", "eventType": "assistant/attempt", "seq": 9} |
| 26 | control | request-error/retry |
| 27 | control | agent/request |
| 28 | request | adapter.prepareCall |
| 29 | live | assistant/start m3-C-retry:2 |
| 30 | request | llm/stream |
| 31 | external-model | adapter.stream |
| 34 | fact | assistant/message seq=10 turn=1 step=1 interrupted=False |
| 35 | live | assistant/end {"kind": "committed", "eventType": "assistant/message", "seq": 10} |
| 36 | fact | step/end seq=11 turn=1 step=1 |
| 37 | fact | turn/end seq=12 turn=1 completed |
| 38 | live | agent/disposed |
| 39 | live | session/disposed |

### 实际模型请求1的关键内容

```json
{
  "provider": "fixture",
  "model": "scripted",
  "maxTokens": 96,
  "messages": [
    {
      "role": "system",
      "source": {
        "kind": "system-prompt"
      },
      "content": [
        {
          "type": "text",
          "text": "代码助手：简洁"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "user"
      },
      "content": [
        {
          "type": "text",
          "text": "请概括固定README"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "runtime-context",
        "form": "snapshot",
        "sections": [
          {
            "name": "directory",
            "text": "/fixture/after"
          }
        ]
      },
      "content": [
        {
          "type": "text",
          "text": "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\n/fixture/after"
        }
      ]
    }
  ],
  "tools": [
    {
      "name": "read_fixture",
      "description": "fixed constant only",
      "parameters": {
        "type": "object",
        "properties": {
          "part": {
            "type": "string"
          }
        }
      }
    }
  ]
}
```

对应Loop前缀止于seq=8；重建比较messages/config/tools/toolHistory全部通过。

### 实际模型请求2的关键内容

```json
{
  "provider": "fixture",
  "model": "scripted",
  "maxTokens": 96,
  "messages": [
    {
      "role": "system",
      "source": {
        "kind": "system-prompt"
      },
      "content": [
        {
          "type": "text",
          "text": "代码助手：简洁"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "user"
      },
      "content": [
        {
          "type": "text",
          "text": "请概括固定README"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "runtime-context",
        "form": "snapshot",
        "sections": [
          {
            "name": "directory",
            "text": "/fixture/after"
          }
        ]
      },
      "content": [
        {
          "type": "text",
          "text": "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\n/fixture/after"
        }
      ]
    }
  ],
  "tools": [
    {
      "name": "read_fixture",
      "description": "fixed constant only",
      "parameters": {
        "type": "object",
        "properties": {
          "part": {
            "type": "string"
          }
        }
      }
    }
  ]
}
```

对应Loop前缀止于seq=9；重建比较messages/config/tools/toolHistory全部通过。

## C-cancel的实际轨迹
[完整JSON](evidence/cross-course/C-cancel.json)

计数：`{"assembleCount": 1, "preStepCount": 1, "requestCount": 1, "bodyCalls": 0}`。

| position | 通道 | 实际观察 |
|---:|---|---|
| 0 | control | registry.create |
| 1 | live | session/created |
| 2 | control | setup |
| 3 | control | setup.commit |
| 4 | live | agent/created |
| 5 | control | create-return |
| 6 | fact | agent/inbox/spliced seq=0 |
| 7 | fact | turn/start seq=1 turn=1 |
| 8 | fact | agent/inbox/spliced seq=2 |
| 9 | control | assemble |
| 10 | control | pre-step |
| 11 | fact | step/start seq=3 turn=1 step=1 |
| 12 | control | agent/request |
| 13 | request | adapter.prepareCall |
| 14 | fact | system/message seq=4 turn=1 step=1 |
| 15 | fact | user/message seq=5 |
| 16 | fact | user/message seq=6 |
| 17 | fact | request/header seq=7 |
| 18 | fact | request/context seq=8 |
| 19 | live | assistant/start m3-C-cancel:1 |
| 20 | request | llm/stream |
| 21 | external-model | adapter.stream |
| 24 | fact | assistant/message seq=9 turn=1 step=1 interrupted=True |
| 25 | live | assistant/end {"kind": "committed", "eventType": "assistant/message", "seq": 9} |
| 26 | fact | step/end seq=10 turn=1 step=1 |
| 27 | fact | turn/end seq=11 turn=1 aborted |
| 28 | live | agent/disposed |
| 29 | live | session/disposed |

### 实际模型请求1的关键内容

```json
{
  "provider": "fixture",
  "model": "scripted",
  "maxTokens": 96,
  "messages": [
    {
      "role": "system",
      "source": {
        "kind": "system-prompt"
      },
      "content": [
        {
          "type": "text",
          "text": "代码助手：简洁"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "user"
      },
      "content": [
        {
          "type": "text",
          "text": "请概括固定README"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "runtime-context",
        "form": "snapshot",
        "sections": [
          {
            "name": "directory",
            "text": "/fixture/after"
          }
        ]
      },
      "content": [
        {
          "type": "text",
          "text": "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\n/fixture/after"
        }
      ]
    }
  ],
  "tools": [
    {
      "name": "read_fixture",
      "description": "fixed constant only",
      "parameters": {
        "type": "object",
        "properties": {
          "part": {
            "type": "string"
          }
        }
      }
    }
  ]
}
```

对应Loop前缀止于seq=8；重建比较messages/config/tools/toolHistory全部通过。

## C-max-tokens的实际轨迹
[完整JSON](evidence/cross-course/C-max-tokens.json)

计数：`{"assembleCount": 1, "preStepCount": 1, "requestCount": 1, "bodyCalls": 0}`。

| position | 通道 | 实际观察 |
|---:|---|---|
| 0 | control | registry.create |
| 1 | live | session/created |
| 2 | control | setup |
| 3 | control | setup.commit |
| 4 | live | agent/created |
| 5 | control | create-return |
| 6 | fact | agent/inbox/spliced seq=0 |
| 7 | fact | turn/start seq=1 turn=1 |
| 8 | fact | agent/inbox/spliced seq=2 |
| 9 | control | assemble |
| 10 | control | pre-step |
| 11 | fact | step/start seq=3 turn=1 step=1 |
| 12 | control | agent/request |
| 13 | request | adapter.prepareCall |
| 14 | fact | system/message seq=4 turn=1 step=1 |
| 15 | fact | user/message seq=5 |
| 16 | fact | user/message seq=6 |
| 17 | fact | request/header seq=7 |
| 18 | fact | request/context seq=8 |
| 19 | live | assistant/start m3-C-max-tokens:1 |
| 20 | request | llm/stream |
| 21 | external-model | adapter.stream |
| 27 | fact | assistant/message seq=9 turn=1 step=1 interrupted=False |
| 28 | live | assistant/end {"kind": "committed", "eventType": "assistant/message", "seq": 9} |
| 29 | fact | step/end seq=10 turn=1 step=1 |
| 30 | fact | turn/end seq=11 turn=1 max-tokens |
| 31 | live | agent/disposed |
| 32 | live | session/disposed |

### 实际模型请求1的关键内容

```json
{
  "provider": "fixture",
  "model": "scripted",
  "maxTokens": 96,
  "messages": [
    {
      "role": "system",
      "source": {
        "kind": "system-prompt"
      },
      "content": [
        {
          "type": "text",
          "text": "代码助手：简洁"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "user"
      },
      "content": [
        {
          "type": "text",
          "text": "请概括固定README"
        }
      ]
    },
    {
      "role": "user",
      "source": {
        "kind": "runtime-context",
        "form": "snapshot",
        "sections": [
          {
            "name": "directory",
            "text": "/fixture/after"
          }
        ]
      },
      "content": [
        {
          "type": "text",
          "text": "Current runtime context. This snapshot supersedes earlier runtime-context snapshots.\n\n/fixture/after"
        }
      ]
    }
  ],
  "tools": [
    {
      "name": "read_fixture",
      "description": "fixed constant only",
      "parameters": {
        "type": "object",
        "properties": {
          "part": {
            "type": "string"
          }
        }
      }
    }
  ]
}
```

对应Loop前缀止于seq=8；重建比较messages/config/tools/toolHistory全部通过。

## 失败记录与限制

首轮因新夹具误读Session返回值，未到取消门而超时；第二轮B误读tool/result关联字段4/5；修复后5/5，增强下一Step系统文本断言后再次5/5。原始run-*.json/tests-*.tap均保留，准确时间与程序hash在原件。并未把任意一次历史失败覆盖后只报PASS。

C已稳定复现断流+受策略重试与部分文本取消；没有强行运行未知外部工具、真实HTTP断网、跨进程崩溃或整个Harness E。提供方in-band-aborted、结算拒绝等由H12原D覆盖；测验16中的“取消+写拒绝”组合是源码推导，未另实跑。
