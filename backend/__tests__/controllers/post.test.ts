import PostModel from "../../models/post.model";
import LikeModel from "../../models/like.model";
import NotificationModel from "../../models/notification.model";
import PostController from "../../controllers/post.controller";
import { Notification } from "../../types";

jest.mock("../../models/post.model");
jest.mock("../../models/like.model");
jest.mock("../../models/notification.model");

describe("like post endpoint", () => {
  const req = {
    jwtUserData: {
      userId: "userId",
    },
    params: {
      postId: "postId",
    },
  };
  const res = {} as any;
  res.json = jest.fn((data) => data);
  res.status = jest.fn((statusCode) => res);

  it("should return 404 when postId is not found", async () => {
    (PostModel.getPostById as any).mockResolvedValueOnce(null);
    await PostController.likePost(req as any, res as any);
    expect(res.status).toHaveBeenLastCalledWith(404);
  });

  it("should return 201 when post is liked", async () => {
    const post = {
      id: "postId",
      authorId: "userId",
    };
    (PostModel.getPostById as any).mockResolvedValueOnce(post);
    (LikeModel.createPostLike as any).mockResolvedValueOnce(void 0);
    (NotificationModel.createNotification as any).mockResolvedValueOnce(void 0);
    await PostController.likePost(req as any, res as any);
    expect(LikeModel.createPostLike).toHaveBeenLastCalledWith(
      req.params.postId,
      req.jwtUserData.userId
    );
    expect(
      NotificationModel.createNotification as any
    ).toHaveBeenLastCalledWith({
      senderId: req.jwtUserData.userId,
      recipientId: post.authorId,
      type: "UserLikesPost",
      postId: req.params.postId,
      isRead: false,
    } as Notification);
    expect(res.status).toHaveBeenLastCalledWith(201);
  });
});

describe("unlike post endpoint", () => {
  const req = {
    jwtUserData: {
      userId: "userId",
    },
    params: {
      postId: "postId",
    },
  };
  const res = {} as any;
  res.json = jest.fn((data) => data);
  res.status = jest.fn((statusCode) => res);

  it("should return 404 when postId is not found", async () => {
    (PostModel.getPostById as any).mockResolvedValueOnce(null);
    await PostController.likePost(req as any, res as any);
    expect(res.status).toHaveBeenLastCalledWith(404);
  });

  it("should return 204 when post is unliked", async () => {
    (PostModel.getPostById as any).mockResolvedValueOnce({
      id: req.params.postId,
    });
    (LikeModel.deletePostLike as any).mockResolvedValueOnce(void 0);
    await PostController.unlikePost(req as any, res as any);
    expect(LikeModel.deletePostLike).toHaveBeenLastCalledWith(
      req.params.postId,
      req.jwtUserData.userId
    );
    expect(res.status).toHaveBeenLastCalledWith(204);
  });
});
