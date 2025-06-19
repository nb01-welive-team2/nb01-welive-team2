import complaintRepository from "@/repositories/complaintRepository";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    complaints: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("complaintRepository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("should call prisma.complaints.create with correct data", async () => {
      const data = {
        user: { connect: { id: "user-123" } },
        ApartmentInfo: { connect: { id: "apt-456" } },
        title: "불편사항 제목",
        content: "불편사항 내용",
        isPublic: true,
      };
      (prisma.complaints.create as jest.Mock).mockResolvedValue(data);

      const result = await complaintRepository.create(data);

      expect(prisma.complaints.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(data);
    });
  });

  describe("update", () => {
    it("should call prisma.complaints.update with correct args", async () => {
      const complaintId = "id1";
      const data = { title: "updated" };
      const mockResult = { id: complaintId, ...data };
      (prisma.complaints.update as jest.Mock).mockResolvedValue(mockResult);

      const result = await complaintRepository.update(complaintId, data);

      expect(prisma.complaints.update).toHaveBeenCalledWith({
        data,
        where: { id: complaintId },
        include: expect.objectContaining({
          user: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
      expect(result).toBe(mockResult);
    });
  });

  describe("findById", () => {
    it("should call prisma.complaints.findUnique with correct args", async () => {
      const complaintId = "id1";
      const mockResult = { id: complaintId };
      (prisma.complaints.findUnique as jest.Mock).mockResolvedValue(mockResult);

      const result = await complaintRepository.findById(complaintId);

      expect(prisma.complaints.findUnique).toHaveBeenCalledWith({
        where: { id: complaintId },
        include: expect.objectContaining({
          user: expect.any(Object),
          ComplaintComments: expect.any(Object),
        }),
      });
      expect(result).toBe(mockResult);
    });
  });

  describe("getList", () => {
    it("should call prisma.complaints.findMany with merged params", async () => {
      const params = { where: { isPublic: true } };
      const mockResult = [{ id: "id1" }];
      (prisma.complaints.findMany as jest.Mock).mockResolvedValue(mockResult);

      const result = await complaintRepository.getList(params);

      expect(prisma.complaints.findMany).toHaveBeenCalledWith({
        ...params,
        include: expect.objectContaining({
          user: expect.any(Object),
          _count: expect.any(Object),
        }),
      });
      expect(result).toBe(mockResult);
    });
  });

  describe("getCount", () => {
    it("should call prisma.complaints.count with given params", async () => {
      const params = { where: { isPublic: true } };
      (prisma.complaints.count as jest.Mock).mockResolvedValue(10);

      const result = await complaintRepository.getCount(params);

      expect(prisma.complaints.count).toHaveBeenCalledWith(params);
      expect(result).toBe(10);
    });
  });

  describe("deleteById", () => {
    it("should call prisma.complaints.delete with correct id", async () => {
      const complaintId = "id1";
      const mockResult = { id: complaintId };
      (prisma.complaints.delete as jest.Mock).mockResolvedValue(mockResult);

      const result = await complaintRepository.deleteById(complaintId);

      expect(prisma.complaints.delete).toHaveBeenCalledWith({
        where: { id: complaintId },
      });
      expect(result).toBe(mockResult);
    });
  });
});
