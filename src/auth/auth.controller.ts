import { Controller, Post, UseGuards, Req, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { AuthService, PayloadUsuarioAutenticado } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import { LoginDto } from './dto/login.dto';

interface RequestComUsuario extends Request {
  user: PayloadUsuarioAutenticado;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(@Req() req: RequestComUsuario, @Body() _loginDto: LoginDto) {
    return this.authService.login(req.user);
  }
}
