import { common, components, util } from "replugged";
import { startTimer } from ".";
import { cfg } from "./config";
import { CLIENT_ID } from "./constants";

const { React } = common;
const { Divider, Text, TextInput } = components;

export function Settings(): React.ReactElement {
  const { value, onChange } = util.useSetting(cfg, "secret");

  const onStreamingWidgetURLChange = (value: string) => {
    const { searchParams } = new URL(value);
    if (!searchParams.has("code")) return;
    const secret = searchParams.get("code") as string;
    onChange(secret);

    startTimer();
  };

  return (
    <div>
      <Text.Eyebrow style={{ marginBottom: "5px" }}>App Name</Text.Eyebrow>
      <TextInput {...util.useSetting(cfg, "appName")} placeholder="Monstercat" />
      <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />

      <Text.Eyebrow style={{ marginBottom: "5px" }}>Discord Client ID</Text.Eyebrow>
      <TextInput {...util.useSetting(cfg, "clientID")} placeholder={CLIENT_ID} />
      <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />

      <Text.Eyebrow style={{ marginBottom: "5px" }}>Monstercat Streaming Widget URL</Text.Eyebrow>
      <TextInput value={value} onChange={onStreamingWidgetURLChange} />
      <Divider style={{ marginTop: "10px", marginBottom: "10px" }} />
    </div>
  );
}
