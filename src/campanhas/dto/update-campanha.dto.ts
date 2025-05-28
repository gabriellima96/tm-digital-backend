import { PartialType } from '@nestjs/mapped-types';
import { CreateCampanhaDto } from './create-campanha.dto';

export class UpdateCampanhaDto extends PartialType(CreateCampanhaDto) {}
