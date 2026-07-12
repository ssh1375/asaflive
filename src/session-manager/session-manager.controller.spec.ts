import { Test, TestingModule } from '@nestjs/testing';
import { SessionManagerController } from './session-manager.controller';

describe('SessionManagerController', () => {
  let controller: SessionManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionManagerController],
    }).compile();

    controller = module.get<SessionManagerController>(SessionManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
