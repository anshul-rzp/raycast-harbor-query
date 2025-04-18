import { Action, ActionPanel, Color, Icon, List, useNavigation } from "@raycast/api";
import { useRepositoriesSearch } from "@/hooks/use-repositories-search";
import { QueryProvider } from "@/providers/react-query";
import { ArtifactsListView } from "../list-artifacts";
import { getHarborPreferences } from "@/utils/preferences";
import { truncateString } from "@/utils/formatting";

function RepositoriesSearchView() {
  const repositoriesSearch = useRepositoriesSearch();
  const nav = useNavigation();
  const { registryUrl } = getHarborPreferences();

  return (
    <List
      isLoading={repositoriesSearch.isLoading}
      onSearchTextChange={repositoriesSearch.setSearchText}
      searchBarPlaceholder="Search for repositories..."
      throttle
    >
      {repositoriesSearch.data.map((repo) => (
        <List.Item
          key={repo.repositoryName}
          icon={Icon.Folder}
          title={truncateString(repo.repositoryName, 60)}
          accessories={[
            {
              text: `${repo.artifactCount}`,
              icon: Icon.Box,
              tooltip: "Total Artifacts",
            },
            {
              text: `${repo.pullCount ?? "Unknown"}`,
              icon: Icon.Download,
              tooltip: "Total Pulls",
            },
            {
              tag: {
                value: repo.projectName,
                color: Color.Blue,
              },
            },
          ]}
          actions={
            <ActionPanel>
              <Action
                title="Show Details"
                onAction={() => {
                  nav.push(
                    <QueryProvider>
                      <ArtifactsListView projectName={repo.projectName} repositoryName={repo.repositoryName} />
                    </QueryProvider>,
                  );
                }}
              />
              <Action.OpenInBrowser
                title="Open in Browser"
                url={`${registryUrl}/harbor/projects/${repo.projectId}/repositories/${repo.repositoryName}/artifacts-tab`}
              />
            </ActionPanel>
          }
        />
      ))}

      {repositoriesSearch.hasItems === false && (
        <List.EmptyView title="No repositories found" description="Try a different search term" />
      )}

      {repositoriesSearch.error && (
        <List.EmptyView
          title="Error"
          icon={Icon.ExclamationMark}
          description={`Failed to search repositories: ${repositoriesSearch.error instanceof Error ? repositoriesSearch.error.message : "Unknown error"}`}
        />
      )}
    </List>
  );
}

export function SearchRepositories() {
  return (
    <QueryProvider>
      <RepositoriesSearchView />
    </QueryProvider>
  );
}
