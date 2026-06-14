
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { RbacController } from './rbac.controller';
import { beforeEach, describe, it, expect } from 'vitest';
import { RbacService } from './rbac.service';




describe('rbac domain test', () => {
  let rbacController: RbacController;
  let rbacServiceMock: DeepMockProxy<RbacService>;

  beforeEach(() => {
    rbacServiceMock = mockDeep<RbacService>();
    rbacController = new RbacController(rbacServiceMock as any);
  });

  it('should be defined', () => {
    expect(rbacController).toBeDefined();
  });

})