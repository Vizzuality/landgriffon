import { InfoDTO } from 'nestjs-base-service';
import { User } from 'modules/users/user.entity';

export type AppInfoDTO = InfoDTO<User>;
