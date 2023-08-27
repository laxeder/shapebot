import { ButtonMessage, IChat, ListMessage, PollMessage } from "rompot";

export declare type Option = {
  id: string;
  value: string;
  description: string;
  category: string;
};

export declare type PartialOption = { value: string } & Partial<Option>;

export declare type OptionMap = {
  list: ListMessage;
  button: ButtonMessage;
  poll: PollMessage;
};

export default class OptionMessage {
  public text: string = "";
  public options: Option[] = [];
  public extraOptionText: string = "Selecione uma opção";

  constructor(text: string, ...options: PartialOption[]) {
    this.text = text;

    this.addOptions(...options);
  }

  /** * Adiciona novos textos a mensagem */
  public pushText(...texts: string[]): void {
    for (const text of texts) {
      this.text = this.text + text;
    }
  }

  /**
   * * Adicionar opção
   * @param value Texto da opção
   * @param id ID da opção
   * @param description Outra informação da opção
   * @param category Categoria da opção
   */
  public addOption(value: string, id: string = "", description: string = "", category: string = ""): void {
    this.options.push({ value, id, description, category });
  }

  /**
   * * Adicionar varias opções
   * @param options opções que serão adicionadas
   */
  public addOptions(...options: PartialOption[]): void {
    for (const option of options) {
      this.addOption(option.value, option.id, option.description, option.category);
    }
  }

  /**
   * * Remover opção
   * @param option Opção que será removida
   */
  public removeOption(option: PartialOption): void {
    const options: Option[] = [];

    for (const opt of this.options) {
      if (opt.id == option.id) continue;
      if (opt.value == option.value) continue;

      options.push(opt);
    }

    this.options = options;
  }

  /**
   * * Remove várias opções
   * @param options Opções que serão removidas
   */
  public removeOptions(...options: PartialOption[]): void {
    for (const option of options) {
      this.removeOption(option);
    }
  }

  /**
   * * Obtem mensagem combase o tipo
   * @param chat Bate-papo que a mensagem será enviada
   * @param type Tipo da mensagem que será enviada
   * @returns
   */
  public getMessage<T extends keyof OptionMap>(chat: IChat | string, type: T | "poll" = "poll"): OptionMap[T] {
    if (type == "list") {
      //@ts-ignore
      return this.getListMessage(chat);
    }

    if (type == "button") {
      //@ts-ignore
      return this.getButtonMessage(chat);
    }

    if (type == "poll") {
      //@ts-ignore
      return this.getPollMessage(chat);
    }

    //@ts-ignore
    return this.getPollMessage(chat);
  }

  /**
   * * Obtem mensagem de lista
   * @param chat Bate-papo que a mensagem será enviada
   * */
  public getListMessage(chat: IChat | string): ListMessage {
    const msg = new ListMessage(chat, this.text, "Lista");

    const ctgs: { [x: string]: number } = {};

    for (const option of this.options) {
      if (!ctgs.hasOwnProperty(option.category)) {
        ctgs[option.category] = msg.addCategory(option.category);
      }

      msg.addItem(ctgs[option.category], option.value, option.description, option.id);
    }

    return msg;
  }

  /**
   * * Obtem mensagem de botão
   * @param chat Bate-papo que a mensagem será enviada
   * */
  public getButtonMessage(chat: IChat | string): ButtonMessage {
    const msg = new ButtonMessage(chat, this.text);

    for (const option of this.options) {
      msg.addReply(option.value, option.id);
    }

    return msg;
  }

  /**
   * * Obtem mensagem de enquete
   * @param chat Bate-papo que a mensagem será enviada
   * */
  public getPollMessage(chat: IChat | string): PollMessage {
    const msg = new PollMessage(chat, this.text);

    const optionValues: string[] = [];

    for (const index in this.options) {
      if (Number(index) > 11) break;

      const option = this.options[index];

      if (optionValues.includes(option.value)) continue;

      msg.addOption(option.value, option.id);

      optionValues.push(option.value);
    }

    if (msg.options.length == 1) {
      msg.addOption(this.extraOptionText, "poll-ignore");
    }

    return msg;
  }
}
