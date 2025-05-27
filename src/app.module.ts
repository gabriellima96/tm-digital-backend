import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { EstadosModule } from './estados/estados.module';
import { MunicipiosModule } from './municipios/municipios.module';
import { ProprietariosModule } from './proprietarios/proprietarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    EstadosModule,
    MunicipiosModule,
    ProprietariosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
