import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Estado } from './../src/estados/entities/estado.entity';
import { Municipio } from './../src/municipios/entities/municipio.entity';
import { Repository } from 'typeorm';
import { CreateEstadoDto } from './../src/estados/dto/create-estado.dto';
import { CreateMunicipioDto } from './../src/municipios/dto/create-municipio.dto';
import { v4 as uuidv4 } from 'uuid';
import * as http from 'http';

describe('MunicipiosController (E2E) e Interação com Estados', () => {
  let app: INestApplication;
  let estadoRepository: Repository<Estado>;
  let municipioRepository: Repository<Municipio>;
  let estadoTesteId: string;
  let estadoTesteIdSemMunicipio: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    estadoRepository = moduleFixture.get<Repository<Estado>>(getRepositoryToken(Estado));
    municipioRepository = moduleFixture.get<Repository<Municipio>>(getRepositoryToken(Municipio));
  });

  beforeAll(async () => {
    // Limpar tabelas para garantir a independência dos testes
    await municipioRepository.query('DELETE FROM "municipios";');
    await estadoRepository.query('DELETE FROM "estados";');

    // Criar um estado base para os testes de município
    const dtoEstado: CreateEstadoDto = { nome: 'Estado de Teste', uf: 'ET' };
    const dtoEstadoSemMunicipio: CreateEstadoDto = { nome: 'Estado de Teste', uf: 'EM' };
    const estadoCriado = await estadoRepository.save(estadoRepository.create(dtoEstado));
    const estadoCriadoSemMunicipio = await estadoRepository.save(
      estadoRepository.create(dtoEstadoSemMunicipio),
    );
    estadoTesteId = estadoCriado.id;
    estadoTesteIdSemMunicipio = estadoCriadoSemMunicipio.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /municipios', () => {
    it('deve criar um município com sucesso', async () => {
      const criarMunicipioDto: CreateMunicipioDto = {
        nome: 'Município Teste 1',
        idEstado: estadoTesteId,
      };

      const response = await request(app.getHttpServer() as http.Server)
        .post('/municipios')
        .send(criarMunicipioDto)
        .expect(HttpStatus.CREATED);

      const municipioCriado = response.body as Municipio;
      expect(municipioCriado).toBeDefined();
      expect(municipioCriado.nome).toEqual(criarMunicipioDto.nome);
      expect(municipioCriado.id).toBeDefined();
    });

    it('não deve criar um município se o idEstado não existir', async () => {
      const idEstadoInexistente = uuidv4(); // Estado inexistente
      const criarMunicipioDto: CreateMunicipioDto = {
        nome: 'Município Fantasma',
        idEstado: idEstadoInexistente,
      };

      await request(app.getHttpServer() as http.Server)
        .post('/municipios')
        .send(criarMunicipioDto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('não deve criar um município com nome duplicado no mesmo estado', async () => {
      const nomeMunicipio = 'Município Duplicado Teste';
      const criarDto: CreateMunicipioDto = {
        nome: nomeMunicipio,
        idEstado: estadoTesteId,
      };

      // Cria o primeiro
      await request(app.getHttpServer() as http.Server)
        .post('/municipios')
        .send(criarDto)
        .expect(HttpStatus.CREATED);

      // Tenta criar o segundo com mesmo nome e estado
      await request(app.getHttpServer() as http.Server)
        .post('/municipios')
        .send(criarDto)
        .expect(HttpStatus.CONFLICT);
    });

    it('não deve criar um município com idEstado inválido (não UUID)', async () => {
      const criarMunicipioDto: CreateMunicipioDto = {
        nome: 'Município com Estado Inválido',
        idEstado: 'id-invalido',
      };

      await request(app.getHttpServer() as http.Server)
        .post('/municipios')
        .send(criarMunicipioDto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('não deve criar um município com nome faltando', async () => {
      const criarMunicipioDto: CreateMunicipioDto = {
        nome: '',
        idEstado: estadoTesteId,
      };

      await request(app.getHttpServer() as http.Server)
        .post('/municipios')
        .send(criarMunicipioDto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /estados/:idEstado/municipios', () => {
    it('deve retornar uma lista de municípios para um estado existente', async () => {
      // Criar alguns municípios para o estadoTesteId
      await municipioRepository.save(
        municipioRepository.create({ nome: 'Cidade A', estado: { id: estadoTesteId } as Estado }),
      );
      await municipioRepository.save(
        municipioRepository.create({ nome: 'Cidade B', estado: { id: estadoTesteId } as Estado }),
      );

      const response = await request(app.getHttpServer() as http.Server)
        .get(`/estados/${estadoTesteId}/municipios`)
        .expect(HttpStatus.OK);
      const municipios = response.body as Array<Municipio>;
      expect(municipios).toBeInstanceOf(Array);
      expect(municipios.map((m: Municipio) => m.nome)).toEqual(
        expect.arrayContaining(['Cidade A', 'Cidade B']),
      );
    });

    it('deve retornar uma lista vazia se o estado existir mas não tiver municípios', async () => {
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/estados/${estadoTesteIdSemMunicipio}/municipios`)
        .expect(HttpStatus.OK);
      const municipios = response.body as Array<Municipio>;
      expect(municipios).toBeInstanceOf(Array);
      expect(municipios.length).toEqual(0);
    });

    it('deve retornar 404 se o idEstado não existir', async () => {
      const idEstadoInexistente = uuidv4();
      await request(app.getHttpServer() as http.Server)
        .get(`/estados/${idEstadoInexistente}/municipios`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('deve retornar 400 se o idEstado for um UUID inválido', async () => {
      await request(app.getHttpServer() as http.Server)
        .get(`/estados/id-estado-invalido/municipios`)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
