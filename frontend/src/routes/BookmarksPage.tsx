import { useGetMyBookmarks } from "@/api/PostApi";
import Post from "@/components/post/Post";

const BookmarksPage = () => {
  const { bookmarks, isLoading } = useGetMyBookmarks();

  if (isLoading) {
    return <h1>Loading</h1>;
  }

  if (!bookmarks) {
    return <h1>Failed to get bookmarks</h1>;
  }

  return (
    <div className="px-2 py-3 flex flex-col gap-3 w-full md:w-[45rem]">
      <h1 className="text-3xl font-extrabold">Your Bookmarked Posts</h1>
      {bookmarks.map((post) => (
        <Post post={post} key={post.id} />
      ))}
    </div>
  );
};

export default BookmarksPage;
