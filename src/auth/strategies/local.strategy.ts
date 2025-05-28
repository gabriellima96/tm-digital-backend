import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService, PayloadUsuarioAutenticado } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'senha',
    });
  }

  async validate(email: string, senhaRecebida: string): Promise<PayloadUsuarioAutenticado> {
    const usuarioValidado = await this.authService.validarUsuario(email, senhaRecebida);

    if (!usuarioValidado) {
      throw new UnauthorizedException('Credenciais inválidas. Verifique seu email e senha.');
    }
    return usuarioValidado;
  }
}
