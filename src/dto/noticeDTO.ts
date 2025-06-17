import { Articles, NoticeComments, Notices } from "@prisma/client";

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
    notice: Notices & { article: Articles & { user: { username: string } } } & {
      _count?: { NoticeComments: number };
    }
  ) {
    this.noticeId = notice.id;
    this.userId = notice.article.userId;
    this.category = notice.category;
    this.title = notice.article.title;
    this.writerName = notice.article.user.username;
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
    notices: (Notices & {
      article: Articles & { user: { username: string } };
    } & {
      _count?: { NoticeComments: number };
    })[];
  }) {
    this.totalCount = result.totalCount;
    this.notices = result.notices.map(
      (notice) => new ResponseNoticeDTO(notice)
    );
  }
}

export class ResponseNoticeCommentDTO {
  noticeId: string;
  userId: string;
  category: NOTICE_CATEGORY;
  title: string;
  writerName: string;
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  commentsCount: number;
  isPinned: boolean;
  content: string;
  boardName: string; //"공지사항"
  comments: {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    writerName: string;
  }[];
  constructor(
    notice: Notices & { article: Articles & { user: { username: string } } } & {
      NoticeComments: (NoticeComments & { user: { username: string } })[];
    }
  ) {
    this.noticeId = notice.id;
    this.userId = notice.article.userId;
    this.category = notice.category;
    this.title = notice.article.title;
    this.writerName = notice.article.user.username;
    this.createdAt = notice.article.createdAt;
    this.updatedAt = notice.article.updatedAt;
    this.viewsCount = notice.viewCount;
    this.commentsCount = notice.NoticeComments.length;
    this.isPinned = notice.isPinned;
    this.content = notice.article.content;
    this.boardName = "공지사항";
    this.comments = notice.NoticeComments.map((comment) => ({
      id: comment.id,
      userId: comment.userId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      writerName: comment.user.username,
    }));
  }
}

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
