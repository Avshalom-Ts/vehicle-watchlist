import { Module } from '@nestjs/common';
import { UserModule } from '@vehicle-watchlist/database';
import { UsersService } from './users.service';

@Module({
    imports: [UserModule],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
