// 관리자 권한이 없을 때
class AccessDeniedError extends Error {
  constructor(message = "접근이 거부되었습니다.") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export default AccessDeniedError;
