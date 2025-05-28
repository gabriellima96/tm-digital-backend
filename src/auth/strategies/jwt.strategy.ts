import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PayloadUsuarioAutenticado } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new InternalServerErrorException(
        'Variável de ambiente JWT_SECRET não está definida. A autenticação JWT não pode ser configurada.',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    cargo: string;
  }): Promise<PayloadUsuarioAutenticado> {
    const usuario = await this.usuariosService.buscarUmPorId(payload.sub); // (user)
    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Usuário não encontrado, inativo ou token inválido.');
    }

    return {
      id: payload.sub,
      email: payload.email,
      cargo: usuario.cargo,
      nome: usuario.nome,
      ativo: usuario.ativo,
    };
  }
}
