import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import UserRole from "src/core/common/user-role.enum";

export class CreateUserDto{
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    username: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    email: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole
}