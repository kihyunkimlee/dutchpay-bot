import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { WebAPICallResult } from '@slack/web-api/dist/WebClient';
import { IModal } from './interfaces/modal.interface';
import { IHome } from './interfaces/home.interface';
import { IMessage } from './interfaces/message.interface';
import { ChatPostMessageResponse } from '@slack/web-api/dist/response/ChatPostMessageResponse';
import { ChatUpdateResponse } from '@slack/web-api/dist/response/ChatUpdateResponse';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceEntity } from '../../database/entities/workspace.entity';

@Injectable()
export class SlackService {
  private readonly webClient = new WebClient();

  constructor(@InjectRepository(WorkspaceEntity) private readonly workspaceRepository: Repository<WorkspaceEntity>) {}

  /**
   *
   * @param teamId
   */
  async getAccessTokenByTeamId(teamId: string): Promise<string | null> {
    const workspace = await this.workspaceRepository.findOneBy({
      id: teamId,
    });

    if (!workspace) {
      return null;
    }

    return workspace.token;
  }

  /**
   * 사용자에게 모달을 엽니다.
   * 참고 : https://api.slack.com/methods/views.open
   * @param args
   */
  async openModal(args: { teamId: string; triggerId: string; modal: IModal }): Promise<WebAPICallResult> {
    const { teamId, triggerId, modal } = args;

    const token = await this.getAccessTokenByTeamId(teamId);

    if (!token) {
      // TODO 예외 처리
      throw new Error();
    }

    return this.webClient.views.open({ token, trigger_id: triggerId, view: modal.toModalView() });
  }

  /**
   * 사용자가 보고 있는 모달을 변경합니다.
   * 참고 : https://api.slack.com/methods/views.update
   * @param args
   */
  async updateModal(args: { teamId: string; viewId: string; modal: IModal }): Promise<WebAPICallResult> {
    const { teamId, viewId, modal } = args;

    const token = await this.getAccessTokenByTeamId(teamId);

    if (!token) {
      // TODO 예외 처리
      throw new Error();
    }

    return this.webClient.views.update({ token, view_id: viewId, view: modal.toModalView() });
  }

  /**
   * 특정 사용자와 상호작용할 Home 탭을 생성(또는 수정)합니다.
   * 참고 : https://api.slack.com/methods/views.publish
   * @param args
   */
  async publishHome(args: { teamId: string; userId: string; home: IHome }): Promise<WebAPICallResult> {
    const { teamId, userId, home } = args;

    const token = await this.getAccessTokenByTeamId(teamId);

    if (!token) {
      // TODO 예외 처리
      throw new Error();
    }

    return this.webClient.views.publish({ token, user_id: userId, view: home.toHomeView() });
  }

  /**
   * 채널(또는 DM)에 구조적인 메시지를 게시합니다.
   * 참고 : https://api.slack.com/methods/chat.postMessage
   */
  async postMessage(args: { teamId: string; channelId: string; message?: IMessage; text: string }): Promise<ChatPostMessageResponse> {
    const { teamId, channelId, message, text } = args;

    const token = await this.getAccessTokenByTeamId(teamId);

    if (!token) {
      // TODO 예외 처리
      throw new Error();
    }

    return this.webClient.chat.postMessage({
      token,
      channel: channelId,
      blocks: message?.toBlocks(),
      text,
    });
  }

  /**
   * 발송했던 메시지 내용을 수정합니다.
   * 참고 : https://api.slack.com/methods/chat.update
   * @param args
   */
  async updateMessage(args: { teamId: string; channelId: string; ts: string; message?: IMessage; text: string }): Promise<ChatUpdateResponse> {
    const { teamId, channelId, ts, message, text } = args;

    const token = await this.getAccessTokenByTeamId(teamId);

    if (!token) {
      // TODO 예외 처리
      throw new Error();
    }

    return this.webClient.chat.update({
      token,
      channel: channelId,
      ts,
      blocks: message?.toBlocks(),
      text: text,
    });
  }

  /**
   * 댓글을 답니다.
   * 참고 : https://api.slack.com/methods/chat.postMessage#threads
   */
  async replyMessage(args: {
    teamId: string;
    channelId: string;
    ts: string;
    message?: IMessage;
    text: string;
    broadcast?: boolean;
  }): Promise<ChatPostMessageResponse> {
    const { teamId, channelId, ts, message, text, broadcast } = args;

    const token = await this.getAccessTokenByTeamId(teamId);

    if (!token) {
      // TODO 예외 처리
      throw new Error();
    }

    return this.webClient.chat.postMessage({
      token,
      channel: channelId,
      thread_ts: ts,
      blocks: message?.toBlocks(),
      text,
      reply_broadcast: broadcast ?? false,
    });
  }
}
