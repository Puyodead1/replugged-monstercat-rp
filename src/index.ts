import moment from "moment";
import { Logger, common } from "replugged";
import { getAppAsset } from "./assetProvider";
import { cfg, getClientID } from "./config";
import { MonstercatCurrentlyPlaying, getCurrentSong, getImageURL } from "./lib/mcat";
import { Activity, ActivityAssets, ActivityButton, ActivityFlags, ActivityType } from "./types";

function setActivity(activity: Activity | null): void {
  common.fluxDispatcher.dispatch({
    type: "LOCAL_ACTIVITY_UPDATE",
    activity,
    socketId: "io.github.puyodead1.MonstercatRP",
  });
}

const logger = Logger.plugin("MonstercatRP");
let timer: NodeJS.Timer | null;

async function runTimer(): Promise<void> {
  // logger.log("Timer!");

  try {
    const activity = (await getActivity()) || null;
    logger.log("Received activity", activity);
    if (timer)
      // Fixes any async weirdness when disabling
      setActivity(activity);
  } catch (e) {
    logger.error("Error getting activity", e);
  }
}

async function getActivity(): Promise<Activity | undefined> {
  let currentlyPlaying: MonstercatCurrentlyPlaying;
  try {
    currentlyPlaying = await getCurrentSong();
  } catch (e) {
    logger.error("Failed to get current song");
    logger.error(e);
    return;
  }

  if (!currentlyPlaying) {
    logger.log("No current song?");
    return;
  }

  const current = currentlyPlaying.CurrentlyPlaying;
  const times = {
    remaining: moment()
      .add(current.Duration, "seconds")
      .subtract(current.CurrentPlayLocation, "seconds"),
    elapsed: moment().subtract(current.CurrentPlayLocation, "seconds"),
  };

  const buttons: ActivityButton[] = [];
  const assets: ActivityAssets = {
    /* eslint-disable @typescript-eslint/naming-convention */
    large_image: getImageURL(current.CatalogId),
    large_text: current.CatalogId,
    small_image: "mcat",
    small_text: "Monstercat RP",
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
    type: ActivityType.Listening,
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
  timer = setInterval(runTimer, 10_000);
  await runTimer();
}

export function stopTimer(): void {
  if (timer) clearInterval(timer);
  timer = null;
  setActivity(null);
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
