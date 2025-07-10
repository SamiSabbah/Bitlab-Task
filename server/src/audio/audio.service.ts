// src/audio/audio.service.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { Response } from "express";

@Injectable()
export class AudioService {
  constructor(private readonly prisma: PrismaService) {}

  async saveChunk(recordingId: number, userId: number, chunk: Uint8Array) {
    // (Optionally) verify recording belongs to user here
    return this.prisma.audioChunk.create({
      data: {
        recordingId,
        data: chunk,
        timestamp: new Date(),
      },
    });
  }

  async getRecordingsForUser(userId: number) {
    return this.prisma.recording.findMany({
      where: { userId },
    });
  }

  async getRecordingById(res: Response, id: number, userId: number) {
    const recording = await this.prisma.recording.findUnique({
      where: { id, userId },
      include: { chunks: true },
    });
    if (!recording || recording.userId !== userId) {
      res.status(404).send("Not found");
      return;
    }
    const mergeUint8 = (arrays: Uint8Array[]) => {
      const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
      }
      return result;
    };
    const audioFile = mergeUint8(
      recording.chunks.map((c) => new Uint8Array(c.data)),
    );
    res.setHeader("Content-Type", "audio/webm");
    res.setHeader("Content-Length", audioFile.length);
    res.send(Buffer.from(audioFile));
  }

  async createRecording(userId: number) {
    return this.prisma.recording.create({
      data: { userId },
    });
  }

  async deleteRecording(id: number, userId: number) {
    // Only allow deleting if the recording belongs to the user
    return this.prisma.recording.delete({
      where: { id_userId: { id, userId } },
    });
  }
}
