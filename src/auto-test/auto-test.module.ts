import { HttpModule } from '@nestjs/axios';
import { Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, Reflector } from '@nestjs/core';
import { IAutoTestMetadata } from '../interfaces/auto-test-metadata.interface';
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

        for (const controller of controllers) {
            const instance = controller.instance;
            const prototype = Object.getPrototypeOf(instance);

            const methodNames = Object.getOwnPropertyNames(prototype).filter(
                (name) => name !== 'constructor' && typeof prototype[name] === 'function'
            );

            for (const methodName of methodNames) {
                const methodRef = prototype[methodName];
                const metadata = this.reflector.get<IAutoTestMetadata>(
                    AUTO_TEST_METADATA,
                    methodRef
                );

                if (metadata && metadata.method === 'GET' && metadata.path) {
                    this.autoTestService.registerEndpoint(
                        metadata,
                        controller.metatype,
                        methodName
                    );
                }
            }
        }
    }
}
