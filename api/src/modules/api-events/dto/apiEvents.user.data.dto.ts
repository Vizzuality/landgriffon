import { IsNumber, IsUUID } from 'class-validator';

export class ActivationTokenGeneratedV1Alpha1 {
  /**
   * Unique activation token generated during user signup flow.
   */
  @IsUUID(4)
  validationToken!: string;

  /**
   * Expiration timestamp of the activation token.
   */
  @IsNumber()
  exp!: number;

  /**
   * Subject of the activation flow: in this case, the user's UUID.
   */
  @IsUUID(4)
  sub!: string;
}
