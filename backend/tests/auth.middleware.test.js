import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import authMiddleware from "../src/middlewares/auth.middleware.js";
import jwt from "jsonwebtoken";
import User from "../src/models/User.js";

describe("Middleware de autenticación", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("Debe permitir el acceso cuando el token es válido", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({ user_id: "user123" });
    
    const mockUser = {
      _id: "user123",
      email: "test@test.com",
      role: "seller",
      is_active: true
    };
    
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    jest.spyOn(User, "findById").mockReturnValue({
      select: mockSelect
    });

    req.headers.authorization = "Bearer token-valido";

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("token-valido", process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith("user123");
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(mockUser);
  });

  it("Debe rechazar cuando no hay token", async () => {
    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Authentication required",
        statusCode: 401
      })
    );
  });

  it("deberia rechazar cuando el token es inválido", async () => {
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    req.headers.authorization = "Bearer token-invalido";

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Invalid token");
  });

  it("deberia rechazar cuando el token está expirado", async () => {
    const error = new Error("Token expired");
    error.name = "TokenExpiredError";
    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw error;
    });

    req.headers.authorization = "Bearer token-expirado";

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(next.mock.calls[0][0].message).toBe("Token expired");
  });

  it("deberia rechazar cuando el usuario no existe en BD", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({ user_id: "user-inexistente" });
    
    const mockSelect = jest.fn().mockResolvedValue(null);
    jest.spyOn(User, "findById").mockReturnValue({
      select: mockSelect
    });

    req.headers.authorization = "Bearer token-valido";

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User not found",
        statusCode: 401
      })
    );
  });

  it("deberia rechazar cuando el usuario está inactivo", async () => {
    jest.spyOn(jwt, "verify").mockReturnValue({ user_id: "user123" });
    
    const mockUser = {
      _id: "user123",
      email: "test@test.com",
      role: "seller",
      is_active: false
    };
    
    const mockSelect = jest.fn().mockResolvedValue(mockUser);
    jest.spyOn(User, "findById").mockReturnValue({
      select: mockSelect
    });

    req.headers.authorization = "Bearer token-valido";

    await authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Account is deactivated",
        statusCode: 403
      })
    );
  });
});