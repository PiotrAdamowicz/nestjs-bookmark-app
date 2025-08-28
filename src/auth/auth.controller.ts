import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, AuthSignupDto } from './dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @ApiResponse({ type: AuthSignupDto })
    @Post('signup')
    signup(@Body() dto: AuthSignupDto) {
        return this.authService.signup(dto);
    }

    @ApiResponse({ type: AuthDto, status: HttpStatus.OK })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() dto: AuthDto) {
        return this.authService.login(dto);
    }
}
