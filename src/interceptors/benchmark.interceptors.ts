import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';

@Injectable()
export class BenchmarkInterceptor implements NestInterceptor {
    private readonly logger = new Logger(BenchmarkInterceptor.name);

    constructor(private reflector: Reflector) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<unknown>,
    ): Observable<unknown> | Promise<Observable<unknown>> {
        const isBanchmark = this.reflector.get<boolean>('benchmark', context.getHandler());
        if (!isBanchmark) return next.handle();

        const className = context.getClass().name;
        const methodName = context.getHandler().name;
        const start = Date.now();

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start;
                this.logger.log(`${className}.${methodName} executed in ${duration}ms`);
            }),
        );
    }
}
