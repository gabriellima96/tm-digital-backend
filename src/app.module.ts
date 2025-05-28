import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { EstadosModule } from './estados/estados.module';
import { MunicipiosModule } from './municipios/municipios.module';
import { ProprietariosModule } from './proprietarios/proprietarios.module';
import { CulturasModule } from './culturas/culturas.module';
import { PropriedadesRuraisModule } from './propriedades-rurais/propriedades-rurais.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    EstadosModule,
    MunicipiosModule,
    ProprietariosModule,
    CulturasModule,
    PropriedadesRuraisModule,
    UsuariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
