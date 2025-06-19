import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function create(complaint: Prisma.ComplaintsCreateInput) {
  return await prisma.complaints.create({
    data: complaint,
  });
}

async function update(complaintId: string, data: Prisma.ComplaintsUpdateInput) {
  return await prisma.complaints.update({
    data,
    where: {
      id: complaintId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
        include: {
          userInfo: {
            select: {
              apartmentId: true,
              apartmentDong: true,
              apartmentHo: true,
            },
          },
        },
      },
      _count: {
        select: {
          ComplaintComments: true,
        },
      },
    },
  });
}

async function findById(complaintId: string) {
  return await prisma.complaints.findUnique({
    where: {
      id: complaintId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
        include: {
          userInfo: {
            select: {
              apartmentId: true,
              apartmentDong: true,
              apartmentHo: true,
            },
          },
        },
      },
      ComplaintComments: {
        include: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });
}

async function getList(params: Prisma.ComplaintsFindManyArgs) {
  return await prisma.complaints.findMany({
    ...params,
    include: {
      user: {
        select: {
          username: true,
        },
        include: {
          userInfo: {
            select: {
              apartmentDong: true,
              apartmentHo: true,
            },
          },
        },
      },
      _count: {
        select: {
          ComplaintComments: true,
        },
      },
    },
  });
}

async function getCount(params: Prisma.ComplaintsCountArgs) {
  return await prisma.complaints.count({
    ...params,
  });
}

async function deleteById(complaintId: string) {
  return await prisma.complaints.delete({
    where: {
      id: complaintId,
    },
  });
}

export default {
  create,
  update,
  findById,
  getList,
  getCount,
  deleteById,
};
