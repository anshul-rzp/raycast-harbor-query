import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchRepositories } from "@/api/harbor";

export function useRepositoriesSearch() {
  const [searchQueryText, setSearchText] = useState("");

  // Query for searching repositories
  const searchQuery = useQuery({
    queryKey: ["repository_search", searchQueryText],
    queryFn: async () => {
      const repositories = await searchRepositories(searchQueryText);
      return repositories.sort((a, b) => (b.pullCount ?? 0) - (a.pullCount ?? 0));
    },
    enabled: searchQueryText.trim().length > 0,
    initialData: [],
    staleTime: 0,
  });

  const hasItems =
    searchQuery.isLoading || searchQueryText.trim().length === 0 ? undefined : searchQuery.data?.length > 0;

  return {
    isLoading: searchQuery.isLoading,
    data: searchQuery.data,
    error: searchQuery.error,
    hasItems,
    setSearchText,
    searchQueryText,
  };
}
