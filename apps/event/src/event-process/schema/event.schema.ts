import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EventType } from '@app/common';

@Schema({
  timestamps: true,
})
export class Event extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description: string;

  @Prop({ type: String, enum: EventType, required: true })
  eventType: EventType;

  /**
   * 이벤트 조건
   *
   * 예] 연속 출석 체크 이벤트(ATTENDANCE)인 경우 연속 출석일 수 입력
   */
  @Prop({ required: true })
  condition: string;

  @Prop({ required: true })
  startAt: Date;

  @Prop({ required: true })
  endAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.virtual('rewards', {
  ref: 'Reward',
  localField: '_id',
  foreignField: 'event',
});

EventSchema.set('toObject', { virtuals: true });
EventSchema.set('toJSON', { virtuals: true });
