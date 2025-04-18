import { getPreferenceValues } from "@raycast/api";

export interface HarborPreferences {
  registryUrl: string;
  defaultProject: string | undefined;
  authType: string;
  username: string;
  password: string;
  cookies: string;
}

export function getHarborPreferences(): HarborPreferences {
  const rawValues = getPreferenceValues<HarborPreferences>();

  const registryUrl = rawValues.registryUrl.startsWith("http")
    ? rawValues.registryUrl
    : `https://${rawValues.registryUrl}`;

  return {
    registryUrl,
    defaultProject: rawValues.defaultProject,
    authType: rawValues.authType,
    username: rawValues.username,
    password: rawValues.password,
    cookies: rawValues.cookies,
  };
}
