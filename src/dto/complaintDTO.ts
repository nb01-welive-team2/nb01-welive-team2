import CommonError from "@/errors/CommonError";
import {
  COMPLAINT_STATUS,
  ComplaintComments,
  Complaints,
} from "@prisma/client";

import { NOTICE_CATEGORY } from "@prisma/client";

export class ResponseComplaintDTO {
  complaintId: string;
  userId: string;
  title: string;
  content: string;
  writerName: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  viewCount: number;
  commentCount: number;
  status: COMPLAINT_STATUS;
  dong: string;
  ho: string;

  constructor(
    complaint: Complaints & {
      user: {
        username: string;
        userInfo: { apartmentDong: number; apartmentHo: number } | null;
      };
    } & {
      _count?: { ComplaintComments: number };
    }
  ) {
    if (!complaint.user.userInfo) {
      throw new CommonError(
        "UserInfo is required for ResponseComplaintDTO",
        500
      );
    }
    this.complaintId = complaint.id;
    this.userId = complaint.userId;
    this.title = complaint.title;
    this.content = complaint.content;
    this.writerName = complaint.user.username;
    this.createdAt = complaint.createdAt;
    this.updatedAt = complaint.updatedAt;
    this.isPublic = complaint.isPublic;
    this.viewCount = complaint.viewCount;
    this.commentCount = complaint._count?.ComplaintComments ?? 0;
    this.status = complaint.complaintStatus;
    this.dong = complaint.user.userInfo.apartmentDong.toString();
    this.ho = complaint.user.userInfo.apartmentHo.toString();
  }
}

export class ResponseComplaintListDTO {
  totalCount: number;
  complaints: ResponseComplaintDTO[];

  constructor(result: {
    totalCount: number;
    complaints: (Complaints & {
      user: {
        username: string;
        userInfo: { apartmentDong: number; apartmentHo: number };
      };
    } & {
      _count?: { ComplaintComments: number };
    })[];
  }) {
    this.totalCount = result.totalCount;
    this.complaints = result.complaints.map(
      (complaint) => new ResponseComplaintDTO(complaint)
    );
  }
}

export class ResponseComplaintCommentDTO {
  complaintId: string;
  userId: string;
  title: string;
  content: string;
  writerName: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  viewsCount: number;
  commentsCount: number;
  status: COMPLAINT_STATUS;
  // dong: string;
  // ho: string;
  boardName: string; //"민원"
  comments: {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    writerName: string;
  }[];
  constructor(
    complaint: Complaints & {
      user: {
        username: string;
        // userInfo: { apartmentDong: number; apartmentHo: number };
      };
    } & {
      ComplaintComments: (ComplaintComments & { user: { username: string } })[];
    }
  ) {
    this.complaintId = complaint.id;
    this.userId = complaint.userId;
    this.title = complaint.title;
    this.content = complaint.content;
    this.writerName = complaint.user.username;
    this.createdAt = complaint.createdAt;
    this.updatedAt = complaint.updatedAt;
    this.isPublic = complaint.isPublic;
    this.viewsCount = complaint.viewCount;
    this.commentsCount = complaint.ComplaintComments.length;
    this.status = complaint.complaintStatus;
    // this.dong = complaint.user.userInfo.apartmentDong.toString();
    // this.ho = complaint.user.userInfo.apartmentHo.toString();
    this.boardName = "민원";
    this.comments = complaint.ComplaintComments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      writerName: comment.user.username,
    }));
  }
}

// export class ResponseComplaintUserListDTO {
//   currentPage: number;
//   totalPages: number;
//   totalItemCount: number;
//   data: ResponseComplaintUserDTO[];

//   constructor(
//     page: number,
//     pageSize: number,
//     users: (Users & { complaint: { complaintName: string } })[],
//     totalItemCount: number,
//   ) {
//     this.currentPage = page;
//     this.totalPages = Math.ceil(totalItemCount / pageSize);
//     this.totalItemCount = totalItemCount;
//     this.data = users.map((user) => new ResponseComplaintUserDTO(user));
//   }
// }
