import { Body, Controller, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard"; // To be created
import { RefreshTokenGuard } from "./refresh-token.guard";

import type { Request, Response } from "express";

interface RequestWithUser extends Request {
  user: { userId: number; email: string };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { accessToken };
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return { accessToken };
  }

  @UseGuards(RefreshTokenGuard)
  @Post("refresh")
  refresh(@Req() req: RequestWithUser) {
    // Assume userId and email are extracted from refresh token (to be handled in guard/middleware)
    const { userId, email } = req.user;
    return this.authService.refresh(userId, email);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  logout() {
    return { message: "Logged out" };
  }
}
