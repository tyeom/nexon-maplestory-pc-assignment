import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { RewardType } from '@app/common';
import { Event } from '../../event-process/schema/event.schema';

@Schema({
  timestamps: true,
})
export class Reward extends Document {
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

  @Prop({ type: String, enum: RewardType, required: true })
  rewardType: RewardType;

  /**
   * 포인트 or 쿠폰 보상인 경우 관련 금액 또는 수량
   */
  @Prop()
  amount?: number;

  @Prop()
  description?: string;

  @Prop() createdBy: string;

  @Prop() updatedBy: string;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
