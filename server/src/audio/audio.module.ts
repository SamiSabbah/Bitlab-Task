import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { PrismaModule } from "../prisma/prisma.module";
import { AudioGateway } from "./audio.gateway";
import { AudioService } from "./audio.service";
import { WsJwtGuard } from "../auth/ws-jwt.guard";
import { AudioController } from "./audio.controller";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d" },
    }),
  ],
  providers: [AudioGateway, AudioService, WsJwtGuard],
  controllers: [AudioController],
})
export class AudioModule {}
