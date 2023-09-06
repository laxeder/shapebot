import { PipelineCallback } from "@modules/object/types/PipelineCallback";
import { ArrayMapCallback } from "@modules/object/types/ArrayMapCallback";

export default class ArrayUtils {
  /** * Percorre todos os valores de uma Array */
  public static async ArrayMap<T extends Array<any>, Callback extends ArrayMapCallback<T>>(arr: T, callback: Callback): Promise<Awaited<ReturnType<Callback>>[]> {
    const rtn: Awaited<ReturnType<Callback>>[] = [];

    await ArrayUtils.pipeline(arr, async (value, index) => {
      rtn.push(await callback(value, index));
    });

    return rtn;
  }

  /** * Percorre todos os valores de uma Array */
  public static async ArrayFilter<T extends Array<any>, Callback extends ArrayMapCallback<T>>(arr: T, callback: Callback): Promise<T> {
    const newArr = arr;

    await ArrayUtils.pipeline(newArr, async (value, index) => {
      if (!!!(await callback(value, index))) {
        newArr.splice(index, 1);
      }
    });

    return newArr;
  }

  /**
   * * Remove elementos repetidos de uma lista
   * @param arr
   * @returns Lista sem elementos repetidos
   */
  public static uniqueInSlice(arr: Array<any>) {
    return arr.filter((value, index, self) => self.indexOf(value) === index);
  }

  /**
   * * Cria uma array genérica
   * @param length Tamanho da array
   */
  public static createGeneric<T extends any>(length: number): Array<T> {
    let arr: Array<T> = new Array<T>();

    for (let i = 0; i < length; i++) {
      //@ts-ignore
      arr[i] = undefined;
    }

    return arr;
  }

  /** * Percorre todos os valores de uma array esperando cada um terminar para ir para o próximo */
  public static async pipeline<T extends Array<any>, Callback extends PipelineCallback<T>>(arr: T, callback: Callback): Promise<Awaited<ReturnType<Callback>>[]> {
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
}
