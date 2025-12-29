import { HttpService } from '@nestjs/axios';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IAutoTestEndpoint } from '../interfaces/auto-test-endpoint.interface';
import { loadAutoTestConfig } from '../utils/load-config.util';

@Injectable()
export class AutoTestService implements OnApplicationBootstrap {
    private endpoints: { controllerName: string; endpoints: IAutoTestEndpoint[] }[] = [];
    private readonly options = loadAutoTestConfig();

    constructor(private readonly httpService: HttpService) { }

    registerControllerEndpoints(controllerName: string, endpoints: IAutoTestEndpoint[]) {
        if (endpoints.length > 0) {
            this.endpoints.push({ controllerName, endpoints });
        }
    }

    async onApplicationBootstrap() {
        if (!this.options.enabled || this.endpoints.length === 0) {
            return;
        }

        const { host, port, timeoutMs, logSuccess, logErrors } = this.options;
        const baseUrl = `http://${host}:${port}`;

        console.log(`\n[AutoTest] Запуск тестов для ${this.endpoints.length} контроллеров...\n`);

        for (const { controllerName, endpoints } of this.endpoints) {
            console.log(`🔍 Контроллер: ${controllerName}`);
            for (const { path } of endpoints) {
                const url = `${baseUrl}${path}`;
                const start = Date.now();

                try {
                    await firstValueFrom(this.httpService.get(url, { timeout: timeoutMs }));
                    const duration = Date.now() - start;
                    if (logSuccess) {
                        console.log(`  ✅ ${url} → OK (${duration}мс)`);
                    }
                } catch (error: unknown) {
                    const axiosError = error as { response?: { status: number }; message?: string };
                    const duration = Date.now() - start;
                    const status = axiosError.response?.status || '???';
                    if (logErrors) {
                        console.error(`  ❌ ${url} → ${status} (${duration}мс)`);
                    }
                }
            }
        }

        console.log('\n[AutoTest] Завершено.\n');
    }
}
