import { BaseMessage } from "../interfaces/action";

export default class BaseAction {
  public action: string;
  public data: any;

  constructor (action: string, data?: any) {
    this.action = action;
    this.data = data;
  }

  getMessage (): BaseMessage {
    const { action, data } = this;
    return { action, data };
  }

  getJSONMessage (): string {
    return JSON.stringify(this.getMessage());
  }
}