// import { Notices, Users } from '@prisma/client';

// export class ResponseNoticeDTO {
//   id: number;
//   noticeName: string;
//   noticeCode: string;
//   userCount: number;
//   constructor(notice: Notices & { _count?: { users: number } }) {
//     this.id = notice.id;
//     this.noticeName = notice.noticeName;
//     this.noticeCode = notice.noticeCode;
//     this.userCount = notice._count?.users ?? 0;
//   }
// }

// export class ResponseNoticeListDTO {
//   currentPage: number;
//   totalPages: number;
//   totalItemCount: number;
//   data: ResponseNoticeDTO[];

//   constructor(
//     page: number,
//     pageSize: number,
//     result: {
//       totalItemCount: number;
//       companies: (Notices & { _count?: { users: number } })[];
//     },
//   ) {
//     this.currentPage = page;
//     this.totalPages = Math.ceil(result.totalItemCount / pageSize);
//     this.totalItemCount = result.totalItemCount;
//     this.data = result.companies.map((notice) => new ResponseNoticeDTO(notice));
//   }
// }

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
