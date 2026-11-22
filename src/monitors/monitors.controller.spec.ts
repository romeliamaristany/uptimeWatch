
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { MonitorsController } from './monitors.controller.js';
import { MonitorsService } from './monitors.service.js';

describe('MonitorsController', () => {
  let controller: MonitorsController;

  const monitorsServiceMock = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [MonitorsController],
        providers: [
          {
            provide: MonitorsService,
            useValue: monitorsServiceMock,
          },
        ],
      }).compile();

    controller = module.get<MonitorsController>(
      MonitorsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
