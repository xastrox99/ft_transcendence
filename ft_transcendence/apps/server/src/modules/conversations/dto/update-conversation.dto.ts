import { PartialType } from '@nestjs/mapped-types';
import { CreateConversationDto } from './create-conversation.dto';
import { $Enums } from 'db';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateConversationDto {
  @IsString()
  name: string;
}

export class UpdateUserMembershipInRoomDto {
  @IsString()
  user: string;
  @IsString()
  conversation: string;
}

export class MutUserDto {
  @IsString()
  user: string;
  @IsString()
  conversation: string;
  @IsDateString()
  until: Date;
}

export class UnMutUserDto {
  @IsString()
  user: string;
  @IsString()
  conversation: string;
}

export class JoinChat {
  @IsString()
  conversation: string;
  @IsOptional()
  @IsString()
  password?: string;
}

export class ProtectChannel {
  @IsString()
  password: string;
  @IsString()
  conversation: string;
}

export class UnProtectChannel {
  @IsString()
  conversation: string;
  @IsEnum($Enums.ChatVisibility)
  visibility: $Enums.ChatVisibility
}
