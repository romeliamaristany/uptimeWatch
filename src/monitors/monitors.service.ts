import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { Monitor } from './entities/monitor.entity.js';


@Injectable()
export class MonitorsService {
  private readonly monitors: Monitor[] = [
    {
      id: 1,
      name: 'GitHub API',
      url: 'https://api.github.com',
      intervalSeconds: 60,
      isActive: true,
      createdAt: new Date(),
    },
  ];

  create(createMonitorDto: CreateMonitorDto): Monitor {
    const nextId =
      Math.max(0, ...this.monitors.map(m => m.id)) + 1;

    const newMonitor: Monitor = {
      id: nextId,
      name: createMonitorDto.name,
      url: createMonitorDto.url,
      intervalSeconds: createMonitorDto.intervalSeconds,
      isActive: true,
      createdAt: new Date(),
    };

    this.monitors.push(newMonitor);

    return newMonitor;
  }

  findAll() {
    return this.monitors;
  }

  findOne(id: number): Monitor {
    const monitor = this.monitors.find(
      (monitor) => monitor.id === id,
    )

    if(!monitor){
      throw new NotFoundException(
        `Monitor with ID ${id} not found`,
      )
    }
    return monitor;
  }

  update(id: number, updateMonitorDto: UpdateMonitorDto):Monitor {
    const monitor = this.findOne(id);

    Object.assign(monitor, updateMonitorDto);

    return monitor;
  }

  remove(id: number): void {
    this.findOne(id);

    const index = this.monitors.findIndex(
      (monitor) => monitor.id === id
    );

    this.monitors.splice(index,1);
  }
}
