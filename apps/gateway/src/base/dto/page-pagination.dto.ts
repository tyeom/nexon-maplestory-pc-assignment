import { IsNumber, IsOptional } from 'class-validator';

export class PagePaginationDto {
  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  take: number = 25;
}
