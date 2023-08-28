import type { CMDRunType, MarshalArg, MarshalCommand } from "@modules/command/types/CommandTypes";
import { CMDRun } from "@modules/command/models/CommandRun";
import Command from "@modules/command/models/Command";

export default class MarshalCMD {
  /** * Obtem um protocolo de comando */
  public static getMarshalCommand(command: string | Command<any>, type: CMDRunType = CMDRun.Reply, ...args: MarshalArg[]): MarshalCommand {
    const cmdName = command instanceof Command ? command.id : command;
    const id = command instanceof Command ? `${command.id}` : undefined;

    return { id, name: cmdName, args, type, ignorePrefix: true, isValid: true };
  }

  /** * Cria um protocolo de ID */
  public static MarshalID(command: string | Command<any>, type: CMDRunType = CMDRun.Reply, ...args: MarshalArg[]): string {
    return JSON.stringify(MarshalCMD.getMarshalCommand(command, type, ...args));
  }

  /** * Restaura um ID */
  public static UnmarshalID(id: string, type: CMDRunType = CMDRun.Reply, ignorePrefix: boolean = false): MarshalCommand {
    const defaultJson: MarshalCommand = { isValid: false, name: id, type, ignorePrefix, args: [] };

    try {
      if (id.split(/{(.*?)}/).length <= 1) {
        return defaultJson;
      }

      const json = JSON.parse(id);

      if (!!!json.name) return defaultJson;

      return { ...json, isValid: true };
    } catch (err) {
      return defaultJson;
    }
  }

  /** * Obtem o protocolo de um comando */
  public static get(cmd: string | Command<any> | MarshalCommand, defaultType: CMDRun = CMDRun.Exec): MarshalCommand {
    if (cmd instanceof Command) {
      const marshal = MarshalCMD.get(MarshalCMD.gen(cmd, defaultType));

      marshal.ignorePrefix = true;

      return marshal;
    }

    if (typeof cmd === "string") {
      const marshal = MarshalCMD.UnmarshalID(cmd);

      if (!marshal.isValid) {
        marshal.id = cmd;
        marshal.name = cmd;
      }

      return MarshalCMD.get(marshal, defaultType);
    }

    if (!cmd.isValid) {
      cmd.type = defaultType;
    }

    return cmd;
  }

  /** * Obtem o protocolo de execução de um comando */
  public static getExec(text: string) {
    return MarshalCMD.get(text, CMDRun.Exec);
  }

  /** * Obtem o protocolo de resposta de um comando */
  public static getReply(text: string) {
    return MarshalCMD.get(text, CMDRun.Reply);
  }

  /** * Gera o protocolo de um comando em JSON */
  public static genJSON(cmd: string | Command<any> | MarshalCommand, defaultType: CMDRun = CMDRun.Exec, ...args: MarshalArg[]): MarshalCommand {
    if (cmd instanceof Command) {
      return MarshalCMD.genJSON(cmd.id, defaultType, ...args);
    }

    if (typeof cmd === "string") {
      let marshal = MarshalCMD.UnmarshalID(cmd, defaultType);

      if (!marshal.isValid) {
        marshal.id = cmd;
        marshal.name = cmd;
        marshal.ignorePrefix = true;
      }

      return MarshalCMD.genJSON(marshal, defaultType, ...args);
    }

    if (!cmd.isValid) {
      cmd.type = defaultType;
      cmd.args = args;
      cmd.isValid = true;
    }

    return cmd;
  }

  /** * Gera o protocolo de um comando */
  public static gen(cmd: string | Command<any> | MarshalCommand, defaultType: CMDRun = CMDRun.Exec, ...args: MarshalArg[]): string {
    return JSON.stringify(MarshalCMD.genJSON(cmd, defaultType, ...args));
  }

  /** * Gera o protocolo de execução de um comando */
  public static genExec(cmd: string | Command<any> | MarshalCommand, ...args: MarshalArg[]): string {
    return MarshalCMD.gen(cmd, CMDRun.Exec, ...args);
  }

  /** * Gera o protocolo de resposta de um comando */
  public static genReply(cmd: string | Command<any> | MarshalCommand, ...args: MarshalArg[]): string {
    return MarshalCMD.gen(cmd, CMDRun.Reply, ...args);
  }
}
