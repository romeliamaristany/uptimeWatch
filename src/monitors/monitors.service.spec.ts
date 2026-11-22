
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { MonitorsService } from './monitors.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';

describe('MonitorsService', () => {
  let service: MonitorsService;

  const prismaMock = {
    monitor: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          MonitorsService,
          {
            provide: PrismaService,
            useValue: prismaMock,
          },
        ],
      }).compile();

    service = module.get<MonitorsService>(MonitorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  //findAll
  it('should return all monitors', async () => {
    const monitors = [
      {
        id: 1,
        name: 'Google',
        url: 'https://google.com',
        intervalSeconds: 60,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    prismaMock.monitor.findMany.mockResolvedValue(monitors);

    const result = await service.findAll();

    expect(result).toEqual(monitors);

    expect(prismaMock.monitor.findMany)
      .toHaveBeenCalledOnce();
  });


  it('should return an empty array when no monitors exist', async () => {
    prismaMock.monitor.findMany.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);

    expect(prismaMock.monitor.findMany)
      .toHaveBeenCalledOnce();
  });

  //findone
  it('should return a monitor by ID', async () => {
    // ARRANGE: preparar los datos
    const monitor = {
      id: 1,
      name: 'Google',
      url: 'https://google.com',
      intervalSeconds: 60,
      isActive: true,
      createdAt: new Date(),
    };

    prismaMock.monitor.findUnique.mockResolvedValue(monitor);

    // ACT: ejecutar el método
    const result = await service.findOne(1);

    // ASSERT: comprobar los resultados
    expect(result).toEqual(monitor);

    expect(prismaMock.monitor.findUnique)
      .toHaveBeenCalledWith({
        where: { id: 1 },
      });
  });


  it('should throw NotFoundException if monitor does not exist', async () => {
    // ARRANGE: Prisma no encuentra el monitor
    prismaMock.monitor.findUnique.mockResolvedValue(null);

    // ACT + ASSERT: comprobar que lanza una excepción
    await expect(service.findOne(999))
      .rejects.toThrow(NotFoundException);

    expect(prismaMock.monitor.findUnique)
      .toHaveBeenCalledWith({
        where: { id: 999 },
      });
  });

  //create
  it('should create a monitor successfully', async () => {
    // ARRANGE: datos enviados por el cliente
    const createMonitorDto = {
      name: 'Google',
      url: 'https://google.com',
      intervalSeconds: 60,
    };

    // Simulamos el registro devuelto por Prisma
    const createdMonitor = {
      id: 1,
      ...createMonitorDto,
      isActive: true,
      createdAt: new Date(),
    };

    prismaMock.monitor.create.mockResolvedValue(createdMonitor);

    // ACT: ejecutar el método real
    const result = await service.create(createMonitorDto);

    // ASSERT: comprobar el resultado
    expect(result).toEqual(createdMonitor);

    expect(prismaMock.monitor.create).toHaveBeenCalledWith({
      data: {
        name: createMonitorDto.name,
        url: createMonitorDto.url,
        intervalSeconds: createMonitorDto.intervalSeconds,
      },
    });

    expect(prismaMock.monitor.create).toHaveBeenCalledOnce();
  });


  it('should propagate an error if Prisma fails to create a monitor', async () => {
    // ARRANGE
    const createMonitorDto = {
      name: 'Google',
      url: 'https://google.com',
      intervalSeconds: 60,
    };

    const databaseError = new Error('Database connection failed');

    prismaMock.monitor.create.mockRejectedValue(databaseError);

    // ACT + ASSERT
    await expect(service.create(createMonitorDto))
      .rejects.toThrow('Database connection failed');

    expect(prismaMock.monitor.create).toHaveBeenCalledOnce();
  });

//update
  it('should update a monitor successfully', async () => {
    const monitor = {
      id: 1,
      name: 'Google',
      url: 'https://google.com',
      intervalSeconds: 60,
      isActive: true,
      createdAt: new Date(),
    };

    const updateMonitorDto = {
      name: 'Google Updated',
      intervalSeconds: 120,
    };

    const updatedMonitor = {
      ...monitor,
      ...updateMonitorDto,
    };

    prismaMock.monitor.findUnique.mockResolvedValue(monitor);
    prismaMock.monitor.update.mockResolvedValue(updatedMonitor);

    const result = await service.update(1, updateMonitorDto);

    expect(result).toEqual(updatedMonitor);

    expect(prismaMock.monitor.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(prismaMock.monitor.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        name: 'Google Updated',
        url: undefined,
        intervalSeconds: 120,
      },
    });
  });

  it('should throw NotFoundException when updating a non-existent monitor', async () => {
    prismaMock.monitor.findUnique.mockResolvedValue(null);

    await expect(
      service.update(999, { name: 'Updated' }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.monitor.update).not.toHaveBeenCalled();
  });


  //remove
  it('should delete a monitor successfully', async () => {
    const monitor = {
      id: 1,
      name: 'Google',
      url: 'https://google.com',
      intervalSeconds: 60,
      isActive: true,
      createdAt: new Date(),
    };

    prismaMock.monitor.findUnique.mockResolvedValue(monitor);
    prismaMock.monitor.delete.mockResolvedValue(monitor);

    const result = await service.remove(1);

    expect(result).toBeUndefined();

    expect(prismaMock.monitor.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });

    expect(prismaMock.monitor.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should throw NotFoundException when deleting a non-existent monitor', async () => {
    prismaMock.monitor.findUnique.mockResolvedValue(null);

    await expect(
      service.remove(999),
    ).rejects.toThrow(NotFoundException);

    expect(prismaMock.monitor.delete).not.toHaveBeenCalled();
  });


});
