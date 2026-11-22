import { Module } from '@nestjs/common';
import { MonitorsService } from './monitors.service.js';
import { MonitorsController } from './monitors.controller.js';

@Module({
  controllers: [MonitorsController],
  providers: [MonitorsService],
})
export class MonitorsModule {}
