import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CreateDefinitionDto } from "../definition/create-definition.dto";

export class CreateEntryDto {
  @ApiProperty({
    example: 1,
    description: 'ID del diccionario al que pertenece la entrada'
  })
  @IsNotEmpty()
  @IsNumber()
  dictionaryId: number;
  
  @ApiProperty({
    example: "example entry",
    description: 'Nombre de la entrada'
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: "example_entry",
    description: 'Nombre regularizado de la entrada'
  })
  @IsNotEmpty()
  @IsString()
  regName: string;

  @ApiProperty({
    type: [CreateDefinitionDto],
    example: [{
      defText: "definition text example",
      senseNumber: 1,
      etymology: "etymology example",
      remarks: "optional remarks",
      ontologicalClassification: "classification example",
      wordClass: "noun"
    }],
    description: 'Lista de definiciones asociadas a la entrada',
    required: false
  })
  @IsOptional()
  definitions: CreateDefinitionDto[];
}