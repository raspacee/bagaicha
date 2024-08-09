import UserController from "../../controllers/auth.controller";
import UserModel from "../../models/user.model";
import { LoginForm, SignupForm } from "../../types";
import { hashPassword } from "../../utils/password";
import bcrypt from "bcryptjs";

jest.mock("../../models/user.model");
jest.mock("../../utils/password", () => ({
  hashPassword: jest.fn((data) => data),
}));
jest.mock("bcryptjs");

describe("user signup endpoint", () => {
  type SignupRequestType = {
    body: SignupForm;
  };

  const request: SignupRequestType = {
    body: {
      email: "test@gmail.com",
      firstName: "test",
      lastName: "test",
      password: "password",
    },
  };
  const response = {} as any;
  response.json = jest.fn();
  response.status = jest.fn((statusCode) => response);

  const next = {} as any;

  it("should return 409 status when email is already used", async () => {
    (UserModel.getDataByEmail as any).mockImplementationOnce(() => ({
      id: 1,
      firstName: "test",
      lastName: "test",
      email: "test@gmail.com",
    }));
    await UserController.signupHandler(request as any, response as any);
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledTimes(1);
  });

  it("should return 201 when new user is created", async () => {
    (UserModel.getDataByEmail as any).mockResolvedValueOnce(null);
    (UserModel.createUser as any).mockResolvedValueOnce(void 0);
    await UserController.signupHandler(request as any, response as any);
    expect(response.status).toHaveBeenLastCalledWith(201);
    expect(hashPassword).toHaveBeenCalledWith("password");
    expect(UserModel.createUser).toHaveBeenCalledWith(request.body);
  });
});

describe("user login endpoint", () => {
  type LoginRequestType = {
    body: LoginForm;
  };

  const request: LoginRequestType = {
    body: {
      email: "test@gmail.com",
      password: "password",
    },
  };

  const response = {} as any;
  response.json = jest.fn();
  response.status = jest.fn((statusCode) => response);

  const next = {} as any;

  it("should return 404 when email is not found", async () => {
    (UserModel.getDataByEmail as any).mockResolvedValueOnce(null);
    await UserController.loginHandler(
      request as any,
      response as any,
      next as any
    );
    expect(response.status).toHaveBeenLastCalledWith(404);
  });

  it("should return 401 when password does not match", async () => {
    (UserModel.getPasswordByEmail as any).mockResolvedValueOnce({
      id: 1,
      email: "test@gmail.com",
      password: "password",
    });
    (bcrypt.compareSync as any).mockReturnValueOnce(false);
    await UserController.loginHandler(
      request as any,
      response as any,
      next as any
    );
    expect(response.status).toHaveBeenLastCalledWith(401);
  });
});
