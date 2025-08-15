import { Controller, Get, UseGuards } from '@nestjs/common';
import type { User } from '../../generated/prisma';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    @Get('me')
    getMe(@GetUser() user: User) {
        return user;
    }
}
