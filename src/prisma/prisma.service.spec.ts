import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      jest.spyOn(prismaService, '$connect').mockResolvedValue(undefined);

      await prismaService.onModuleInit();

      expect(prismaService.$connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect', async () => {
      jest.spyOn(prismaService, '$disconnect').mockResolvedValue(undefined);

      await prismaService.onModuleDestroy();

      expect(prismaService.$disconnect).toHaveBeenCalled();
    });
  });
});
