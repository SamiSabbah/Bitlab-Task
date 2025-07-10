import { Logger, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import {
  WebSocketGateway,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AudioService } from "./audio.service";
import { WsJwtGuard } from "../auth/ws-jwt.guard";
import { AudioChunkDto } from "./dto/audio-chunk.dto";

type ClientData = { userId: number };

@WebSocketGateway({
  namespace: "/audio",
  cors: { origin: "http://localhost:3000", credentials: true },
})
@UseGuards(WsJwtGuard)
export class AudioGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AudioGateway.name);

  constructor(private readonly audioService: AudioService) {}

  afterInit() {
    console.log("✅ Audio Gateway initialized");
  }

  @SubscribeMessage("startRecording")
  async handleStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: any,
  ) {
    try {
      console.log("startRecording event received from client", client.id);
      this.logger.log("startRecording event received from client", client.id);
      const userId = (client.data as ClientData).userId;
      const recording = await this.audioService.createRecording(userId);
      await client.join(`rec:${recording.id}`);

      return recording.id + "";
    } catch (error) {
      console.log("error", error);
    }
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @SubscribeMessage("audioChunk")
  async handleChunk(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AudioChunkDto,
  ) {
    try {
      console.log("audioChunk payload", new Uint8Array(payload.chunk));
      const userId = (client.data as ClientData).userId;
      console.log(userId);
      await this.audioService.saveChunk(
        payload.recordingId,
        userId,
        new Uint8Array(payload.chunk),
      );
      this.server
        .to(`rec:${payload.recordingId}`)
        .emit("chunkReceived", { recordingId: payload.recordingId });
    } catch (error) {
      console.log("err", error);
      // this.logger.error("Error handling audio chunk", error?.stack);
      // client.emit("error", { message: "Failed to save audio chunk" });
    }
  }

  @SubscribeMessage("stopRecording")
  async handleStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { recordingId: number },
  ) {
    await client.leave(`rec:${payload.recordingId}`);
    return "stopRecording";
  }
}
