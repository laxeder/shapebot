export type ObjectMapCallback<T extends { [x: string]: any }> = (value: T[keyof T], key: keyof T, index: number) => any;
