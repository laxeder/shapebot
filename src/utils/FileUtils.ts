import { readdirSync, statSync } from "fs";
import { parse, resolve } from "path";

export default class FileUtils {
  /** Lê um diretório recursivamente */
  public static async readRecursiveDir<Callback extends (fileptah: string, filename: string, ext: string) => any>(dir: string, callback: Callback): Promise<ReturnType<Awaited<Callback>>[]> {
    const rtn: ReturnType<Awaited<Callback>>[] = [];

    try {
      await Promise.all(
        readdirSync(dir).map(async (filename) => {
          const filepath = resolve(dir, filename);
          const stat = statSync(filepath);
          const isFile = stat.isFile();

          if (!isFile) {
            rtn.push(...(await FileUtils.readRecursiveDir(filepath, callback)));

            return;
          }

          rtn.push(await callback(filepath, filename, parse(filename).ext));
        })
      );
    } catch (err) {}

    return rtn;
  }
}
