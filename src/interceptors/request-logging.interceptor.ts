import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<unknown> | Promise<Observable<unknown>> {
        const now = Date.now();

        const request = context.switchToHttp().getRequest();
        const userAgent = request.headers['user-agent'] || 'Unknown User Agent';
        const method = request.method;
        const url = request.url;
        const query = request.query || 'Unknown params';
        const body = request.body || 'Unknown body';

        console.log(`[${method}] ${url} - Начало запроса, User-Agent: ${userAgent}`);

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - now;

                console.log(`[${method}] ${url} - Запрос завершен за ${duration}мс.`);
                console.log('--- Метрики запроса ---');
                console.log(`  Метод: ${method}`);
                console.log(`  URL: ${url}`);
                console.log(`  User Agent: ${userAgent}`);
                console.log(`  Params: ${JSON.stringify(query)}`);
                console.log(`  Body: ${JSON.stringify(body)}`);
                console.log(`  Время выполнения: ${duration}мс`);
                console.log('------------------------');
            })
        );
    }
}
