export default function CreateComment() {
  return(
<div className="px-2 py-1">
              <input
                type="text"
                placeholder={
                  replyingToName == null
                    ? "Type a comment"
                    : `Replying to ${replyingToName}`
                }
                className="focus:outline-none focus:ring-0 rounded-full"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                ref={commentInputRef}
              />
              <button
                onClick={submitComment}
                className="px-4 py-1 border ml-2 rounded-full bg-blue-600 text-white font-medium"
              >
                Post
              </button>
            </div>
  )
}
