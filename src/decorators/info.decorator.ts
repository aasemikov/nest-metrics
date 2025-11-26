import { UseInterceptors } from '@nestjs/common';
import { RequestLoggingInterceptor } from '../interceptors/request-logging.interceptor';

export function Info() {
    return UseInterceptors(RequestLoggingInterceptor);
}
