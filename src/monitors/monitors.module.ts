import { Module } from '@nestjs/common';
import { MonitorsService } from './monitors.service.js';
import { MonitorsController } from './monitors.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MonitorsScheduler } from './monitors.scheduler.js';

@Module({
  imports: [PrismaModule],
  controllers: [MonitorsController],
  providers: [MonitorsService, MonitorsScheduler],
})
export class MonitorsModule {}
