import UserModel from "../../models/user.model";
import UserController from "../../controllers/user.controller";
import { UpdateProfileForm } from "../../types";

jest.mock("../../models/user.model");
jest.mock("../../utils/image", () => ({
  uploadImage: jest.fn((file) => "newUrl"),
}));

describe("update profile information endpoint", () => {
  const baseReq = {
    jwtUserData: {
      userId: "userId",
    },
    body: {
      firstName: "firstName",
      lastName: "lastName",
      bio: "bio",
      profilePictureUrl: "oldUrl",
    } as UpdateProfileForm,
  };

  const res = {} as any;
  res.json = jest.fn((data) => data);
  res.status = jest.fn((statusCode) => res);

  it("should return 200 when profile updated successfully with old image", async () => {
    const req = { ...baseReq, file: null };
    (UserModel.getDataById as any).mockResolvedValueOnce({
      id: "userId",
      profilePictureUrl: "oldUrl",
    });
    (UserModel.updateProfileInfo as any).mockResolvedValueOnce(void 0);
    await UserController.updateUserProfile(req as any, res as any);
    expect(UserModel.updateProfileInfo).toHaveBeenLastCalledWith(
      req.jwtUserData.userId,
      req.body
    );
    expect(res.status).toHaveBeenLastCalledWith(200);
  });

  it("should return 200 when profile updated successfully with new image", async () => {
    const req = { ...baseReq, file: true };
    (UserModel.getDataById as any).mockResolvedValueOnce({
      id: "userId",
      profilePictureUrl: "oldUrl",
    });
    (UserModel.updateProfileInfo as any).mockResolvedValueOnce(void 0);
    await UserController.updateUserProfile(req as any, res as any);
    expect(UserModel.updateProfileInfo).toHaveBeenLastCalledWith(
      req.jwtUserData.userId,
      { ...req.body, profilePictureUrl: "newUrl" }
    );
    expect(res.status).toHaveBeenLastCalledWith(200);
  });

  it("should return 404 when userId is not found", async () => {
    const req = baseReq;
    (UserModel.getDataById as any).mockResolvedValueOnce(null);
    await UserController.updateUserProfile(req as any, res as any);
    expect(res.status).toHaveBeenLastCalledWith(404);
  });
});
