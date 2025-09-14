import { Module } from '@nestjs/common';
import { PlanningPokerGateway } from './planning-poker/planning-poker.gateway';
import { PlanningPokerService } from './planning-poker/planning-poker.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PlanningPokerGateway, PlanningPokerService],
})
export class AppModule {}
