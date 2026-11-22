
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';

export class CreateMonitorDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUrl({
    protocols: ['http', 'https'],
    require_protocol: true,
  })
  url!: string;

  @IsInt()
  @Min(30)
  intervalSeconds!: number;
}
