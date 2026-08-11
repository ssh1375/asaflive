import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "src/auth/permission-decorator";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class DiscoveryPermissionService implements OnApplicationBootstrap {
    private readonly logger = new Logger('Permissions');
    private cached: string[] = [];

    constructor(
        private readonly discovery: DiscoveryService,
        private readonly scanner: MetadataScanner,
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) { }

    collect() {

        let allPermissions: string[] = [];
        const controllers =
            this.discovery.getControllers();

        for (const wrapper of controllers) {
            const controller = wrapper.instance;

            if (!controller) {
                continue;
            }

            const controllerClass = controller.constructor;

            const controllerPermissions =
                this.reflector.get<string[]>(
                    PERMISSIONS_KEY,
                    controllerClass,
                );

            console.log(
                `Controller: ${controllerClass.name}`,
            );

            console.log(
                'Controller permissions:',
                controllerPermissions ?? [],
            );

            const prototype =
                controllerClass.prototype;

            const methodNames = Object.getOwnPropertyNames(
                prototype,
            );

            for (const methodName of methodNames) {
                if (methodName === 'constructor') {
                    continue;
                }

                const method = prototype[methodName];

                if (typeof method !== 'function') {
                    continue;
                }

                const permissions =
                    this.reflector.get<string[]>(
                        PERMISSIONS_KEY,
                        method,
                    );

                if (!permissions) {
                    continue;
                }
                allPermissions = [...allPermissions, ...permissions]
            }
        }
        return allPermissions;
    }
    // async sync(discovered: DiscoveredPermission[]): Promise<void> { /* ...as you have it... */ }

    /** Cached list — no re-scan, safe to call from anywhere after bootstrap. */

    async onApplicationBootstrap() {
        console.log("started service")
        const permissions = this.collect();

        await this.prisma.permission.createMany({
            data: permissions.map((name) => ({
                name,
            })),
            skipDuplicates: true,
        });
    }
}