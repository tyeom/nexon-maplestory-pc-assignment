import { IsOptional, IsString } from 'class-validator';
import { PagePaginationDto } from '../../base/dto';

export class GetUsersDto extends PagePaginationDto {
  @IsOptional()
  @IsString()
  userName: string;

  @IsOptional()
  @IsString()
  userEmail: string;
}
