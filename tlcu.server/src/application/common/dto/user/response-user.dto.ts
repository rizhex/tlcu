import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import UserRole from "src/core/common/user-role.enum";
import { User } from "src/core/entities/user.entity";

export class ResponseUserDto{
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    id: string;
    
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
    @IsEnum(UserRole)
    role: UserRole
}