class ForbiddenError extends Error {
  constructor(message = "접근이 거부되었습니다.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export default ForbiddenError;
