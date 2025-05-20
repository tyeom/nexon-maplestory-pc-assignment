import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '@app/common';
import { UserDto } from './dto/user.dto';
import { GetUsersDto } from './dto/get-users-dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async onModuleInit() {
    try {
      // Auth 서비스 최초 실행시 기본 최고 관리자 계정 [Admin] 추가
      await this.createDefaultAdmin();
      // Auth 서비스 최초 실행시 기본 운영자 계정 [OPERATOR] 추가
      await this.createDefaultOperator();
      // Auth 서비스 최초 실행시 기본 감사자 계정 [AUDITOR] 추가
      await this.createDefaultAuditor();
    } catch (error) {
      console.error('onModuleInit ERROR =>', error);
    }
  }

  /**
   * 기본 관리자 계정 추가 [Database]
   */
  private async createDefaultAdmin() {
    try {
      console.log('최고 관리자 계정 존재 여부 체크');
      const adminUser = await this.findOneByEmail('admin@test.com');

      if (adminUser) {
        console.warn('기본 관리자 계정 존재함');
        return;
      }

      const hash = await this.getHashRounds('1234');

      const created = await this.userModel.create({
        email: 'admin@test.com',
        name: '최고 관리자',
        password: hash,
        role: Role.ADMIN,
      });

      const createdAdminUser = await created.save();
      if (!createdAdminUser) {
        console.error('기본 관리자 계정 생성 오류!');
      } else {
        console.log('기본 관리자 계정 생성 완료');
      }
    } catch (error) {
      console.error('createDefaultAdmin ERROR =>', error);
      throw error;
    }
  }

  /**
   * 기본 운영자 계정 추가 [Database]
   */
  private async createDefaultOperator() {
    try {
      console.log('운영자 계정 존재 여부 체크');
      const adminUser = await this.findOneByEmail('operator@test.com');

      if (adminUser) {
        console.warn('운영자 계정 존재함');
        return;
      }

      const hash = await this.getHashRounds('1234');

      const created = await this.userModel.create({
        email: 'operator@test.com',
        name: '운영자',
        password: hash,
        role: Role.OPERATOR,
      });

      const createdAdminUser = await created.save();
      if (!createdAdminUser) {
        console.error('운영자 계정 생성 오류!');
      } else {
        console.log('운영자 계정 생성 완료');
      }
    } catch (error) {
      console.error('createDefaultOperator ERROR =>', error);
      throw error;
    }
  }

  /**
   * 기본 감사자 계정 추가 [Database]
   */
  private async createDefaultAuditor() {
    try {
      console.log('감사자 계정 존재 여부 체크');
      const adminUser = await this.findOneByEmail('auditor@test.com');

      if (adminUser) {
        console.warn('감사자 계정 존재함');
        return;
      }

      const hash = await this.getHashRounds('1234');

      const created = await this.userModel.create({
        email: 'auditor@test.com',
        name: '감사자',
        password: hash,
        role: Role.AUDITOR,
      });

      const createdAdminUser = await created.save();
      if (!createdAdminUser) {
        console.error('감사자 계정 생성 오류!');
      } else {
        console.log('감사자 계정 생성 완료');
      }
    } catch (error) {
      console.error('createDefaultAuditor ERROR =>', error);
      throw error;
    }
  }

  private async getHashRounds(plainVal: string): Promise<string> {
    const hash = await bcrypt.hash(
      plainVal,
      this.configService.get<number>('HASH_ROUNDS') || 10,
    );
    return hash;
  }

  async create(createUserDto: CreateUserDto) {
    const userDto = createUserDto;
    const user = await this.userModel.findOne({ email: userDto.email }).exec();

    if (user) {
      throw new RpcException('중복된 이메일 입니다.');
    }

    const hash = await this.getHashRounds(createUserDto.password);

    const created = await this.userModel.create({
      email: userDto.email,
      name: userDto.name,
      password: hash,
    });

    return await created.save();
  }

  async findOneById(id: string) {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) {
      throw new RpcException('존재하지 않는 사용자 입니다.');
    }

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel
      .findOne(
        { email },
        {
          password: 1,
          role: 1,
        },
      )
      .exec();
    return user;
  }

  async update(updateUserDto: UpdateUserDto, user: UserDto) {
    const { password } = updateUserDto;
    const foundUser = await this.findOneByEmail(user.email);
    if (!foundUser) {
      throw new RpcException('잘못된 요청 입니다.');
    }

    let input = {
      name: updateUserDto.name,
    };

    if (password) {
      const hash = await this.getHashRounds(password);

      input = {
        ...input,
        password: hash,
      } as UpdateUserDto;
    }

    await this.userModel.findByIdAndUpdate(foundUser._id, input).exec();
    return this.userModel.findById(foundUser._id);
  }

  async updateRole(email: string, role: Role) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new RpcException('존재하지 않는 사용자입니다.');
    }

    const parsedRole =
      typeof role === 'string' ? Role[role as keyof typeof Role] : role;

    const input = {
      role: parsedRole,
    };

    await this.userModel.findByIdAndUpdate(user._id, input).exec();
    return this.userModel.findById(user._id);
  }

  async findAll(getUsersDto: GetUsersDto) {
    const { page = 1, take = 25, userName, userEmail } = getUsersDto;
    const skip = (page - 1) * take;

    const filter: any = {};
    if (userName) {
      filter.name = { $regex: userName, $options: 'i' };
    }
    if (userEmail) {
      filter.email = { $regex: userEmail, $options: 'i' };
    }

    // 데이터 및 전체 개수 조회
    const [data, total] = await Promise.all([
      this.userModel
        .find(filter)
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 })
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      meta: {
        page,
        take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }
}
