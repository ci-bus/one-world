import { Action, MessageBase } from "../interfaces/action";

export default class BaseAction {
  public action: Action;
  public data: any;

  constructor (action: Action, data?: any) {
    this.action = action;
    this.data = data;
  }

  getMessage (): MessageBase {
    const { action, data } = this;
    return { action, data };
  }

  getJSONMessage (): string {
    return JSON.stringify(this.getMessage());
  }
}