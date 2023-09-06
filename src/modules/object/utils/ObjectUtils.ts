import { ObjectFilterCallback } from "@modules/object/types/ObjectFilterCallback";
import { ObjectMapCallback } from "@modules/object/types/ObjectMapCallback";
import { ObjectJSON } from "@modules/object/types/ObjectJSON";
import ArrayUtils from "@modules/object/utils/ArrayUtils";
import Client from "rompot";

export default class ObjectUtils {
  /**
   * * Comprimento do objeto
   * @param object Objeto que será calculado
   * @returns Retorna o comprimento do objeto
   */
  public static len(obj: any): number {
    if (Array.isArray(obj)) return obj.length;

    return Object.keys(obj || {})?.length || 0;
  }

  /**
   * * Injeta valores de um objeto em outro
   * @param objectIn Objeto com novos valores
   * @param objectOut Objeto que receberá os novos valores
   * @param force Força a injeção de valores
   * @returns Retorna o objeto com os novos valores
   */
  public static inject<T extends ObjectJSON>(objectIn: any, objectOut: T, force: boolean = false): T {
    if (!objectIn) return objectOut;
    if (typeof objectIn != "object") return objectOut;

    for (const keyIn in objectIn) {
      const keyOut = keyIn as keyof T;

      if (!force && !objectOut.hasOwnProperty(keyOut)) continue;

      if (typeof objectOut[keyOut] != typeof objectIn[keyIn]) {
        if (typeof objectOut[keyOut] == "string" && typeof objectIn[keyIn] == "number") {
          objectIn[keyIn] = String(objectIn[keyIn]);
        } else if (typeof objectOut[keyOut] == "number" && typeof objectIn[keyIn] == "string") {
          objectIn[keyIn] = Number(objectIn[keyIn]);
        } else if (!force) continue;
      }

      if (typeof objectOut[keyOut] == "string" && !!!objectIn[keyIn]) continue;
      if (Array.isArray(objectOut[keyOut]) && objectIn[keyIn].length == 0) continue;

      if (typeof objectIn[keyIn] == "object" && typeof objectOut[keyOut] == "object" && !Array.isArray(objectOut[keyOut])) {
        if (ObjectUtils.isCircular(objectOut[keyOut])) {
          objectOut[keyOut] = objectIn[keyIn];
        } else {
          objectOut[keyOut] = ObjectUtils.inject(objectIn[keyIn], objectOut[keyOut], force);
        }
      } else {
        objectOut[keyOut] = objectIn[keyIn];
      }
    }

    return objectOut;
  }

  public static isCircular(obj: any, seenObjects: any[] = []): boolean {
    if (obj === null || typeof obj !== "object") return false;

    if (seenObjects.includes(obj)) return true;

    for (const key in obj) {
      if (!obj.hasOwnProperty || !obj.hasOwnProperty(key)) continue;
      if (!ObjectUtils.isCircular(obj[key], [...seenObjects, obj])) continue;

      return true;
    }

    return false;
  }

  /**
   * * Tranforma um objeto em JSON
   * @param object Objeto que se tornará json
   * @returns Retorna um object json
   */
  public static toJSON(object: ObjectJSON): ObjectJSON {
    const objectOut: ObjectJSON = {};

    for (const key in object) {
      if (typeof object[key] == "object") {
        if (object[key] instanceof Client) continue;
      }

      //@ts-ignore
      objectOut[key] = JSON.parse(JSON.stringify(object[key], "\n", 2));
    }

    return objectOut;
  }

  /** * Percorre todos os valores de um objeto */
  public static async ObjectMap<T extends { [x: string]: any }, Callback extends ObjectMapCallback<T>>(obj: T, callback: Callback): Promise<Awaited<ReturnType<Callback>>[]> {
    const rtn: Awaited<ReturnType<Callback>>[] = [];

    await ArrayUtils.pipeline(Object.keys(obj), async (key, index) => {
      rtn.push(await callback(obj[key], key, index));
    });

    return rtn;
  }

  /** * Percorre todos os valores de um objeto */
  public static async ObjectFilter<T extends { [x: string]: any }, Callback extends ObjectFilterCallback<T>>(obj: T, callback: Callback): Promise<T> {
    await ArrayUtils.pipeline(Object.keys(obj), async (key, index) => {
      if (!!!(await callback(obj[key], key, index))) delete obj[key];
    });

    return obj;
  }
}
