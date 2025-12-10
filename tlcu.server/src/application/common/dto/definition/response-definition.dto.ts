import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ResponseDefinitionDto{
    
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    id: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    defText: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    senseNumber: number;
    
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    etymology: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    remarks: string = "";
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    ontologicalClassification: string;
    
    @ApiProperty()
    @IsOptional()
    @IsString()
    wordClass: string;

}