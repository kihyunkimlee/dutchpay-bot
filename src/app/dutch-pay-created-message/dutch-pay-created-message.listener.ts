import { Injectable } from '@nestjs/common';
import { DutchPayCreatedMessageService } from './dutch-pay-created-message.service';
import { OnEvent } from '@nestjs/event-emitter';
import { BLOCK_ACTION } from '../app.constant';
import { DELETE_DUTCH_PAY_ACTION_ID } from './dutch-pay-created-message.constant';
import { BlockActionsPayload } from '../../modules/slack/types/payloads/block-actions-payload';

@Injectable()
export class DutchPayCreatedMessageListener {
  constructor(private readonly dutchPayCreatedMessageService: DutchPayCreatedMessageService) {}

  @OnEvent(`${BLOCK_ACTION}/${DELETE_DUTCH_PAY_ACTION_ID}`, { async: true })
  handleDeleteDutchPay(blockActionPayload: BlockActionsPayload) {
    return this.dutchPayCreatedMessageService.handleDeleteDutchPay(blockActionPayload);
  }
}
