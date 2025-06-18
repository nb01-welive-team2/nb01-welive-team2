import { createNotice } from "@/controllers/noticeController";
import noticeService from "@/services/noticeService";

import UnauthError from "@/errors/UnauthError";
import registerSuccessMessage from "@/lib/responseJson/registerSuccess";
import { CreateNoticeBodyStruct } from "@/structs/noticeStructs";
import { create } from "superstruct";
import { randomUUID } from "crypto";
import { NOTICE_CATEGORY, USER_ROLE } from "@prisma/client";

jest.mock("@/services/noticeService");
jest.mock("@/lib/message", () => ({
  registerSuccessMessage: jest.fn(() => ({ message: "등록 성공" })),
}));

describe("createNotice", () => {
  const mockReq = (body: any) =>
    ({
      body,
    }) as any;

  const mockRes = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn();
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("✅ 관리자인 경우 공지 생성 성공", async () => {
    // given
    const req = mockReq({
      body: {
        title: "Community Meeting2",
        content: "Next community meeting is on May 1st.",
        isPinned: true,
        category: NOTICE_CATEGORY.COMMUNITY,
      },
      user: {
        id: randomUUID(),
        role: USER_ROLE.ADMIN,
      },
    });
    const res = mockRes();

    // mocking
    (create as any) = jest.fn().mockReturnValue(req.body); // superstruct의 create 결과 mocking
    (noticeService.createNotice as jest.Mock).mockResolvedValue(undefined);

    // when
    await createNotice(req, res);

    // then
    expect(create).toHaveBeenCalledWith(req.body, CreateNoticeBodyStruct);
    expect(noticeService.createNotice).toHaveBeenCalledWith(
      req.body,
      expect.any(String)
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(expect.any(Object));
  });

  it("❌ 관리자가 아닌 경우 UnauthError 발생", async () => {
    const req = mockReq({ title: "공지", content: "내용" });
    const res = mockRes();

    // reqUser를 고정값으로 설정하지 않고, 실제 코드에서는 이걸 꺼낸다고 가정
    const originalUUID = randomUUID;
    (randomUUID as any) = jest.fn().mockReturnValue("user-id");

    // 사용자 권한을 변경 (관리자가 아님)
    const USER_ROLE_ORIGINAL = USER_ROLE.ADMIN;
    USER_ROLE.ADMIN = "NOT_ADMIN"; // 일부러 일치하지 않게 설정

    // when
    const run = () => createNotice(req, res);

    // then
    await expect(run()).rejects.toThrow(UnauthError);
    expect(noticeService.createNotice).not.toHaveBeenCalled();

    // cleanup
    USER_ROLE.ADMIN = USER_ROLE_ORIGINAL;
    (randomUUID as any) = originalUUID;
  });

  it("❌ 유효하지 않은 데이터일 경우 예외 발생", async () => {
    const req = mockReq({}); // 필수 필드 없음
    const res = mockRes();

    (create as any) = jest.fn(() => {
      throw new Error("Validation failed");
    });

    const run = () => createNotice(req, res);

    await expect(run()).rejects.toThrow("Validation failed");
    expect(noticeService.createNotice).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
