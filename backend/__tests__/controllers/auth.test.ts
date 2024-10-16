import UserController from "../../controllers/auth.controller";
import UserModel from "../../models/user.model";
import { LoginForm, SignupForm } from "../../types";
import { hashPassword } from "../../utils/password";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

jest.mock("../../models/user.model");

jest.mock("../../utils/password", () => ({
  hashPassword: jest.fn((password: string) => `hashed_${password}`),
}));

jest.mock("bcryptjs");

export const mockRequest = (partial: Partial<Request>): Request =>
  ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...partial,
  } as Request);
export const mockResponse = (): Response => {
  const res: Partial<Response> = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
  };
  return res as Response;
};

const testUser = {
  id: "1",
  firstName: "test",
  lastName: "test",
  email: "test@gmail.com",
  createdAt: "2024-01-01T00:00:00Z",
  profilePictureUrl: "https://example.com/image.png",
  moderationLvl: 0,
  bio: "This is a test bio.",
};

describe("user signup endpoint", () => {
  const signupForm: SignupForm = {
    email: "test@gmail.com",
    firstName: "test",
    lastName: "test",
    password: "password",
  };
  const request = mockRequest({
    body: { ...signupForm },
  });

  const response = mockResponse();
  jest.spyOn(response, "status").mockImplementation((statusCode) => response);

  it("should return 409 status when email is already used", async () => {
    jest.spyOn(UserModel, "getDataByEmail").mockResolvedValue(testUser);
    await UserController.signupHandler(request, response);
    expect(UserModel.getDataByEmail).toHaveBeenCalledWith(signupForm.email);
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledTimes(1);
  });

  it("should return 201 when new user is created", async () => {
    jest.spyOn(UserModel, "getDataByEmail").mockResolvedValueOnce(null);
    jest.spyOn(UserModel, "createUser").mockResolvedValueOnce(testUser);
    await UserController.signupHandler(request, response);
    expect(hashPassword).toHaveBeenCalledWith(signupForm.password);
    expect(UserModel.createUser).toHaveBeenCalledWith(
      request.body,
      "https://t3.ftcdn.net/jpg/02/10/49/86/360_F_210498655_ywivjjUe6cgyt52n4BxktRgDCfFg8lKx.jpg"
    );
    expect(response.status).toHaveBeenLastCalledWith(201);
  });
});

describe("user login endpoint", () => {
  const loginForm: LoginForm = {
    email: "test@gmail.com",
    password: "password",
  };

  const request = mockRequest({
    body: { ...loginForm },
  });

  const response = mockResponse();
  jest.spyOn(response, "status").mockImplementation((statusCode) => response);

  const next = {} as any;

  it("should return 404 when email is not found", async () => {
    jest.spyOn(UserModel, "getDataByEmail").mockResolvedValueOnce(null);
    await UserController.loginHandler(request, response, next as any);
    expect(UserModel.getDataByEmail).toHaveBeenCalledWith(loginForm.email);
    expect(response.status).toHaveBeenLastCalledWith(404);
  });

  it("should return 401 when password does not match", async () => {
    jest
      .spyOn(UserModel, "getPasswordByEmail")
      .mockResolvedValueOnce("password123");
    jest.spyOn(bcrypt, "compareSync").mockReturnValueOnce(false);
    await UserController.loginHandler(request, response, next as any);
    expect(bcrypt.compareSync).toHaveBeenCalledWith(
      loginForm.password,
      "password123"
    );
    expect(response.status).toHaveBeenLastCalledWith(401);
  });
});
