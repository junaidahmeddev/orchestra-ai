import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { hash, compare } from "bcryptjs";

// Mock Prisma client singleton
vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe("POST /api/auth/register (Integration Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if invalid email or short password is provided", async () => {
    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email",
        password: "123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("should return 400 if user with email already exists", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: "user-123",
      email: "existing@orchestra.ai",
      name: "Existing User",
      passwordHash: "$2b$10$hashedpassword",
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "existing@orchestra.ai",
        password: "password123",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe("User with this email already exists");
  });

  it("should hash password and create new user on valid credentials", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);
    vi.mocked(db.user.create).mockResolvedValueOnce({
      id: "new-user-id",
      email: "newuser@orchestra.ai",
      name: "New User",
      passwordHash: "$2b$10$generatedhash",
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new Request("http://localhost:3000/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email: "newuser@orchestra.ai",
        password: "password123",
        name: "New User",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.message).toBe("User registered successfully");
    expect(db.user.create).toHaveBeenCalledTimes(1);
  });
});

describe("NextAuth Credentials Authorize (Login Flow Integration Tests)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const credentialProvider = authOptions.providers[0] as any;
  const authorizeFn = credentialProvider.options?.authorize || credentialProvider.authorize;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if user email does not exist", async () => {
    vi.mocked(db.user.findUnique).mockResolvedValueOnce(null);

    await expect(
      authorizeFn(
        { email: "unknown@orchestra.ai", password: "password123" },
        {}
      )
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw error if password does not match passwordHash", async () => {
    const realBcryptHash = await hash("correctpassword", 10);
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: "user-1",
      email: "test@orchestra.ai",
      name: "Test User",
      passwordHash: realBcryptHash,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      authorizeFn(
        { email: "test@orchestra.ai", password: "wrongpassword" },
        {}
      )
    ).rejects.toThrow("Invalid credentials");
  });

  it("should verify bcrypt password comparison directly", async () => {
    const realBcryptHash = await hash("correctpassword", 10);
    const isMatch = await compare("correctpassword", realBcryptHash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await compare("wrongpassword", realBcryptHash);
    expect(isWrongMatch).toBe(false);
  });

  it("should succeed and return user object if credentials are valid", async () => {
    const realBcryptHash = await hash("correctpassword", 10);
    vi.mocked(db.user.findUnique).mockResolvedValueOnce({
      id: "user-1",
      email: "test@orchestra.ai",
      name: "Test User",
      passwordHash: realBcryptHash,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await authorizeFn(
      { email: "test@orchestra.ai", password: "correctpassword" },
      {}
    );

    expect(user).toEqual({
      id: "user-1",
      email: "test@orchestra.ai",
      name: "Test User",
      image: null,
    });
  });
});
