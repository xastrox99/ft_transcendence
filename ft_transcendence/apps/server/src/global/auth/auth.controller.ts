import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Res,
  Req,
  UseGuards,
  Get,
  UnauthorizedException,
} from "@nestjs/common";
import axios from "axios";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "src/shared/decorators/get-user.decorator";
import {
  IntraSignInPayload,
  IntraTokenPayload,
  TwoFactorDto,
} from "./types/auth";
import { Auth42Guard } from "./guards/42.guard";

import { User } from "db";
import { ConfigService } from "@nestjs/config";

class otp {
  code: string;
}
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService
  ) {}

  @Get("logout")
  logout(@Req() req: Request, @Res() res: Response) {
    res.clearCookie("token");
    res.status(200).send();
  }

  @Get("42")
  async fortyTwoLogin(@Res() res: Response) {
    const client_id = this.configService.get<string>("INTRA_CLIENT_ID");
    const redirect_uri = this.configService.get<string>("INRTA_CALLBACK_URI");
    const uri = `https://api.intra.42.fr/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code`;
    res.redirect(uri);
  }
  @Get("42/callback")
  @UseGuards(Auth42Guard)
  async callback(@Req() req: Request, @Res() res: Response) {
    const payload = await this.authService.sign(req.user as IntraSignInPayload);

    if (!payload.data.twoFactorEnabled) res.cookie("token", payload.token);
    else res.cookie("2fa", payload.twoFa);
    res
      .status(300)
      .redirect(
        "http://localhost:3000/" +
          (payload.data.twoFactorEnabled
            ? "two/validate"
            : payload.first
            ? "setting"
            : "profile")
      );
  }

  // check the status of tow factor enabled or not
  @Get("tfa-status")
  @UseGuards(AuthGuard())
  async twoFactorStatus(@GetUser() user: User) {
    return await this.authService.getTwoFactorStatus(user.uid);
  }

  @Get("generate")
  @UseGuards(AuthGuard())
  async generateQrCode(@GetUser() user: User, @Res() res: Response) {
    try {
      const qrCode = await this.authService.generateQrCode(
        user.uid,
        user.email
      );
      res.status(200).json(qrCode);
    } catch (error) {
      res.status(400).json(error);
    }
  }

  @Post("verify")
  @UseGuards(AuthGuard())
  async verifyTwoFactor(@GetUser() user: User, @Body() dto: TwoFactorDto) {
    return await this.authService.verifyTwoFactorToken(user.uid, dto.otp);
  }

  @Post("validate")
  @UseGuards(AuthGuard('2fa'))
  async validateTwoFactor(
    @GetUser() user: User,
    @Body() dto: TwoFactorDto,
    @Res() res: Response,
    @Req() req: Request
  ) {
    const payload = await this.authService.sign(req.user as IntraSignInPayload);
    const validate = await this.authService.validateTwoFactor(
      user.uid,
      dto.otp
    );
    if (validate) {
      res.cookie("token", payload.token);
      res.clearCookie("2fa");
      res.send(true);
    } else {
      res.send(false);
    }
  }

  @Post("disable")
  @UseGuards(AuthGuard())
  async disableTwoFactor(@GetUser() user: User) {
    return await this.authService.disableTwoFactor(user.uid);
  }
}
