import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RewardClaimStatus } from '@app/common';
import { Event } from '../../event-process/schema/event.schema';

@Schema({
  timestamps: true,
})
export class RewardClaim extends Document {
  @Prop({
    type: [
      {
        required: true,
        type: Types.ObjectId,
        ref: 'Event',
      },
    ],
  })
  event: Event;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  /**
   * 요청 상태 : 결과 대기 / 성공 / 실패
   */
  @Prop({
    type: String,
    enum: RewardClaimStatus,
    default: RewardClaimStatus.PENDING,
    required: true,
  })
  status: RewardClaimStatus;

  @Prop() failReason?: string;

  /**
   * 요청 처리한 운영자 Id
   */
  @Prop()
  operatorBy: string;
}

export const RewardClaimSchema = SchemaFactory.createForClass(RewardClaim);