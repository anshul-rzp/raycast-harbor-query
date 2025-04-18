import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useListArtifacts } from "@/hooks/use-list-artifacts";
import { formatSize, truncateString } from "@/utils/formatting";
import { QueryProvider } from "@/providers/react-query";
import { getHarborPreferences } from "@/utils/preferences";

export function ArtifactsListView(props: { projectName?: string; repositoryName?: string }) {
  const { defaultProject, registryUrl } = getHarborPreferences();

  const [searchText, setSearchText] = useState("");

  const [projectName, repositoryName] = useMemo(() => {
    if (!searchText.length) return [props.projectName ?? defaultProject ?? "", props.repositoryName ?? ""];

    const [arg1, arg2] = searchText.split("/");
    if (!arg2) return [defaultProject ?? "", arg1];
    return [arg1, arg2];
  }, [searchText]);

  const artifactsList = useListArtifacts({ projectName, repositoryName });

  return (
    <List
      isLoading={artifactsList.isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder="Search for artifacts... e.g. project/repository"
      throttle
    >
      <List.Section title={`${repositoryName} (${projectName})`} subtitle={`${artifactsList.data?.length} artifacts`}>
        {artifactsList.data?.map((artifact) => (
          <List.Item
            key={artifact.id}
            title={truncateString(artifact.tag ?? "Unknown", 60)}
            icon={Icon.Tag}
            accessories={[
              { text: formatSize(artifact.size), icon: Icon.Box, tooltip: "Artifact Size" },
              { date: artifact.pushedAt, tooltip: `Pushed ${formatDistanceToNow(artifact.pushedAt)} ago` },
              { tag: { value: artifact.type, color: Color.SecondaryText }, tooltip: "Artifact Type" },
            ]}
            actions={
              <ActionPanel title={`${artifact.tag} in ${projectName}/${repositoryName}`}>
                <Action.CopyToClipboard title="Copy Tag" content={artifact.tag} icon={Icon.CopyClipboard} />
                <Action.OpenInBrowser
                  title="Open in Browser"
                  url={`${registryUrl}/projects/${projectName}/repositories/${repositoryName}/artifacts/${artifact.id}`}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}

export function ListArtifacts() {
  return (
    <QueryProvider>
      <ArtifactsListView />
    </QueryProvider>
  );
}
