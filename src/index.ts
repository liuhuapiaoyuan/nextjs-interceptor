import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

type ReturnResponse = void | Response|NextResponse  | Promise<void | Response |NextResponse >
/**
 * 拦截器处理函数类型
 * @param request - 请求对象(NextAuthRequest/NextRequest)
 */
type InterceptorHandler<T> = ( request: T ,event?: NextFetchEvent) => ReturnResponse 

/**
 * 拦截器配置接口
 */
interface InterceptorConfig {
  /** 拦截器唯一标识 */
  id: string;
  /** 匹配模式：字符串、正则表达式或它们的数组 */
  pattern: string | RegExp | Array<string | RegExp>;
  /** 优先级：数字越小优先级越高 */
  priority?: number;
  /** 匹配条件 */
  conditions?: {
    /** 请求头匹配条件 */
    headers?: Record<string, string | RegExp>;
    /** 查询参数匹配条件 */
    query?: Record<string, string | RegExp>;
    /** Cookie 匹配条件 */
    cookies?: Record<string, string | RegExp>;
  };
}

/** 
 * 已注册的拦截器接口
 */
interface RegisteredInterceptor<T> {
  /** 拦截器配置 */
  config: InterceptorConfig;
  /** 拦截器处理函数 */
  handler: InterceptorHandler<T>;
}

export class InterceptorRegistry<T extends NextRequest = NextRequest> {
  private interceptors: Map<string, RegisteredInterceptor<T>> = new Map();

  use(config: InterceptorConfig, handler: InterceptorHandler<T>) {
    if (this.interceptors.has(config.id)) {
      console.warn(`拦截器 ${config.id} 已存在，将被覆盖`);
    }

    this.interceptors.set(config.id, {
      config: {
        ...config,
        priority: config.priority || 0,
      },
      handler,
    });
    return this;
  }

  getPatterns() {
    return Array.from(this.interceptors.values()).flatMap((i) =>
      Array.isArray(i.config.pattern) ? i.config.pattern : [i.config.pattern]
    );
  }

  getMatchers() {
    return this.getPatterns();
  }


  async handle(request: T,event?: NextFetchEvent): Promise<Awaited<ReturnResponse>> {
    const sortedInterceptors = this.getSortedInterceptors();

    // 依次执行每个拦截器
    for (const interceptor of sortedInterceptors) {
      // 如果拦截器不匹配当前请求，跳过
      if (!this.matches(request, interceptor.config)) {
        continue;
      }
      // 执行拦截器
      const response = await interceptor.handler(request , event);

      // 如果拦截器返回了 Response，直接返回结果
      // 如果返回 null，继续执行下一个拦截器
      if (response !== null) {
        return response;
      }
    }

    // 所有拦截器都执行完了，返回 null
    return;
  }

  private getSortedInterceptors(): RegisteredInterceptor<T>[] {
    return Array.from(this.interceptors.values())
      .sort((a, b) => (a.config.priority || 0) - (b.config.priority || 0));
  }

  private matchesPattern(
    req: NextRequest,
    pattern: string | RegExp | Array<string | RegExp>
  ): boolean {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const pathname = req.nextUrl.pathname;

    return patterns.some((p) => {
      if (typeof p === "string") {
        return new RegExp(p).test(pathname);
      }
      return p.test(pathname);
    });
  }

  private matchesConditions(
    req: NextRequest,
    conditions?: InterceptorConfig["conditions"]
  ): boolean {
    if (!conditions) return true;

    const { headers, query, cookies } = conditions;

    if (
      headers &&
      !this.matchesRecord(Object.fromEntries(req.headers.entries()), headers)
    ) {
      return false;
    }

    if (
      query &&
      !this.matchesRecord(
        Object.fromEntries(req.nextUrl.searchParams.entries()),
        query
      )
    ) {
      return false;
    }
    const _cookies: Record<string, string> = {};
    req.cookies.getAll().forEach((cookie) => {
      _cookies[cookie.name] = cookie.value;
    });
    if (cookies && !this.matchesRecord(_cookies, cookies)) {
      return false;
    }

    return true;
  }

  private matchesRecord(
    actual: Record<string, string>,
    expected: Record<string, string | RegExp>
  ): boolean {
    return Object.entries(expected).every(([key, value]) => {
      const actualValue = actual[key];
      if (!actualValue) return false;

      if (value instanceof RegExp) {
        return value.test(actualValue);
      }
      return value === actualValue;
    });
  }

  private matches(req: NextRequest, config: InterceptorConfig): boolean {
    return (
      this.matchesPattern(req, config.pattern) &&
      this.matchesConditions(req, config.conditions)
    );
  }
}

const singleton = () => {
  return new InterceptorRegistry();
};

declare const globalThis: {
  interceptorRegistry: ReturnType<typeof singleton>;
} & typeof global;

const interceptorRegistry = globalThis.interceptorRegistry ?? singleton();
if (process.env.NODE_ENV !== "production")
  globalThis.interceptorRegistry = interceptorRegistry;

export { interceptorRegistry };
export const interceptorMiddleware = interceptorRegistry.handle.bind(interceptorRegistry)