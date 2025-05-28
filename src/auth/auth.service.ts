import { Injectable } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { CargoUsuario } from '../usuarios/entities/usuario.entity';

export interface PayloadUsuarioAutenticado {
  id: string;
  email: string;
  nome: string;
  cargo: CargoUsuario;
  ativo: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validarUsuario(
    email: string,
    senhaRecebida: string,
  ): Promise<PayloadUsuarioAutenticado | null> {
    const usuario = await this.usuariosService.buscarUmPorEmail(email, true);

    if (usuario && (await usuario.validarSenha(senhaRecebida))) {
      return {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        cargo: usuario.cargo,
        ativo: usuario.ativo,
      };
    }
    return null;
  }

  login(usuario: PayloadUsuarioAutenticado) {
    const payloadJwt = {
      sub: usuario.id,
      email: usuario.email,
      cargo: usuario.cargo,
      nome: usuario.nome,
      ativo: usuario.ativo,
    };
    return {
      access_token: this.jwtService.sign(payloadJwt),
    };
  }
}
