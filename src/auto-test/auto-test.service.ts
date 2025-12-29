import { HttpService } from '@nestjs/axios';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { firstValueFrom } from 'rxjs';
import { IAutoTestMetadata } from '../interfaces/auto-test-metadata.interface';

@Injectable()
export class AutoTestService implements OnApplicationBootstrap {
    private endpoints: Required<IAutoTestMetadata>[] = [];

    constructor(
        private readonly httpService: HttpService,
        private readonly reflector: Reflector
    ) {}

    registerEndpoint(metadata: IAutoTestMetadata, controller: unknown, methodName: string) {
        this.endpoints.push({
            ...metadata,
            controller,
            methodName,
        });
    }

    async onApplicationBootstrap() {
        if (this.endpoints.length === 0) {
            console.log('[AutoTest] Нет эндпоинтов для автоматического тестирования.');
            return;
        }

        console.log(
            `\n[AutoTest] Запуск автоматических тестов для ${this.endpoints.length} GET-эндпоинтов...\n`
        );

        const host = process.env.HOST || '127.0.0.1';
        const port = process.env.PORT || '3000';
        const baseUrl = `http://${host}:${port}`;

        for (const endpoint of this.endpoints) {
            const url = `${baseUrl}${endpoint.path}`;
            const start = Date.now();

            try {
                console.log(`[AutoTest] Тестирую: GET ${url}`);
                const response = await firstValueFrom(this.httpService.get(url));
                const duration = Date.now() - start;
                console.log(
                    `✅ [AutoTest] УСПЕХ: ${url} → статус ${response.status} (${duration}мс)`
                );
            } catch (error: any) {
                const duration = Date.now() - start;
                const status = error.response?.status || '???';
                const message = error.message || 'Неизвестная ошибка';
                console.error(
                    `❌ [AutoTest] ОШИБКА: ${url} → статус ${status} (${duration}мс) — ${message}`
                );
            }
        }

        console.log('[AutoTest] Автоматическое тестирование завершено.\n');
    }
}
