# AGENTS.md

## 工作规则

- 完成任务后，不要运行 `preview`、`build`、`test`、`lint` 或任何自检命令。
- 完成任务后，直接说明已完成的内容，并提供用户可手动验证的命令。
- 安装依赖时优先使用 `pnpm`。
- 添加新的生产依赖前必须先征得确认。
- 优先做最小改动，避免大范围重构。
- 遵循现有项目结构和命名约定。
- 避免创建不必要的文件。
- 尽量使用 TypeScript 严格类型。

## JavaScript / TypeScript 规则

- JavaScript 和 TypeScript 文件中优先使用 `function` 声明，而不是箭头函数。
- `stores` 目录下的函数必须使用箭头函数形式。
- `utils` 和 `services` 目录下的函数必须包含 JSDoc 注释。
- TypeScript 枚举必须使用 PascalCase 命名，并且以 `Enum` 结尾。
- 枚举示例：`UserRoleEnum`、`LoginTypeEnum`。
- 组件名称必须使用 PascalCase。

## Services 规则

- `services` 目录中的请求封装函数必须使用 `fetch` 前缀，并结合请求路径含义命名。
- 前端服务模块必须放在 `frontend/src/services/modules` 下。
- 每个前端服务模块都应该导出封装好的请求函数，例如 `frontend/src/services/modules/user.js`。
- `frontend/src/services/modules` 下的函数必须使用箭头函数形式，并且要加 JSDoc 注释。
- `frontend/src/services/modules/index.js` 作为所有模块函数的桶文件导出入口。
- 示例：请求路径 `api/v1/login` 对应函数名 `fetchLogin`。
