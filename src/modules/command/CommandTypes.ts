export type CMDRunType = "onExec" | "onReply";

export type MarshalCommand = { id?: string; name: string; type: CMDRunType; args: string[]; isValid: boolean; ignorePrefix: boolean };

export type MarshalArg = any;
