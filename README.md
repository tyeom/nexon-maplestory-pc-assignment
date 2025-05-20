# 이벤트 종류
- n일 연속 출석 이벤트 [시스템 자동 검증 및 처리]
  - EventType : ATTENDANCE
  - condition : 출석 일수 [StringNumber Type]
- 기타 이벤트 [관리자 or 운영자가 수동 검증하여 처리]
  - EventType : NONE

# 기본 구조
![image](https://github.com/user-attachments/assets/80c263d9-e565-4b1a-9848-fdc5bc523d40)

# 설계

### 기본 아키텍처
**보안**을 위해 최소한의 라우팅 역할을 하는 **API Gateway 서비스만 외부로 노출**하도록 설계 했으며, 핵심 처리 서비스들은 **내부 통신으로 동작**하도록 처리 하였습니다.<br/>
서비스들은 AMQP 프로토콜 기반으로 통신해서 처리 합니다.

### 이벤트 검증 방식
이벤트 타입중 `ATTENDANCE` 인 경우 유저가 조건에 만족되는 연속 n번 출석 체크 하였는지 자동 검증 처리 합니다.
> 추후 추상화 설계 리팩토링을 통해 특정 이벤트를 책임지는 모듈을 등록할 수 있도록 하고,<br/>
> 해당 이벤트 모듈에서 검증 및 자동 처리 될 수 있도록 고려해볼 수 있습니다.
  
# 단위 테스트(주요 기능) 실행 및 프로젝트 실행 방법
- 요구 사항
  Docker와 Docker Compose가 설치되어 있어야 합니다.

```
# event[이벤트 등록 처리] 비즈니스 로직 테스트
$ pnpm test -- --testPathPattern=apps/event/.*event-process.service.spec.ts

# reward[이벤트 보상 등록 처리] 비즈니스 로직 테스트
$ pnpm test -- --testPathPattern=apps/event/.*reward.service.spec.ts

# reward-claim[이벤트 보상 요구 / 출석 체크 이벤트 보상 요구 처리 및 검증] 비즈니스 로직 테스트
$ pnpm test -- --testPathPattern=apps/event/.*reward-claim.service.spec.ts 

# 도커 빌드 및 컨테이너 실행
$ docker-compose up --build
```

> 서비스 접근 : http://localhost:3000 <br/><br/>
>
> **서비스가 처음 실행될 때 다음 테스트 계정이 자동으로 생성됩니다:<br/>**
>
> **1. 기본 관리자 계정**<br/>
>  - id : admin@test.com<br/>
>  - password : 1234<br/><br/>
>
> **2. 기본 운영자 계정**<br/>
> - id : operator@test.com<br/>
> - password : 1234<br/><br/>
>
> **3. 기본 감사자 계정**<br/>
> - id : auditor@test.com<br/>
> - password : 1234

# APIs 정보
#### 유저 생성 API (Auth Service)
curl -X POST user \
-d
```json
{
    "email": "user2@test.com",
    "name": "일반 유저2",
    "password": "1234"
}
```

#### 인증 API (Auth Service)
curl -X POST authentication/sign-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic <base64-encoded-username-password>" \
  ![image](https://github.com/user-attachments/assets/52baf183-a4b7-497f-8fd7-5bd6d44c7e25)

#### 유저 정보 변경 API (Auth Service)
curl -X PATCH user \
-d
```json
{
    "name" : "이름 변경",
}
```

#### 유저 권한 변경 API (Auth Service) [ADMIN 전용]
curl -X PATCH user/role \
-d
```json
{
    "email": "test4@test.com",  // 권한을 변경할 유저 email
    "role": "AUDITOR"  // 변경할 권한 정보
}
```

#### 유저 정보 조회 API (Auth Service)
curl -X GET user/profile \

#### 모든 유저 정보 조회 API (Auth Service) [ADMIN 전용]
curl -X GET user?page=1&take=20&userName=유저명&userEmail=test@test.com \

#### 이벤트 생성 API (Auth Service) [OPERATOR / ADMIN 전용]
curl -X POST event \
-d
```json
{
    "name": "연속 3일 출석 체크 이벤트",
    "description": "아이쳄 쿠폰 증정",
    "condition": "3",
    "eventType": "ATTENDANCE",
    "startAt": "2025-05-19T10:30:00.000Z",
    "endAt": "2025-06-22T10:30:00.000Z"
}
```

#### 이벤트 수정 API (Auth Service) [OPERATOR / ADMIN 전용]
curl -X PUT event/{eventId} \
-d
```json
{
    "name": "이벤트 이름2-수정",
    "description": "이벤트 설명2-수정",
    "condition": "퀘스트 성공 이벤트-수정",
    "startAt": "2025-07-05T10:30:00.000Z",
    "endAt": "2025-08-06T10:30:00.000Z",
    "isActive": false
}
```

#### 모든 이벤트 조회 API (Auth Service) [OPERATOR / ADMIN 전용]
curl -X GET event?page=1&take=20&name=수정&startAt=2025-05-01&endAt=2025-08-31&isActive=false&eventType=ATTENDANCE \

#### 이벤트 상세 내용 조회 API (Auth Service) [OPERATOR / ADMIN 전용]
curl -X GET event/{eventId} \

#### 유저 출석 체크 API (Event Service) [USER 전용]
curl -X POST event/attendance \

#### 이벤트 보상 등록 API (Event Service) [OPERATOR / ADMIN 전용]
curl -X POST reward \
-d
```json
{
    "event": "event-id",
    "rewardType": "ITEM",
    "amount": 3000,
    "description": "3000 포인트 지급"
}
```

#### 이벤트 보상 수정 API (Event Service) [OPERATOR / ADMIN 전용]
curl -X PUT reward/{rewardId} \
-d
```json
{
    "rewardType": "ITEM",
    "amount": 3000,
    "description": "3000 포인트 지급 - 수정"
}
```

#### 등록된 이벤트 보상 삭제 API (Event Service) [OPERATOR / ADMIN 전용]
curl -X DELETE reward/{rewardId} \

#### 이벤트 보상 요구 API (Event Service) [USER 전용]
curl -X POST reward-claim/{eventId} \

#### 요청된 이벤트 보상 요구 수동 처리 API (Event Service) [OPERATOR / ADMIN 전용]
curl -X PATCH reward-claim/manually-processing \
-d
```json
{
    "rewardClaimId": "rewardClaimId",
    "status": "Success",
    "failReason": ""
}
```

#### 요청된 모든 이벤트 보상 요구 내역 조회 API (Event Service) [AUDITOR/ OPERATOR / ADMIN 전용]
curl -X GET reward-claim?page=1&take=10&userEmail=test2@test.com&status=Pending&eventName=이벤트&eventType=NONE \

#### 요청한 모든 이벤트 보상 요구 내역 조회 API (Event Service) [USER 전용]
curl -X GET reward-claim/user?page=1&take=10&status=Pending&eventName=아이템&eventType=NONE \


# 주요 기능

### 사용자 관리 및 인증
- 사용자 등록 및 로그인
- JWT 기반 인증
- 역할 기반 접근 제어 (RBAC)
- 역할: USER, OPERATOR, AUDITOR, ADMIN

### 이벤트 관리
- 이벤트 생성, 조회, 수정, 삭제
- 이벤트 상태 관리 (활성/비활성)
- 이벤트 조건 설정 및 검증

### 보상 관리
- 이벤트에 보상 연결
- 다양한 보상 유형 지원 (포인트, 아이템, 쿠폰)
- 보상 수량 관리

### 보상 요청 및 처리
- 사용자가 이벤트 보상 요청
- 출석 체크 이벤트 자동 검증 처리
- 중복 보상 요청 방지
- 조건 충족 여부 검증
- 보상 요청 이력 관리

### 보상 요청 내역 확인
- 사용자별 요청 이력 조회
- 관리자/감사자용 전체 요청 기록 조회
- 이벤트별, 상태별 필터링


<br/><br/><br/>


***

<br/><br/><br/>


<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
