import {
  GatewayActivityAssets as ActivityAssets,
  GatewayActivityButton as ActivityButton,
  ActivityFlags,
  ActivityType,
  GatewayActivity,
} from "discord-api-types/v10";

export { ActivityFlags, ActivityType, ActivityAssets, ActivityButton };

export type Activity = Omit<GatewayActivity, "id" | "created_at"> & {
  metadata?: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    button_urls?: string[];
  };
};
