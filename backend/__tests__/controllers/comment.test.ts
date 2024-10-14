import PostModel from "../../models/post.model";
import CommentModel from "../../models/comment.model";
import NotificationModel from "../../models/notification.model";
import { CommentForm } from "../../types";
import CommentController from "../../controllers/comment.controller";
import { Notification } from "../../types";

jest.mock("../../models/post.model");
jest.mock("../../models/comment.model");
jest.mock("../../models/notification.model");

describe("create comment endpoint", () => {
  const req = {
    jwtUserData: {
      userId: "userId",
    },
    body: {
      postId: "postId",
      body: "test comment",
    } as CommentForm,
  };

  const res = {} as any;
  res.json = jest.fn((data) => data);
  res.status = jest.fn((statusCode) => res);

  it("should return 404 when postId is not found", async () => {
    (PostModel.getPostById as any).mockResolvedValueOnce(null);
    await CommentController.createComment(req as any, res as any);
    expect(res.status).toHaveBeenLastCalledWith(404);
  });

  it("should return 201 when comment is created", async () => {
    const post = { id: "postId", authorId: "userId" };

    (PostModel.getPostById as any).mockResolvedValueOnce(post);
    (CommentModel.createCommentOnPost as any).mockResolvedValueOnce(void 0);
    (NotificationModel.createNotification as any).mockResolvedValueOnce(void 0);
    await CommentController.createComment(req as any, res as any);
    expect(
      NotificationModel.createNotification as any
    ).toHaveBeenLastCalledWith({
      senderId: req.jwtUserData.userId,
      recipientId: post.authorId,
      type: "UserCommentsOnPost",
      postId: post.id,
      isRead: false,
    } as Notification);
    expect(res.status).toHaveBeenLastCalledWith(201);
  });
});
