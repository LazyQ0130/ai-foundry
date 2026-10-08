# Capstone Provider Compatibility Decision

2026-10-08 · Phase A4 follow-up · Status: DECISION RECORDED; alternatives NOT TESTED / NOT SELECTED FOR RELEASE.

## Evidence and decision

A3 proved ten correctly named forced functions arrived with stop. A4 now accepts stop or tool_calls only with one strictly valid plan_research_step. This corrected the metadata mismatch: 22 accepted calls used STOP_WITH_VALID_FORCED_FUNCTION. However, A4 Run2/turn0 returned HTTP200, length, zero functions, 500 output tokens, 2147 content characters, 7059ms. Overall 9/10 runs; INVALID_MODEL_TURN=1. This is a **PROVIDER COMPATIBILITY BLOCKER** under the fixed release gate, not evidence that every Qwen function call fails or that all models behave alike.

Keep the safe normalization and fail closed on length/zero call. No retry, fallback, cap increase, model/API switch or additional paid probe is performed in A4. Do not start A5 to tune the same protocol. Next work is a separately scoped provider qualification using the existing decision envelope and safety gates.

## Options

| Option | Evidence / advantage | Cost or uncertainty | Decision |
|---|---|---|---|
| A. qwen3.7-flash / current Chat Completions | Actual A4 evidence; 9 READY, 22 accepted decision calls; no migration | One length/zero-function response fails the 10/10 gate; no basis to declare stable or retry until green | Do not qualify this exact tested configuration for release |
| B. Another documented Function Calling Qwen, e.g. qwen3.8-max / Chat Completions | Official specific-function example uses this model with thinking disabled; preserves the adapter and isolates model as the changed variable | Account/region access, exact model version, price, latency, action accuracy and protocol reliability remain unverified | Recommended first qualification candidate; no switch executed |
| C. Qwen / Model Studio Responses API | Official API documents custom function_call output, Qwen3.7-flash support, and incomplete status at output limit | Different request/response parser and tool_choice grammar; no guarantee of stability for this workload; account/endpoint support unverified | Alternative if B is unsuitable; separately qualify API, preferably holding model fixed |

The recommendation for B is an engineering inference about reducing migration variables, not a claim that it is more accurate or reliable. No candidate has passed a real qualification here.

## Documentation basis

The [official Function Calling guide](https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen-function-calling) shows a named tool_choice object with qwen3.8-max and enable_thinking=false. It also distinguishes this from required and warns that thinking mode does not support the named-object selection. Documentation support is not account availability or a runtime guarantee.

The [official Responses reference](https://www.alibabacloud.com/help/en/model-studio/qwen-api-via-openai-responses) lists qwen3.7-flash and describes custom function_call outputs. Its tool_choice uses the documented allowed_tools form; it must not inherit Chat Completions syntax blindly. Generation at max_output_tokens yields incomplete and must be rejected. It defaults store=true: a future isolated adapter should explicitly use store=false, with no provider-managed conversation history, built-in search, remote MCP or tools that bypass the application Registry. Only listed API parameters are processed, so each safety parameter needs verification.

## Qualification contract for separate next work

Pin and record model/API/endpoint region without credentials; confirm account access and published parameters before paid calls. Change one variable at a time, keeping the synthetic fixture set, strict decision/actions/source policy/exact external query/Registry and bounded runtime. Do not add retry or relax length handling. Each candidate needs a predeclared bounded sample with 5 PRIVATE_ONLY + 5 PRIVATE_AND_EXTERNAL, real function counts/finish or completion status/tokens/discarded-content/latency/decision actions, 10/10 protocol-valid and zero INVALID_MODEL_TURN before full smoke. Do not pool runs across candidates or rerun failures to fill successes.

Only a qualified candidate may proceed to a fresh one-invocation Full Local Staging Smoke and then five real Proposal contract samples. Cloud Verification and Publishing remain independent outstanding gates. A4 does not authorize implementation or paid testing of B/C.
