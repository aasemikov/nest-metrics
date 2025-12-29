import { SetMetadata } from '@nestjs/common';
import { AUTO_TEST_METADATA } from './auto-test.constants';

/**
 * Помечает весь контроллер для автоматического тестирования всех GET-эндпоинтов.
 */
export const AutoTest = (): ClassDecorator => {
    return SetMetadata(AUTO_TEST_METADATA, true);
};
