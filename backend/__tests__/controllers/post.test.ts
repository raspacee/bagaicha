import PostModel from "../../models/post.model";
import LikeModel from "../../models/like.model";
import NotificationModel from "../../models/notification.model";
import PostController from "../../controllers/post.controller";
import { Notification, PostWithComments } from "../../types";
import { mockRequest, mockResponse } from "./auth.test";

jest.mock("../../models/post.model");
jest.mock("../../models/like.model");
jest.mock("../../models/notification.model");

describe("like post endpoint", () => {
  const response = mockResponse();
  jest.spyOn(response, "status").mockImplementation((statusCode) => response);

  it("should return 404 when postId is not found", async () => {
    const params = {
      postId: "123",
    };
    const request = mockRequest({ params: params });
    jest.spyOn(PostModel, "getPostById").mockResolvedValueOnce(null);
    await PostController.likePost(request, response);
    expect(PostModel.getPostById).toHaveBeenCalledWith(params.postId, null);
    expect(response.status).toHaveBeenLastCalledWith(404);
  });

  it("should return 201 when post is liked and not send notification if liked by post author", async () => {
    const request = mockRequest({
      params: {
        postId: "e6b8e1c0-1e8b-4b07-8f43-7f2d4f5d929b",
      },
      jwtUserData: {
        email: "john.doe@example.com",
        userId: "5d3b3c0c-4f6c-4e3c-8f3c-7e02c25f14b7",
      },
    });

    const post: PostWithComments = {
      id: "e6b8e1c0-1e8b-4b07-8f43-7f2d4f5d929b",
      authorId: "5d3b3c0c-4f6c-4e3c-8f3c-7e02c25f14b7",
      body: "This is an amazing place to visit!",
      imageUrl: "https://example.com/image.jpg",
      likeCount: 10,
      placeId: "1b3b3f5a-d64e-4f8c-ae3f-314e4c2077d1",
      rating: 5,
      createdAt: "2024-10-14T15:27:01.843Z",
      score: 42,
      authorFirstName: "John",
      authorLastName: "Doe",
      authorEmail: "john.doe@example.com",
      authorPictureUrl: "https://example.com/profile.jpg",
      hasLiked: true,
      hasBookmarked: false,
      placeName: "Beautiful Park",
      lat: 37.7749,
      lon: -122.4194,
      comments: [],
    };

    jest.spyOn(PostModel, "getPostById").mockResolvedValueOnce(post);
    jest.spyOn(LikeModel, "createPostLike").mockResolvedValueOnce(void 0);
    jest
      .spyOn(NotificationModel, "createNotification")
      .mockResolvedValueOnce(void 0);
    await PostController.likePost(request, response);
    expect(LikeModel.createPostLike).toHaveBeenLastCalledWith(
      request.params.postId,
      request.jwtUserData!.userId
    );
    expect(NotificationModel.createNotification).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenLastCalledWith(201);
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
