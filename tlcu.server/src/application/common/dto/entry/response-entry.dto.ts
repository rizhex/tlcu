import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ResponseDefinitionDto } from "../definition/response-definition.dto";

export class ResponseEntryDto{
    @ApiProperty()
    @IsOptional()
    id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    regName: string;

    @ApiProperty()
    @IsOptional()
    definitions: ResponseDefinitionDto[]

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isParent: boolean;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    isChild: boolean;
}