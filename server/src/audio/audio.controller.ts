import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Res,
  Delete,
  HttpCode,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AudioService } from "./audio.service";

@Controller("audio")
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get("recordings")
  @UseGuards(JwtAuthGuard)
  async getUserRecordings(@Req() req) {
    const userId = req.user.userId;

    return this.audioService.getRecordingsForUser(userId);
  }

  @Get("recordings/:id")
  @UseGuards(JwtAuthGuard)
  async getRecording(
    @Res() res: Response,
    @Param("id") id: number,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.audioService.getRecordingById(res, Number(id), userId);
  }

  @Delete("recordings/:id")
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteRecording(@Param("id") id: number, @Req() req) {
    const userId = req.user.userId;
    try {
      await this.audioService.deleteRecording(Number(id), userId);
    } catch (e) {
      throw new NotFoundException("Recording not found");
    }
  }
}
