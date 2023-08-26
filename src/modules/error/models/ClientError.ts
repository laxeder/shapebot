export default class ClientError extends Error {
  public errors: Error[] = [];

  constructor(name: string, message: string, ...errors: any[]) {
    super(message);

    this.name = name;

    this.errors = errors.filter((err) => err instanceof Error);
  }
}
