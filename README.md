# Next.js Interceptor

一个强大而灵活的 Next.js 中间件拦截器，用于处理请求和响应的操作。

## 特性

- 🚀 基于 Next.js Middleware 构建
- 🛡️ 支持请求和响应的拦截和修改
- 🔄 灵活的中间件链式调用
- 📦 TypeScript 支持
- 🎯 零配置，即插即用
- 🔧 高度可定制的拦截规则

## 安装

使用 pnpm 安装依赖：

```bash
pnpm install
```

## 使用方法

1. 在你的 Next.js 项目中创建 `middleware.ts` 文件：

```typescript
import { createInterceptor } from 'nextjs-interceptor';

// 创建拦截器实例
const interceptor = createInterceptor();

// 配置拦截规则
export default interceptor
  .match('/api/*')
  .use(async (req, res, next) => {
    // 在这里处理请求
    await next();
    // 在这里处理响应
  });

// 配置匹配路径
export const config = {
  matcher: '/:path*',
};
```

## 开发

```bash
# 启动开发服务器
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test
```

## 许可证

ISC

## 作者

liuhuapiaoyuan
