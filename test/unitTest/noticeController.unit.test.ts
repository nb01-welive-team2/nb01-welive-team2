import {
  createNotice,
  getNoticeList,
  getNotice,
  editNotice,
  removeNotice,
} from "@/controllers/noticeController";
import noticeService from "@/services/noticeService";
import { USER_ROLE } from "@prisma/client";
import ForbiddenError from "@/errors/ForbiddenError";
import * as struct from "superstruct";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";
import removeSuccessMessage from "@/lib/responseJson/removeSuccess";
import {
  ResponseNoticeDTO,
  ResponseNoticeCommentDTO,
  ResponseNoticeListDTO,
} from "@/dto/noticeDTO";

jest.mock("../services/noticeService");
jest.mock("superstruct");
jest.mock("../lib/responseJson/registerSuccess");
jest.mock("../lib/responseJson/removeSuccess");

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const mockUser = (role: USER_ROLE, userId = 1) => ({
  user: {
    role,
    userId,
  },
});

describe("Notice Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createNotice", () => {
    it("should create notice if user is admin", async () => {
      (struct.create as jest.Mock).mockReturnValue({
        title: "test",
        content: "test",
      });
      const req: any = { body: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await createNotice(req, res);

      expect(noticeService.createNotice).toHaveBeenCalledWith(
        { title: "test", content: "test" },
        1
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.any(registerSuccessMessage));
    });

    it("should throw ForbiddenError if not admin", async () => {
      const req: any = { body: {}, ...mockUser(USER_ROLE.USER) };
      await expect(createNotice(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("getNoticeList", () => {
    it("should return notice list if not SUPER_ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({ page: 1 });
      (noticeService.getNoticeList as jest.Mock).mockResolvedValue(
        "mockedResult"
      );

      const req: any = { query: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await getNoticeList(req, res);

      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseNoticeListDTO));
    });

    it("should throw ForbiddenError if SUPER_ADMIN", async () => {
      const req: any = { query: {}, ...mockUser(USER_ROLE.SUPER_ADMIN) };
      await expect(getNoticeList(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("getNotice", () => {
    it("should return notice if not SUPER_ADMIN", async () => {
      (struct.create as jest.Mock).mockReturnValue({ noticeId: 123 });
      (noticeService.getNotice as jest.Mock).mockResolvedValue("noticeContent");

      const req: any = { params: {}, ...mockUser(USER_ROLE.USER) };
      const res = mockResponse();

      await getNotice(req, res);

      expect(res.send).toHaveBeenCalledWith(
        expect.any(ResponseNoticeCommentDTO)
      );
    });

    it("should throw ForbiddenError if SUPER_ADMIN", async () => {
      const req: any = { params: {}, ...mockUser(USER_ROLE.SUPER_ADMIN) };
      await expect(getNotice(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("editNotice", () => {
    it("should edit notice if admin", async () => {
      (struct.create as jest.Mock).mockImplementationOnce(() => ({
        title: "updated",
      }));
      (struct.create as jest.Mock).mockImplementationOnce(() => ({
        noticeId: 5,
      }));
      (noticeService.updateNotice as jest.Mock).mockResolvedValue(
        "updatedNotice"
      );

      const req: any = { body: {}, params: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await editNotice(req, res);

      expect(noticeService.updateNotice).toHaveBeenCalledWith(5, {
        title: "updated",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(ResponseNoticeDTO));
    });

    it("should throw ForbiddenError if not admin", async () => {
      const req: any = { body: {}, params: {}, ...mockUser(USER_ROLE.USER) };
      await expect(editNotice(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });

  describe("removeNotice", () => {
    it("should remove notice if admin", async () => {
      (struct.create as jest.Mock).mockReturnValue({ noticeId: 7 });

      const req: any = { params: {}, ...mockUser(USER_ROLE.ADMIN) };
      const res = mockResponse();

      await removeNotice(req, res);

      expect(noticeService.removeNotice).toHaveBeenCalledWith(7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.any(removeSuccessMessage));
    });

    it("should throw ForbiddenError if not admin", async () => {
      const req: any = { params: {}, ...mockUser(USER_ROLE.USER) };
      await expect(removeNotice(req, mockResponse())).rejects.toThrow(
        ForbiddenError
      );
    });
  });
});
