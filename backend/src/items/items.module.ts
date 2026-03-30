import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MatchingService } from './strategies/matching.strategy';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ItemsController],
  providers: [ItemsService, MatchingService],
  exports: [ItemsService],
})
export class ItemsModule {}