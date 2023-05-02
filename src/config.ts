import { settings } from "replugged";
import { CLIENT_ID } from "./constants";

interface Settings {
  appName?: string;
  clientID?: string;
  secret?: string;
}

const DEFAULT_SETTINGS: Partial<Settings> = {
  appName: "Monstercat",
};

export const cfg = await settings.init<Settings, keyof typeof DEFAULT_SETTINGS>(
  "io.puyodead1.github.MonstercatRP",
  DEFAULT_SETTINGS,
);

export function getClientID(): string {
  return cfg.get("clientID") || CLIENT_ID;
}

export function getSecret(): string | undefined {
  return cfg.get("secret");
}
