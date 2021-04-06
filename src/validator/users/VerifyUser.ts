import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyUserValidator {
  @IsNotEmpty({ message: 'uuid is required' })
  @IsString({
    message: 'uuid is string',
  })
  uuid: string;
}