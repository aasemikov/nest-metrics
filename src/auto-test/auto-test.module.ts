import { HttpModule } from '@nestjs/axios';
import { Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, Reflector } from '@nestjs/core';
import { AUTO_TEST_METADATA } from './auto-test.constants';
import { AutoTestService } from './auto-test.service';

@Module({
    imports: [HttpModule, DiscoveryModule],
    providers: [AutoTestService],
    exports: [AutoTestService],
})
export class AutoTestModule implements OnModuleInit {
    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly autoTestService: AutoTestService,
        private readonly reflector: Reflector
    ) {}

    onModuleInit() {
        const controllers = this.discoveryService.getControllers();

        for (const wrapper of controllers) {
            const metatype = wrapper.metatype;
            const shouldAutoTest = this.reflector.get<boolean>(AUTO_TEST_METADATA, metatype);

            if (!shouldAutoTest) continue;

            const endpoints = this.extractGetEndpoints(metatype);
            const controllerName = metatype.name || 'UnknownController';

            this.autoTestService.registerControllerEndpoints(controllerName, endpoints);
        }
    }

    private extractGetEndpoints(metatype: any): { path: string; methodName: string }[] {
        const endpoints: { path: string; methodName: string }[] = [];
        const prototype = Object.getPrototypeOf(metatype.prototype);

        const methodNames = Object.getOwnPropertyNames(prototype).filter(
            (name) => name !== 'constructor' && typeof prototype[name] === 'function'
        );

        for (const methodName of methodNames) {
            const methodRef = prototype[methodName];

            const routePath = Reflect.getMetadata('path', methodRef) as string | undefined;
            const requestMethod = Reflect.getMetadata('method', methodRef) as number | undefined;

            if (routePath !== undefined && requestMethod === 0) {
                endpoints.push({ path: routePath, methodName });
            }
        }

        return endpoints;
    }
}
