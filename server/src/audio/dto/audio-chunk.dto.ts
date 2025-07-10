import { IsInt, IsNotEmpty } from "class-validator";

export class AudioChunkDto {
  @IsInt()
  recordingId: number;

  @IsNotEmpty()
  chunk: Buffer;
}
