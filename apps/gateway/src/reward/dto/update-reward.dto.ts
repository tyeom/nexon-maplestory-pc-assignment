import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateRewardDto } from './create-reward.dto';

export class UpdateRewardDto extends PartialType(
  OmitType(CreateRewardDto, ['event'] as const),
) {
  id: string;
}
