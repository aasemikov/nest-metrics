import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { IAutoTestRequest } from '../interfaces/auto-test-request.interface';
import { generateTestFilename } from './generate-test-filename.util';

const TEST_DIR = '.auto-test';

export async function loadTestCases(route: string): Promise<IAutoTestRequest[]> {
    const filename = generateTestFilename(route);
    const fullPath = join(process.cwd(), TEST_DIR, filename);

    if (!existsWithCaseSync(fullPath)) {
        return [];
    }

    try {
        delete require.cache[require.resolve(fullPath)];
        const mod = await import(fullPath);
        return Array.isArray(mod.testCases) ? mod.testCases : [];
    } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[AutoTest] Не удалось загрузить тест-файл: ${fullPath}, error: ${e}`);
        }
        return [];
    }
}

function existsWithCaseSync(path: string): boolean {
    if (!existsSync(path)) return false;
    const dir = path.substring(0, path.lastIndexOf('/'));
    const basename = path.substring(dir.length + 1);
    if (dir === '') return true;
    const files = readdirSync(dir);
    return files.includes(basename);
}
