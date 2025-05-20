/**
 * 인가 역할
 */
export enum Role {
  USER = 1 << 0,
  AUDITOR = 1 << 1,
  OPERATOR = 1 << 2,
  ADMIN = USER | OPERATOR | AUDITOR,
}
