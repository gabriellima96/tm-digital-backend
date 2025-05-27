import { PartialType } from '@nestjs/mapped-types';
import { CreateProprietarioDto } from './create-proprietario.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class UpdateProprietarioDto extends PartialType(CreateProprietarioDto) {}
