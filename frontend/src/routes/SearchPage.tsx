import { useGetSearchResults } from "@/api/SearchApi";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceListItem from "@/components/place/PlaceListItem";
import Post from "@/components/post/Post";
import PaginationSelector from "@/components/PaginationSelector";
import { useEffect, useState } from "react";
import { SearchState } from "@/lib/types";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") as string;

  const [searchState, setSearchState] = useState<SearchState>({
    placePage: 1,
    postPage: 1,
    query: query,
  });

  const { searchResults, isLoading } = useGetSearchResults(searchState);

  const handlePlacePageChange = (pageNo: number) => {
    setSearchState((prevState) => ({
      ...prevState,
      placePage: pageNo,
    }));
  };

  const handlePostPageChange = (pageNo: number) => {
    setSearchState((prevState) => ({
      ...prevState,
      postPage: pageNo,
    }));
  };

  useEffect(() => {
    setSearchState({
      query: query,
      placePage: 1,
      postPage: 1,
    });
  }, [query]);

  return (
    <div className="w-[99%] px-2 py-3">
      <h1 className="text-xl font-bold">{`Search Results for ${query}`}</h1>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <Tabs defaultValue="places" className="w-full md:w-[70%]">
          <TabsList>
            <TabsTrigger value="places">Places</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="places" className="flex flex-col gap-3 px-1">
            {searchResults && searchResults.place.places.length > 0 ? (
              <div className="flex flex-col gap-3">
                {searchResults.place.places.map((place) => (
                  <PlaceListItem place={place} />
                ))}
                <PaginationSelector
                  currentPage={searchState.placePage}
                  onPageChange={handlePlacePageChange}
                  pages={searchResults.place.totalPages}
                />
              </div>
            ) : (
              <h1>Results not found</h1>
            )}
          </TabsContent>
          <TabsContent value="posts" className="flex flex-col gap-3 px-1">
            {searchResults && searchResults.post.posts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {searchResults.post.posts.map((post) => (
                  <Post post={post} />
                ))}
                <PaginationSelector
                  currentPage={searchState.postPage}
                  onPageChange={handlePostPageChange}
                  pages={searchResults.post.totalPages}
                />
              </div>
            ) : (
              <h1>Results not found</h1>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default SearchPage;
