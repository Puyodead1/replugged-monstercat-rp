import { modules } from "./Modules";
import { getClientID } from "./config";

let cacheID = "";
const cache = new Map<string, string>();

export async function getAppAsset(key: string): Promise<string> {
  if (cacheID != getClientID()) {
    cacheID = getClientID();
    cache.clear();
  }

  let ret = cache.get(key);
  if (ret) return ret;

  // ret = (await getAsset(getClientID(), [key]))[0];
  ret = (await modules.assetModule!.fetchAssetIds(getClientID(), [key]))[0];
  cache.set(key, ret);
  return ret;
}
