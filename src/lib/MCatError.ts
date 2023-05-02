import { MonstercatError } from "./mcat";

export default class MCatError extends Error {
  public readonly statusCode: number;
  public constructor(e: MonstercatError) {
    super(e.Message);
    this.name = "MonstercatError";
    this.statusCode = e.StatusCode;
  }
}
