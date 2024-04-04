import { Logger } from "replugged";

export const logger = Logger.plugin("MonstercatRP");

export const moduleFindFailed = (name: string): boolean => {
  logger.error(`Module ${name} not found!`);
  return false;
};
