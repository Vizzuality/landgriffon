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
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { JwtAuthGuard } from 'guards/jwt-auth.guard';
import { LocalAuthGuard } from 'guards/local-auth.guard';
import {
  AccessToken,
  AuthenticationService,
} from 'modules/authentication/authentication.service';
import { LoginDto } from 'modules/authentication/dto/login.dto';
import { SignUpDto } from 'modules/authentication/dto/sign-up.dto';
import { UserAccountValidationDTO } from 'modules/authentication/dto/user-account.validation.dto';

@Controller('/auth')
@ApiTags('Authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

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
    @Body(ValidationPipe) _dto: LoginDto,
  ): Promise<AccessToken> {
    return this.authenticationService.login(req.user);
  }

  @Post('sign-up')
  @ApiOperation({ description: 'Sign up for an user account.' })
  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  async signUp(
    @Request() _req: Request,
    @Body(ValidationPipe) signupDto: SignUpDto,
  ): Promise<void> {
    await this.authenticationService.createUser(signupDto);
  }

  @Get('validate-account/:sub/:validationToken')
  @ApiOperation({ description: 'Confirm an activation token for a new user.' })
  @ApiOkResponse()
  async confirm(
    @Param() activationToken: UserAccountValidationDTO,
  ): Promise<void> {
    await this.authenticationService.validateActivationToken(activationToken);
  }

  /**
   * @debt Make sure (and add e2e tests to check for regressions) that we
   * gracefully handle situations where a user's username has changed between
   * the time the JWT token being presented was issued and the attempt to
   * refresh the JWT.
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  @ApiOperation({
    description:
      'Request a fresh JWT token, given a still-valid one for the same user; no request payload is required: the user id is read from the JWT token presented.',
    summary: 'Refresh JWT token',
    operationId: 'refresh-token',
  })
  @ApiCreatedResponse({
    type: 'AccessToken',
  })
  @ApiUnauthorizedResponse()
  async refreshToken(
    @Request() req: RequestWithAuthenticatedUser,
  ): Promise<AccessToken> {
    return this.authenticationService.login(req.user);
  }
}
