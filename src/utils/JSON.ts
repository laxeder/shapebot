import { FileMessage, IMessage } from "rompot";

/**
 * * Transforma um dado em binário
 * @param str
 * @returns
 */
export function MarshalBinary(str: any) {
  return Buffer.from(JSON.stringify(str));
}

/**
 * * Transforma um binário em dado
 * @param str
 * @returns Objeto decodificado
 */
export function UnmarshalBinary(str: any) {
  return JSON.parse(Buffer.from(str).toString());
}

export function JSONParse(data: any) {
  try {
    if (typeof data == "object") {
      if (Array.isArray(data)) return data;

      const json: { [key: string]: any } = {};

      Object.keys(data).forEach((key) => {
        json[key] = JSONParse(data[key]);
      });

      return json;
    }

    const value = JSON.parse(`${data}`);

    return value;
  } catch (err) {
    if (`${data}`.startsWith("[") && `${data}`.endsWith("]")) return [];

    return {};
  }
}

export const BufferJSON = {
  replacer: (key: string, value: any) => {
    if (Buffer.isBuffer(value) || value instanceof Uint8Array || value?.type === "Buffer") {
      return { type: "Buffer", data: Buffer.from(value?.data || value).toString("base64") };
    }

    return value;
  },
  reviver: (key: string, value: any) => {
    if (typeof value === "object" && !!value && (value.buffer === true || value.type === "Buffer")) {
      const val = value.data || value.value;
      return typeof val === "string" ? Buffer.from(val, "base64") : Buffer.from(val || []);
    }

    return value;
  },
};

/** * Retorna um JSON contido na mensagem */
export async function getMessageJSON(message: IMessage): Promise<any> {
  try {
    const data = JSONParse(message instanceof FileMessage ? (await message.getFile()).toString() : message.text);

    if (typeof data == "object") return data;

    return {};
  } catch (err) {}

  return {};
}

/**
 * * Comprimento do objeto
 * @param object Objeto que será calculado
 * @returns Retorna o comprimento do objeto
 */
export function len(obj: any): number {
  if (Array.isArray(obj)) return obj.length;

  return Object.keys(obj || {})?.length || 0;
}

export declare type ObjectJSON = { [key: string]: any | ObjectJSON };

/**
 * * Injeta valores de um objeto em outro
 * @param object Objeto com novos valores
 * @param injectableObject Objeto que receberá os novos valores
 * @returns Retorna o objeto com os novos valores
 */
export function injectJSON<T extends ObjectJSON>(objectIn: ObjectJSON, objectOut: T): T {
  if (!!!objectIn) return objectOut;

  Object.keys(objectIn).forEach((keyIn) => {
    const keyOut: keyof T = keyIn.replace(/_(.)/g, (match) => match[1].toUpperCase());

    if (!objectOut.hasOwnProperty(keyOut)) return;

    if (typeof objectOut[keyOut] != typeof objectIn[keyIn]) {
      if (typeof objectOut[keyOut] == "string" && typeof objectIn[keyIn] == "number") {
        objectIn[keyIn] = String(objectIn[keyIn]);
      } else if (typeof objectOut[keyOut] == "number" && typeof objectIn[keyIn] == "string") {
        objectIn[keyIn] = Number(objectIn[keyIn]);
      } else return;
    }

    if (typeof objectOut[keyOut] == "string" && !!!objectIn[keyIn]) return;
    if (Array.isArray(objectOut[keyOut]) && objectIn[keyIn].length == 0) return;

    if (!!objectIn[keyIn] && !!objectOut[keyOut] && typeof objectIn[keyIn] == "object" && typeof objectOut[keyOut] == "object") {
      if (!Array.isArray(objectOut[keyOut])) {
        injectJSON(objectIn[keyIn], objectOut[keyOut]);
      }
    }

    objectOut[keyOut] = objectIn[keyIn];
  });

  return objectOut;
}

/**
 * * Tranforma um objeto em JSON sem letras maiúsculas
 * @param object Objeto que se tornará json
 * @returns Retorna um object json
 */
export function toJSON(object: any): { [key: string]: any } {
  const newObject: { [key: string]: any } = {};

  Object.keys(object).forEach((key) => {
    const newKey = key.replace(/[^a-z]/g, (match) => `_${match[0].toLowerCase()}`);

    newObject[newKey] = object[key];
  });

  return newObject;
}

export declare type PipelineCallback<T extends Array<any>> = (value: T[number], index: number) => any;

/** * Percorre todos os valores de uma array esperando cada um terminar para ir para o próximo */
export async function pipeline<T extends Array<any>, Callback extends PipelineCallback<T>>(arr: T, callback: Callback): Promise<Awaited<ReturnType<Callback>>[]> {
  if (arr.length === 0) return [];

  const rtn: Awaited<ReturnType<Callback>>[] = [];

  const res = async (value: any, index: number): Promise<any> => {
    rtn.push(await callback(value, index));

    if (index + 1 < arr.length) {
      return await res(arr[index + 1], index + 1);
    }
  };

  await res(arr[0], 0);

  return rtn;
}

export declare type ObjectMapCallback<T extends { [x: string]: any }> = (value: T[keyof T], key: keyof T, index: number) => any;

/** * Percorre todos os valores de um objeto */
export async function ObjectMap<T extends { [x: string]: any }, Callback extends ObjectMapCallback<T>>(obj: T, callback: Callback): Promise<Awaited<ReturnType<Callback>>[]> {
  const rtn: Awaited<ReturnType<Callback>>[] = [];

  await ArrayMap(Object.keys(obj), async (key, index) => {
    rtn.push(await callback(obj[key], key, index));
  });

  return rtn;
}

export declare type ObjectFilterCallback<T extends { [x: string]: any }> = (value: T[keyof T], key: keyof T, index: number) => any;

/** * Percorre todos os valores de um objeto */
export async function ObjectFilter<T extends { [x: string]: any }, Callback extends ObjectFilterCallback<T>>(obj: T, callback: Callback): Promise<T> {
  await ArrayMap(Object.keys(obj), async (key, index) => {
    if (!!!(await callback(obj[key], key, index))) delete obj[key];
  });

  return obj;
}

export declare type ArrayMapCallback<T extends Array<any>> = (value: T[number], index: number) => any;

/** * Percorre todos os valores de uma Array */
export async function ArrayMap<T extends Array<any>, Callback extends ArrayMapCallback<T>>(arr: T, callback: Callback): Promise<Awaited<ReturnType<Callback>>[]> {
  const rtn: Awaited<ReturnType<Callback>>[] = [];

  await Promise.all(
    arr.map(async (value, index) => {
      rtn.push(await callback(value, index));
    })
  );

  return rtn;
}

export declare type ArrayFilterCallback<T extends Array<any>> = (value: T[number], index: number) => any;

/** * Percorre todos os valores de uma Array */
export async function ArrayFilter<T extends Array<any>, Callback extends ArrayMapCallback<T>>(arr: T, callback: Callback): Promise<T> {
  const newArr = arr;

  await Promise.all(
    newArr.map(async (value, index) => {
      if (!!!(await callback(value, index))) {
        newArr.splice(index, 1);
      }
    })
  );

  return newArr;
}

/**
 * * Remove elementos repetidos de uma lista
 * @param arr
 * @returns Lista sem elementos repetidos
 */
export function uniqueInSlice(arr: any[]): any[] {
  return arr.filter((value, index, self) => self.indexOf(value) === index);
}

/**
 * * Cria uma array genérica
 * @param length Tamanho da array
 */
export function createGenericArray<T extends any>(length: number): Array<T> {
  let arr: Array<T> = new Array<T>();

  for (let i = 0; i < length; i++) {
    //@ts-ignore
    arr[i] = undefined;
  }

  return arr;
}
