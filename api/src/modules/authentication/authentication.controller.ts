import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { Public } from 'decorators/public.decorator';
import { LocalAuthGuard } from 'guards/local-auth.guard';
import {
  AccessToken,
  AuthenticationService,
} from 'modules/authentication/authentication.service';
import { LoginDto } from 'modules/authentication/dto/login.dto';
import { UserAccountValidationDTO } from 'modules/authentication/dto/user-account.validation.dto';

@Controller('/auth')
@ApiTags('Authentication')
@ApiBearerAuth()
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    description: 'Sign user in, issuing a JWT token.',
    summary: 'Sign user in',
    operationId: 'sign-in',
  })
  @Post('sign-in')
  @ApiCreatedResponse({
    type: AccessToken,
    description: 'Login successful',
  })
  async login(
    @Request() req: RequestWithAuthenticatedUser,
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<AccessToken> {
    return this.authenticationService.login(req.user);
  }

  @Public()
  @Get('validate-account/:sub/:validationToken')
  @ApiOperation({ description: 'Confirm an activation token for a new user.' })
  @ApiOkResponse()
  async confirm(
    @Param() activationToken: UserAccountValidationDTO,
  ): Promise<void> {
    await this.authenticationService.validateActivationToken(activationToken);
  }

  /**
   * @description: This endpoint is exclusively to validate requests sent to the tiler
   *               service
   */
  @Get('validate-token')
  async validateToken(): Promise<any> {
    return { message: 'valid token' };
  }

  /**
   * @debt Make sure (and add e2e tests to check for regressions) that we
   * gracefully handle situations where a user's username has changed between
   * the time the JWT token being presented was issued and the attempt to
   * refresh the JWT.
   */
  @Post('refresh-token')
  @ApiOperation({
    description:
      'Request a fresh JWT token, given a still-valid one for the same user; no request payload is required: the user id is read from the JWT token presented.',
    summary: 'Refresh JWT token',
    operationId: 'refresh-token',
  })
  @ApiCreatedResponse({
    type: AccessToken,
    description: 'Token refreshed successfully',
  })
  @ApiUnauthorizedResponse()
  async refreshToken(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<AccessToken> {
    return this.authenticationService.login(req.user);
  }
}
