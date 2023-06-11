import { Module } from '@nestjs/common';
import { DutchPayRequestMessageListener } from './dutch-pay-request-message.listener';
import { DutchPayRequestMessageService } from './dutch-pay-request-message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantEntity } from '../../modules/dutch-pay/entities/participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ParticipantEntity])],
  providers: [DutchPayRequestMessageListener, DutchPayRequestMessageService],
})
export class DutchPayRequestMessageModule {}