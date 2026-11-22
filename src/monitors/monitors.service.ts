import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonitorDto } from './dto/create-monitor.dto.js';
import { UpdateMonitorDto } from './dto/update-monitor.dto.js';
import { Monitor } from './entities/monitor.entity.js';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class MonitorsService {
  constructor(private readonly prisma: PrismaService){}

  async create(createMonitorDto: CreateMonitorDto) {
    return await this.prisma.monitor.create({
      data:{
        name: createMonitorDto.name,
        url: createMonitorDto.url,
        intervalSeconds: createMonitorDto.intervalSeconds
      }
    })
  }

  async findAll() {
    return await this.prisma.monitor.findMany();
  }

  async findOne(id: number) {
    const monitor = await this.prisma.monitor.findUnique({
      where: {
        id: id
      }
    })

    if(!monitor){
      throw new NotFoundException(
        `Monitor with ID ${id} not found`,
      );
    }

    return monitor;
  }

  async update(id: number, updateMonitorDto: UpdateMonitorDto) {
    await this.findOne(id);

    return this.prisma.monitor.update({
      where: {id},
      data: {
        name: updateMonitorDto.name,
        url: updateMonitorDto.url,
        intervalSeconds: updateMonitorDto.intervalSeconds
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.monitor.delete({
      where: {id}
    })
  }
}
