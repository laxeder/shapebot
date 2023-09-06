export type PipelineCallback<T extends Array<any>> = (value: T[number], index: number) => any;
