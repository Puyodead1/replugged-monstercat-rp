import { webpack } from "replugged";
import { moduleFindFailed } from "./utils";

export interface AssetModule {
  fetchAssetIds: (applicationId: string, assetKeys: string[]) => Promise<string[]>;
}

export const modules: {
  assetModule: AssetModule | null;
  init: () => Promise<boolean>;
} = {
  assetModule: null,
  init: async () => {
    modules.assetModule = await webpack.waitForModule<AssetModule>(
      webpack.filters.byProps("fetchAssetIds", "getAssetFromImageURL"),
      {
        timeout: 10000,
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!modules.assetModule) return moduleFindFailed("AssetModule");

    return true;
  },
};
