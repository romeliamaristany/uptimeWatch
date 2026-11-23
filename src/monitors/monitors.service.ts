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

  async check(id: number) {
    // 1. Buscar el monitor en PostgreSQL
    const monitor = await this.findOne(id);

    // 2. Registrar cuándo comienza la comprobación
    const startTime = performance.now();

    let status: 'UP' | 'DOWN' = 'DOWN';
    let statusCode: number | null = null;

    try {
      // 3. Realizar una petición HTTP
      const response = await fetch(monitor.url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
        redirect: 'manual',
      });

      statusCode = response.status;

      if(response.status >= 200 && response.status < 400){
        status = 'UP';
      }

    } catch {
      // // 6. Gestionar errores de conexión o timeout
      // const responseTimeMs = Math.round(
      //   performance.now() - startTime,
      // );

      // return {
      //   monitorId: monitor.id,
      //   status: 'DOWN',
      //   statusCode: null,
      //   responseTimeMs,
      //   checkedAt: new Date(),
      // };
    }

    //  4. Calcular el tiempo de respuesta
    const responseTimeMs = Math.round(
      performance.now() - startTime,
    );

    const checkedAt = new Date();

    const check = await this.prisma.monitorCheck.create({
      data:{
        monitorId: monitor.id,
        status,
        statusCode,
        responseTimeMs,
        checkedAt,
      }
    })

    return check;
  }

  async findChecks(id: number){
    await this.findOne(id);

    return this.prisma.monitorCheck.findMany({
      where:{
        id: id
      },
      orderBy: {
        checkedAt: 'desc',
      },
      take: 50,
    })
  }

}
