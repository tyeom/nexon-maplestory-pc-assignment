import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * 출석 체크 스키마
 */
@Schema({
  timestamps: true,
})
export class Attendance extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  checkInDate: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
