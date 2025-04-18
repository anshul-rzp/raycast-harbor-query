import { getHarborPreferences } from "@/utils/preferences";

// Helper function to get the appropriate auth headers based on auth type
function getAuthHeaders(): Record<string, string> {
  const { authType, username, password, cookies } = getHarborPreferences();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authType === "cookies") {
    headers["Cookie"] = cookies;
  } else {
    // Default to Basic auth
    const credentials = Buffer.from(`${username}:${password}`).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }

  return headers;
}

interface HarborRepository {
  projectId: number;
  projectName: string;
  projectPublic: boolean;
  repositoryName: string;
  pullCount: number | undefined;
  artifactCount: number;
}

interface HarborApiRepository {
  project_id: number;
  project_name: string;
  project_public: boolean;
  repository_name: string;
  pull_count: number;
  artifact_count: number;
}

interface HarborApiSearchResponse {
  repository: Array<HarborApiRepository>;
}

export async function searchRepositories(query: string): Promise<HarborRepository[]> {
  try {
    const { registryUrl } = getHarborPreferences();

    const response = await fetch(`${registryUrl}/api/v2.0/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error(`Harbor API error: ${response.status} ${response.statusText}`);

    const data = (await response.json()) as HarborApiSearchResponse;

    return data.repository.map((repo: HarborApiRepository) => ({
      projectId: repo.project_id,
      projectName: repo.project_name,
      projectPublic: repo.project_public,
      repositoryName: repo.repository_name.split("/").at(-1) ?? repo.repository_name,
      pullCount: repo.pull_count,
      artifactCount: repo.artifact_count,
    }));
  } catch (error) {
    console.error("Error searching Harbor repositories:", error);
    throw error;
  }
}

interface HarborArtifact {
  id: number;
  type: string;
  iconDigest: string;
  lastPulledAt: Date;
  pushedAt: Date;
  size: number;
  tags: Array<{ id: number; name: string }>;
}

type HarborApiArtifactResponse = Array<{
  id: number;
  type: string;
  icon: string;
  push_time: string;
  pull_time: string;
  size: number;
  tags: Array<{
    id: number;
    repository_id: number;
    artifact_id: number;
    name: string;
    push_time: string;
    pull_time: string;
    immutable: boolean;
  }>;
}>;

export async function getRepositoryArtifacts(projectName: string, repositoryName: string): Promise<HarborArtifact[]> {
  try {
    const { registryUrl } = getHarborPreferences();

    const response = await fetch(
      `${registryUrl}/api/v2.0/projects/${projectName}/repositories/${repositoryName}/artifacts`,
      {
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) throw new Error(`Harbor API error: ${response.status} ${response.statusText}`);

    const data = (await response.json()) as HarborApiArtifactResponse;

    return data.map((artifact: HarborApiArtifactResponse[number]) => ({
      id: artifact.id,
      type: artifact.type,
      iconDigest: artifact.icon,
      lastPulledAt: new Date(artifact.pull_time),
      pushedAt: new Date(artifact.push_time),
      size: artifact.size,
      tags:
        artifact.tags?.map((tag) => ({
          id: tag.id,
          name: tag.name,
        })) ?? [],
    }));
  } catch (error) {
    console.error("Error getting repository artifacts:", error);
    throw error;
  }
}
