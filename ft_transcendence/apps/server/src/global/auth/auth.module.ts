import { PassportModule } from '@nestjs/passport';
import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../../modules/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategy/auth.jwt.startegy';
import { TwoFaJwtStrategy } from './strategy/2fa.jwt.startegy';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TwoFaJwtStrategy],
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      global: true,
      useFactory: async (conf: ConfigService) => {
        return {
          secret: conf.get<string>('JWT_SECRET_TOKEN'),
          signOptions: {
            expiresIn: conf.get<string>('JWT_TOKEN_EXPIRES_DATE'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [JwtStrategy,TwoFaJwtStrategy, PassportModule],
})
export class AuthModule {}
