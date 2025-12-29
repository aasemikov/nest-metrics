import { HttpService } from '@nestjs/axios';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IAutoTestEndpoint } from '../interfaces/auto-test-endpoint.interface';

@Injectable()
export class AutoTestService implements OnApplicationBootstrap {
    private endpoints: { controllerName: string; endpoints: IAutoTestEndpoint[] }[] = [];

    constructor(private readonly httpService: HttpService) {}

    registerControllerEndpoints(controllerName: string, endpoints: IAutoTestEndpoint[]) {
        if (endpoints.length > 0) {
            this.endpoints.push({ controllerName, endpoints });
        }
    }

    async onApplicationBootstrap() {
        if (this.endpoints.length === 0) {
            console.log('[AutoTest] Нет контроллеров для автоматического тестирования.');
            return;
        }

        console.log(`\n[AutoTest] Запуск тестов для ${this.endpoints.length} контроллеров...\n`);

        const host = process.env.HOST || '127.0.0.1';
        const port = process.env.PORT || '3000';
        const baseUrl = `http://${host}:${port}`;

        for (const { controllerName, endpoints } of this.endpoints) {
            console.log(`\n🔍 [AutoTest] Контроллер: ${controllerName}`);
            for (const endpoint of endpoints) {
                const url = `${baseUrl}${endpoint.path}`;
                const start = Date.now();

                try {
                    console.log(`  → Тестирую: GET ${url}`);
                    const response = await firstValueFrom(this.httpService.get(url));
                    const duration = Date.now() - start;
                    console.log(`    ✅ УСПЕХ: статус ${response.status} (${duration}мс)`);
                } catch (error: any) {
                    const duration = Date.now() - start;
                    const status = error.response?.status || '???';
                    const message = error.message || 'Неизвестная ошибка';
                    console.error(`    ❌ ОШИБКА: статус ${status} (${duration}мс) — ${message}`);
                }
            }
        }

        console.log('\n[AutoTest] Автоматическое тестирование завершено.\n');
    }
}
