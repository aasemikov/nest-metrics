export interface IAutoTestOptions {
    // Включить автотесты (по умолчанию: true)
    enabled?: boolean;

    // Хост для HTTP-запросов (по умолчанию: '127.0.0.1')
    host?: string;

    // Порт (по умолчанию: 3000)
    port?: number;

    // Таймаут запроса в миллисекундах (по умолчанию: 5000)
    timeoutMs?: number;

    // Логировать успешные вызовы (по умолчанию: true)
    logSuccess?: boolean;

    // Логировать ошибки (по умолчанию: true)
    logErrors?: boolean;

    // Путь к файлам тестов
    autoTestDir?: string;
}

export const DEFAULT_AUTO_TEST_OPTIONS: Required<IAutoTestOptions> = {
    enabled: true,
    host: '127.0.0.1',
    port: 3000,
    timeoutMs: 5000,
    logSuccess: true,
    logErrors: true,
    autoTestDir: './auto-test',
};
