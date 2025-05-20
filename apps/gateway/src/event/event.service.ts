import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EVENT_SERVICE, EventType } from '@app/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { UserDto } from '../user/dto/user.dto';
import { GetEventsDto } from './dto/get-events-dto';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';

@Injectable()
export class EventService {
  constructor(
    @Inject(EVENT_SERVICE)
    private readonly eventMicroservice: ClientProxy,
  ) {}

  /**
   * 연속 출석체크 이벤트 조건값 유효성 검증
   * @param createEventDto 이벤트 정보
   */
  private validationByAttendanceEvent(
    createEventDto: CreateEventDto | UpdateEventDto,
  ): boolean {
    const { condition } = createEventDto;
    if (!condition) return false;

    const numCondition = parseInt(condition);
    return isNaN(numCondition) === false && numCondition <= 0;
  }

  async create(createEventDto: CreateEventDto, user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      // 연속 출석 체크 이벤트인 경우 조건값 유효성 체크
      // TODO : 각 이벤트 마다 조건값 유효성 체크는 추상화해서 각 이벤트 담당 모듈에서 처리 되도록 하면 좋을 것!
      if (createEventDto.eventType === EventType.ATTENDANCE) {
        const validation = this.validationByAttendanceEvent(createEventDto);
        if (!validation) {
          throw new BadRequestException(
            `연속 출석 체크 이벤트 조건은 숫자 형태 0보다 커야 합니다.`,
          );
        }
      }

      const payload = { ...createEventDto, createdBy: user.email };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'event-create' }, payload),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('신규 이벤트 등록 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateEventDto: UpdateEventDto, user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      // 연속 출석 체크 이벤트인 경우 조건값 유효성 체크
      // TODO : 각 이벤트 마다 조건값 유효성 체크는 추상화해서 각 이벤트 담당 모듈에서 처리 되도록 하면 좋을 것!
      if (updateEventDto.eventType === EventType.ATTENDANCE) {
        const validation = this.validationByAttendanceEvent(updateEventDto);
        if (!validation) {
          throw new BadRequestException(
            `연속 출석 체크 이벤트 조건은 숫자 형태 0보다 커야 합니다.`,
          );
        }
      }

      const payload = { ...updateEventDto, id: id, updatedBy: user.email };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'event-update' }, payload),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('이벤트 수정 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async detailEvent(id: string) {
    // eslint-disable-next-line no-useless-catch
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'get-event-by-id' }, id),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('이벤트 상세 조회 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async findAll(dto: GetEventsDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'get-all-events' }, dto),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('이벤트 조회 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }

  async attendance(user: UserDto) {
    // eslint-disable-next-line no-useless-catch
    try {
      const payload: CreateEventAttendanceDto = new CreateEventAttendanceDto();
      payload.userId = user._id;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response = await lastValueFrom(
        this.eventMicroservice.send({ cmd: 'event-attendance' }, payload),
      );

      if (!response || response === '') {
        throw new InternalServerErrorException('출석 체크 오류');
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      throw error;
    }
  }
}
