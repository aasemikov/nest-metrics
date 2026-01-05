import { readFileSync } from 'fs';
import { join } from 'path';
import {
    DEFAULT_AUTO_TEST_OPTIONS,
    IAutoTestOptions,
} from '../interfaces/auto-test-option.interface';

export function loadAutoTestConfig(): Required<IAutoTestOptions> {
    const configPath = join(process.cwd(), '.nestmonitor');

    let userConfig: Partial<IAutoTestOptions> = {};

    try {
        const rawContent = readFileSync(configPath, 'utf8');
        const parsed = JSON.parse(rawContent);

        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            userConfig = parsed;
        }
    } catch (e) {
        // Файл не существует или содержит невалидный JSON — используем значения по умолчанию
        console.warn(`[AutoTest] Не удалось загрузить конфиг-файл, error: ${e}`);
    }

    return {
        ...DEFAULT_AUTO_TEST_OPTIONS,
        ...userConfig,
    };
}
