import { SetMetadata } from '@nestjs/common';
import { IAutoTestMetadata } from '../interfaces/auto-test-metadata.interface';
import { AUTO_TEST_METADATA } from './auto-test.constants';

/**
 * Помечает GET-эндпоинт для автоматического тестирования.
 * @param path Относительный путь к эндпоинту (например, '/health')
 */
export const AutoTest = (path: string): MethodDecorator => {
    return SetMetadata(AUTO_TEST_METADATA, {
        path,
        method: 'GET',
    } as IAutoTestMetadata);
};
