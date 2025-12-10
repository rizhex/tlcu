import { CreateDictionaryDto } from "./create-dictionary.dto";
import {PartialType} from "@nestjs/mapped-types"

export class UpdateDictionaryDto extends PartialType(CreateDictionaryDto){}