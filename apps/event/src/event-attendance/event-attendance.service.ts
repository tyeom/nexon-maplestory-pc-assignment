import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RpcException } from '@nestjs/microservices';
import * as moment from 'moment';
import { Attendance } from './schema/attendance.schema';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';

/**
 * 출석 체크 비즈니스 로직
 */
@Injectable()
export class EventAttendanceService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Attendance.name)
    private readonly attendanceModel: Model<Attendance>,
  ) {}

  async checkIn(
    createEventAttendanceDto: CreateEventAttendanceDto,
  ): Promise<Attendance> {
    const { userId } = createEventAttendanceDto;
    // 오늘 날짜의 시작 (00:00:00)
    const today = moment().startOf('day').toDate();

    // 오늘 이미 체크인했는지 확인
    const existingCheckIn = await this.attendanceModel
      .findOne({
        userId,
        checkInDate: { $gte: today },
        isDeleted: false,
      })
      .exec();

    if (existingCheckIn) {
      throw new RpcException('이미 오늘 출석체크를 완료했습니다.');
    }

    // 새 출석 체크 생성
    const newAttendance = new this.attendanceModel({
      userId,
      checkInDate: new Date(),
    });

    return newAttendance.save();
  }

  async getConsecutiveDays(userId: string): Promise<number> {
    // 모든 출석기록을 날짜 내림차순으로 가져오기
    const attendances = await this.attendanceModel.find({
        userId,
        isDeleted: false,
      })
    .sort({ checkInDate: -1 })
    .exec();

    if (attendances.length === 0) {
      return 0;
    }

    let consecutiveDays = 1; // 최소 1일 (오늘)
    const dates = attendances.map((attendance) =>
      moment(attendance.checkInDate).startOf('day'),
    );

    // 오늘 날짜
    const today = moment().startOf('day');

    // 첫 번째 기록이 오늘이 아니면 연속 출석이 아님
    if (!dates[0].isSame(today)) {
      return 0;
    }

    // 연속된 날짜 확인
    for (let i = 0; i < dates.length - 1; i++) {
      const currentDate = dates[i];
      const previousDate = dates[i + 1];

      // 하루 차이인지 확인 (1일 전인지)
      if (currentDate.diff(previousDate, 'days') === 1) {
        consecutiveDays++;
      } else {
        // 하루 이상 차이가 나면 연속 출석 중단
        break;
      }
    }

    return consecutiveDays;
  }

  /**
   * 유저가 특정 날짜 기준으로 부터 연속 출석 체크 했는지 검증
   * @param userId 검증할 유저 Id
   * @param startDate 연속 출석 체크 검증 시작 날짜
   * @param requiredDays 검증할 연속 출석 일수
   * @returns 결과
   */
  async verifyConsecutiveAttendanceFromDate(
    userId: string,
    startDate: Date,
    requiredDays: number,
  ): Promise<{
    success: boolean;
    attendedDays: number;
    requiredDays: number;
    missingDays: string[];
    attendedDates: string[];
    message: string;
  }> {
    // 시작 날짜를 UTC 00:00:00으로 설정
    const startDateUtc = moment(startDate).startOf('day').toDate();
    // 종료 날짜 계산 (시작일 + 필요 일수 - 1)
    const endDateUtc = moment(startDateUtc)
      .add(requiredDays - 1, 'days')
      .endOf('day')
      .toDate();

    // 해당 기간 동안의 출석 기록 조회
    const attendances = await this.attendanceModel.find({
        userId,
        checkInDate: { $gte: startDateUtc, $lte: endDateUtc },
        isDeleted: false,
      })
      .sort({ checkInDate: 1 })
      .exec();

    // 출석한 날짜들 (UTC 00:00:00 형식으로 변환)
    const attendedDates = attendances.map((attendance) =>
      moment(attendance.checkInDate).startOf('day').format('YYYY-MM-DD')
    );

    // 출석해야 하는 모든 날짜 생성
    const requiredDates: string[] = [];
    for (let i = 0; i < requiredDays; i++) {
      const date = moment(startDateUtc).add(i, 'days').format('YYYY-MM-DD');
      requiredDates.push(date);
    }
    // 출석하지 않은 날짜 찾기
    const missingDays = requiredDates.filter(
      (date) => !attendedDates.includes(date),
    );

    // 결과 생성
    const success = missingDays.length === 0;
    const attendedDaysCount = requiredDates.length - missingDays.length;

    let message = '';
    if (success) {
      message = `${moment(startDateUtc).format('YYYY-MM-DD')}부터 ${moment(endDateUtc).format('YYYY-MM-DD')}까지 모든 ${requiredDays}일 출석 완료!`;
    } else {
      message = `${moment(startDateUtc).format('YYYY-MM-DD')}부터 ${requiredDays}일 중 ${attendedDaysCount}일 출석 (미출석: ${missingDays.join(', ')})`;
    }

    return {
      success,
      attendedDays: attendedDaysCount,
      requiredDays,
      missingDays,
      attendedDates,
      message,
    };
  }

  /**
   * 유저가 연속 출석 이벤트를 완료했는지 검증
   * @param userId 검증할 유저 Id
   * @param requiredDays 검증할 연속 출석 일수
   * @returns 결과
   */
  async verifyConsecutiveAttendance(
    userId: string,
    requiredDays: number,
  ): Promise<{
    success: boolean;
    currentDays: number;
    message: string;
  }> {
    // 연속 출석일 수 가져오기
    const consecutiveDays = await this.getConsecutiveDays(userId);
    // 연속 출석일 수가 요구 일수보다 같거나 크면 성공
    const success = consecutiveDays >= requiredDays;

    // 결과 메시지 구성
    let message = '';
    if (success) {
      message = `연속 ${consecutiveDays}일 출석 달성! (필요: ${requiredDays}일)`;
    } else {
      message = `연속 ${consecutiveDays}일 출석 중 (필요: ${requiredDays}일, 남은 일수: ${requiredDays - consecutiveDays}일)`;
    }

    return {
      success,
      currentDays: consecutiveDays,
      message,
    };
  }
}
