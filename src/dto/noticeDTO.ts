import { Articles, Notices } from "@prisma/client";

import { NOTICE_CATEGORY } from "@prisma/client";

export class ResponseNoticeDTO {
  noticeId: string;
  userId: string;
  category: NOTICE_CATEGORY;
  title: string;
  writerName: string;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  commentCount: number;
  isPinned: boolean;

  constructor(
    notice: Notices & { article: Articles & { user: { name: string } } } & {
      _count?: { NoticeComments: number };
    }
  ) {
    this.noticeId = notice.id;
    this.userId = notice.article.userId;
    this.category = notice.category;
    this.title = notice.article.title;
    this.writerName = notice.article.user.name;
    this.createdAt = notice.article.createdAt;
    this.updatedAt = notice.article.updatedAt;
    this.viewCount = notice.viewCount;
    this.commentCount = notice._count?.NoticeComments ?? 0;
    this.isPinned = notice.isPinned;
  }
}

export class ResponseNoticeListDTO {
  totalCount: number;
  notices: ResponseNoticeDTO[];

  constructor(result: {
    totalCount: number;
    notices: (Notices & { article: Articles & { user: { name: string } } } & {
      _count?: { NoticeComments: number };
    })[];
  }) {
    this.totalCount = result.totalCount;
    this.notices = result.notices.map(
      (notice) => new ResponseNoticeDTO(notice)
    );
  }
}

// class ResponseNoticeUserDTO {
//   id: number;
//   name: string;
//   email: string;
//   employeeNumber: string;
//   phoneNumber: string;
//   notice: {
//     noticeName: string;
//   };
//   constructor(user: Users & { notice: { noticeName: string } }) {
//     this.id = user.id;
//     this.name = user.name;
//     this.email = user.email;
//     this.employeeNumber = user.employeeNumber;
//     this.phoneNumber = user.phoneNumber;
//     this.notice = {
//       noticeName: user.notice.noticeName,
//     };
//   }
// }

// export class ResponseNoticeUserListDTO {
//   currentPage: number;
//   totalPages: number;
//   totalItemCount: number;
//   data: ResponseNoticeUserDTO[];

//   constructor(
//     page: number,
//     pageSize: number,
//     users: (Users & { notice: { noticeName: string } })[],
//     totalItemCount: number,
//   ) {
//     this.currentPage = page;
//     this.totalPages = Math.ceil(totalItemCount / pageSize);
//     this.totalItemCount = totalItemCount;
//     this.data = users.map((user) => new ResponseNoticeUserDTO(user));
//   }
// }
