import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Socket } from "socket.io";

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, decodeURIComponent(v.join("="))];
    }),
  );
}

export interface AuthenticatedSocket extends Socket {
  data: { userId: number };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient<Socket>();
    // Parse cookies from the handshake headers
    const cookies = parseCookies(client.handshake.headers.cookie);
    const token = cookies["refreshToken"];
    console.log("token", token);
    if (!token) throw new UnauthorizedException("No JWT provided");

    try {
      const payload: { sub: number } = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      (client.data as { userId: number }).userId = payload.sub;
      return true;
    } catch (err) {
      console.log("err", err);
      throw new UnauthorizedException("Invalid JWT");
    }
  }
}
