import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { IntraSignInPayload, IntraTokenPayload } from "../types/auth";
import axios from "axios";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Auth42Guard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.validateRequest(request);
  }

  private async validateRequest(req: Request): Promise<boolean> {
    const code = req.query["code"];

    if (!code) return false;

    try {
      const { access_token } = await this.getAccessToken(code as string);

      const user = await this.getUser(access_token);
      req.user = user;
    } catch (error) {
      console.error(error);
      return false;
    }
    return true;
  }

  private async getAccessToken(code: string): Promise<IntraTokenPayload> {
    const { data } = await axios.post<IntraTokenPayload>(
      "https://api.intra.42.fr/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: this.config.get<string>("INTRA_CLIENT_ID"),
        client_secret: this.config.get<string>("INTRA_CLIENT_SECRET"),
        redirect_uri: this.config.get<string>("INRTA_CALLBACK_URI"),
        code,
      }
    );

    return data;
  }

  private async getUser(access_token: string): Promise<IntraSignInPayload> {
    const { data: userData } = await axios.get<IntraSignInPayload>(
      "https://api.intra.42.fr/v2/me",
      {
        headers: { Authorization: "Bearer " + access_token },
      }
    );
    const { email, login, first_name, last_name, url, phone, kind, image } =
      userData;
    return {
      email,
      login,
      first_name,
      last_name,
      url,
      phone,
      kind,
      image,
    };
  }
}
