import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Signed JWT Access Token generated via Jose library',
  })
  access_token: string;

  @ApiProperty({ type: UserResponseDto, description: 'Authenticated user profile details' })
  user: UserResponseDto;
}
