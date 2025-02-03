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
import { NextResponse } from "next/server";
import { interceptorRegistry } from "nextjs-interceptor";
export { interceptorMiddleware as middleware } from "nextjs-interceptor";

// 认证拦截器
interceptorRegistry.use(
  {
    id: "auth",
    pattern: "/demo/*",
    priority: 1,
  },
  async ({ request }) => { 
    const token = request.headers.get("authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // 返回 null 自动继续执行下一个拦截器
    return null;
  }
);

// 配置匹配路径：可以把大部分地址都拦截下来，后续可以转交给 InterceptorRegistry 来处理
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
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
