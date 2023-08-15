import moment from "moment";
import { Logger, common } from "replugged";
import { getAppAsset } from "./assetProvider";
import { cfg, getClientID } from "./config";
import { DEFAULT_TIMEOUT } from "./constants";
import MCatError from "./lib/MCatError";
import { MonstercatCurrentlyPlaying, getCurrentlyPlaying, getImageURL } from "./lib/mcat";
import { Activity, ActivityAssets, ActivityButton, ActivityFlags, ActivityType } from "./types";

function setActivity(activity: Activity | null): void {
  common.fluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    activity,
    socketId: "io.github.puyodead1.MonstercatRP",
  });
}

const logger = Logger.plugin("MonstercatRP");
let isStopped = false;
let timer: NodeJS.Timer | null;
let timeout = DEFAULT_TIMEOUT;

async function runTimer(): Promise<void> {
  // logger.log("Timer!");

  try {
    const activity = (await getActivity()) || null;
    logger.log("Received activity", activity);
    if (timer && !isStopped)
      // Fixes any async weirdness when disabling
      setActivity(activity);
  } catch (e) {
    logger.error("Error getting activity", e);
  }

  if (!isStopped) timer = setTimeout(runTimer, timeout);
}

async function getActivity(): Promise<Activity | undefined> {
  let currentlyPlaying: MonstercatCurrentlyPlaying;
  try {
    if (timeout !== DEFAULT_TIMEOUT) timeout = DEFAULT_TIMEOUT;
    currentlyPlaying = await getCurrentlyPlaying();
  } catch (e) {
    if (e instanceof MCatError && e.statusCode === 404) {
      // probably nothing is playing
      timeout = 30_000;
      logger.log("It seems nothing is playing, waiting 30 seconds");
      return;
    }
    logger.error("Failed to get currently playing", e);
    return;
  }

  const current = currentlyPlaying.CurrentlyPlaying;
  const times = {
    remaining: moment()
      .add(current.Duration, "seconds")
      .subtract(current.CurrentPlayLocation, "seconds"),
    elapsed: moment().subtract(current.CurrentPlayLocation, "seconds"),
  };

  const imageUrl = getImageURL(current.CatalogId);
  const r = await fetch(imageUrl);
  if (!r.ok) throw new Error(`Failed to fetch image: ${r.status} ${r.statusText}`);

  const buttons: ActivityButton[] = [];
  const assets: ActivityAssets = {
    /* eslint-disable @typescript-eslint/naming-convention */
    large_image: r.url,
    large_text: current.CatalogId,
    small_image: "mcat",
    small_text: "Monstercat",
    /* eslint-enable @typescript-eslint/naming-convention */
  };

  buttons.push({
    label: "Play",
    url: `https://www.monstercat.com/release/${current.CatalogId}`,
  });

  if (assets.large_image) assets.large_image = await getAppAsset(assets.large_image);
  if (assets.small_image) assets.small_image = await getAppAsset(assets.small_image);

  /* eslint-disable @typescript-eslint/naming-convention */
  return {
    name: cfg.get("appName") || "Monstercat",
    application_id: getClientID(),
    type: ActivityType.Playing,
    flags: ActivityFlags.Instance,
    details: `${current.ArtistsTitle} - ${current.TrackTitle}${
      current.TrackVersion != "" ? ` (${current.TrackVersion})` : ""
    }`,
    state: `from ${current.ReleaseTitle}`,
    assets,
    timestamps: {
      end: times.remaining.unix(),
    },
    buttons: buttons.map((v) => v.label),
    metadata: {
      button_urls: buttons.map((v) => v.url),
    },
  };
  /* eslint-enable @typescript-eslint/naming-convention */
}

export async function startTimer(): Promise<void> {
  await runTimer();
}

export function stopTimer(): void {
  if (timer) clearInterval(timer);
  timer = null;
  setActivity(null);
  isStopped = true;
}

export async function start(): Promise<void> {
  if (cfg.has("secret")) {
    await startTimer();
  } else {
    logger.warn("No secret found, not starting");
  }
}

export function stop(): void {
  stopTimer();
}

export { Settings } from "./Settings";
