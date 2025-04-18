import { useQuery } from "@tanstack/react-query";
import { getRepositoryArtifacts } from "@/api/harbor";

export function useListArtifacts(opts: { projectName: string; repositoryName: string }) {
  // Query for searching repositories
  const listArtifactsQuery = useQuery({
    queryKey: ["artifact_list", opts.projectName, opts.repositoryName],
    queryFn: async () => {
      const artifacts = await getRepositoryArtifacts(opts.projectName, opts.repositoryName);

      const artifactsWithTags = artifacts.flatMap((a) => a.tags.map((t) => ({ tag: t.name, tagId: t.id, ...a })));

      return artifactsWithTags.sort((a, b) => b.pushedAt.getTime() - a.pushedAt.getTime());
    },
    enabled: opts.projectName.trim().length > 0 && opts.repositoryName.trim().length > 0,
    initialData: [],
    staleTime: 0,
  });

  return {
    isLoading: listArtifactsQuery.isLoading,
    data: listArtifactsQuery.data,
    error: listArtifactsQuery.error,
  };
}
