import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserValidator {
  @IsNotEmpty({ message: 'Username is required' })
  @MaxLength(200, {
    message: 'Username is too long',
  })
  @IsString({
    message: 'Username is string',
  })
  username: string;

  @IsEmail({}, { message: 'Email invalidate' })
  @MaxLength(200, {
    message: 'Email is too long',
  })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, {
    message: 'Password must be at least 8 characters!',
  })
  password: string;

  referralUser: string;
}