import path from "path";
import { createNotice } from "../../src/controllers/noticeController";
import noticeService from "../../src/services/noticeService";
import registerSuccessMessage from "../../src/lib/responseJson/registerSuccess";
import UnauthError from "../../src/errors/UnauthError";
import { create as structCreate } from "superstruct";
import { USER_ROLE } from "@prisma/client";
const seedPath = path.resolve(__dirname, "../../prisma/seed");
const { seedDatabase } = require(seedPath);
const mockPath = path.resolve(__dirname, "../../prisma/mock");
const { mockArticles, mockUsers, mockComments } = require(mockPath);

jest.mock("../services/noticeService");
jest.mock("superstruct", () => ({
  create: jest.fn(),
}));

beforeEach(async () => {
  await seedDatabase();
});

describe("createNotice", () => {
  const mockData = { title: "Test Notice", content: "This is a notice." };
  const adminUser = { id: "admin-uuid", role: USER_ROLE.ADMIN };
  const nonAdminUser = { id: "user-uuid", role: USER_ROLE.USER };

  let req: any;
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    (structCreate as jest.Mock).mockReturnValue(mockData);
  });

  it("should create a notice and return 201 if user is admin", async () => {
    req = {
      body: mockData,
      user: adminUser,
    };

    await createNotice(req, res);

    expect(structCreate).toHaveBeenCalledWith(mockData, expect.anything());
    expect(noticeService.createNotice).toHaveBeenCalledWith(
      mockData,
      "admin-uuid"
    );
  });

  it("should throw UnauthError if user is not admin", async () => {
    req = {
      body: mockData,
      user: nonAdminUser,
    };

    await expect(createNotice(req, res)).rejects.toThrow(UnauthError);

    expect(structCreate).toHaveBeenCalledWith(mockData, expect.anything());
    expect(noticeService.createNotice).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });
});
