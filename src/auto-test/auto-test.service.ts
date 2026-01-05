import { HttpService } from '@nestjs/axios';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { IAutoTestEndpoint } from '../interfaces/auto-test-endpoint.interface';
import { loadAutoTestConfig } from '../utils/load-config.util';
import { loadTestCases } from '../utils/load-test.cases.util';

@Injectable()
export class AutoTestService implements OnApplicationBootstrap {
    private endpoints: { controllerName: string; endpoints: IAutoTestEndpoint[] }[] = [];
    private readonly options = loadAutoTestConfig();

    constructor(private readonly httpService: HttpService) {}

    private async testEndpointUrl(url: string): Promise<void> {
        const { timeoutMs, logSuccess, logErrors } = this.options;
        const start = Date.now();

        try {
            await firstValueFrom(this.httpService.get(url, { timeout: timeoutMs }));
            const duration = Date.now() - start;
            if (logSuccess) {
                console.log(`  ✅ ${url} → OK (${duration}мс)`);
            }
        } catch (error: unknown) {
            const axiosError = error as { response?: { status: number } };
            const duration = Date.now() - start;
            const status = axiosError.response?.status || '???';
            if (logErrors) {
                console.error(`  ❌ ${url} → ${status} (${duration}мс)`);
            }
        }
    }

    registerControllerEndpoints(controllerName: string, endpoints: IAutoTestEndpoint[]) {
        if (endpoints.length > 0) {
            this.endpoints.push({ controllerName, endpoints });
        }
    }

    async onApplicationBootstrap() {
        if (!this.options.enabled || this.endpoints.length === 0) {
            return;
        }

        const { host, port } = this.options;
        const baseUrl = `http://${host}:${port}`;

        console.log(`\n[AutoTest] Запуск тестов для ${this.endpoints.length} контроллеров...\n`);

        for (const { controllerName, endpoints } of this.endpoints) {
            console.log(`🔍 Контроллер: ${controllerName}`);
            for (const { path } of endpoints) {
                const hasParams = path.includes(':') || path.includes('*');

                if (hasParams) {
                    const testCases = await loadTestCases(path);

                    if (testCases.length === 0) {
                        console.log(`  ⚠️ Пропущен (нет .test.js): ${path}`);
                        continue;
                    }

                    for (const testCase of testCases) {
                        const url = `${baseUrl}${testCase.path}`;
                        await this.testEndpointUrl(url);
                    }
                } else {
                    const url = `${baseUrl}${path}`;
                    await this.testEndpointUrl(url);
                }
            }
        }

        console.log('\n[AutoTest] Завершено.\n');
    }
}
