import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { MonitorsService } from "./monitors.service.js";
import { Interval } from "@nestjs/schedule";


@Injectable()
export class MonitorsScheduler {
  private readonly logger = new Logger(MonitorsScheduler.name);

  private isRunning = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitorsService: MonitorsService,
  ) {}

  @Interval(10000)
  async checkMonitors() {
    // Evitar ejecuciones simultáneas del scheduler
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    try {
      // Consultar únicamente los monitores activos
      const monitors = await this.prisma.monitor.findMany({
        where: {
          isActive: true,
        },
        include: {
          checks: {
            orderBy: {
              checkedAt: 'desc',
            },
            take: 1,
          },
        },
      });

      for (const monitor of monitors) {
        const lastCheck = monitor.checks[0];

        const now = Date.now();

        const elapsedSeconds = lastCheck
          ? (now - lastCheck.checkedAt.getTime()) / 1000
          : Infinity;

        // Si todavía no corresponde comprobarlo, continuar
        if (elapsedSeconds < monitor.intervalSeconds) {
          continue;
        }

        try {
          const result = await this.monitorsService.check(
            monitor.id,
          );

          this.logger.log(
            `Monitor ${monitor.name}: ${result.status}`,
          );
        } catch (error) {
          this.logger.error(
            `Error checking monitor ${monitor.id}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }
    } catch (error) {
      this.logger.error(
        'Error running monitor scheduler',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.isRunning = false;
    }
  }
}