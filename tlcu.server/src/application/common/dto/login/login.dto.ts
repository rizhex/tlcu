import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario123',
    description: 'Nombre de usuario para hacer login',
  })
  @IsString()
  readonly username: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(6)
  readonly password: string;
}
