import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Estado } from './../src/estados/entities/estado.entity';
import { Repository } from 'typeorm';
import { CreateEstadoDto } from './../src/estados/dto/create-estado.dto';
import * as http from 'http';

describe('EstadosController (E2E)', () => {
  let app: INestApplication;
  let estadoRepository: Repository<Estado>;
  let estadoCriadoId: string;
  let estadoCriadoUf: string;

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
  });

  beforeAll(async () => {
    await estadoRepository.query('DELETE FROM "estados" where uf = \'SC\';');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/estados (POST)', () => {
    it('deve criar um estado com sucesso', async () => {
      const criarEstadoDto: CreateEstadoDto = {
        nome: 'Santa Catarina',
        uf: 'SC',
      };
      const response = await request(app.getHttpServer() as http.Server)
        .post('/estados')
        .send(criarEstadoDto)
        .expect(HttpStatus.CREATED);

      const estadoCriado = response.body as Estado;
      expect(estadoCriado).toBeDefined();
      expect(estadoCriado.nome).toEqual(criarEstadoDto.nome);
      expect(estadoCriado.uf).toEqual(criarEstadoDto.uf);
      expect(estadoCriado.id).toBeDefined();

      // Salvar para usar em outros testes.
      estadoCriadoId = estadoCriado.id;
      estadoCriadoUf = estadoCriado.uf;
    });

    it('não deve criar um estado com UF duplicada', async () => {
      const estadoDuplicado: CreateEstadoDto = { nome: 'Santa Catarina', uf: 'SC' };
      await request(app.getHttpServer() as http.Server)
        .post('/estados')
        .send(estadoDuplicado)
        .expect(HttpStatus.CONFLICT);
    });

    it('não deve criar um estado com dados inválidos (ex: nome faltando)', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/estados')
        .send({ uf: 'RJ' })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('não deve criar um estado com UF inválida (ex: 3 caracteres)', () => {
      return request(app.getHttpServer() as http.Server)
        .post('/estados')
        .send({ nome: 'Rio de Janeiro', uf: 'RJJ' })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/estados (GET)', () => {
    it('deve retornar uma lista de estados', async () => {
      const response = await request(app.getHttpServer() as http.Server)
        .get('/estados')
        .expect(HttpStatus.OK); // Espera 200

      const estados = response.body as Array<Estado>;
      expect(estados).toBeInstanceOf(Array);
      expect(estados.length).toBeGreaterThan(0);
    });
  });

  describe('/estados/:id (GET)', () => {
    it('deve retornar um estado específico pelo ID', () => {
      return request(app.getHttpServer() as http.Server)
        .get(`/estados/${estadoCriadoId}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const estado = res.body as Estado;
          expect(estado.id).toEqual(estadoCriadoId);
          expect(estado.uf).toEqual(estadoCriadoUf);
        });
    });

    it('deve retornar 404 para um ID inexistente', () => {
      const idInexistente = '4e3d8e40-734b-4088-9484-f538ed09e813';
      return request(app.getHttpServer() as http.Server)
        .get(`/estados/${idInexistente}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('deve retornar 400 para um ID inválido (não UUID)', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/estados/id-invalido')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/estados/uf/:uf (GET)', () => {
    it('deve retornar um estado específico pela UF', () => {
      return request(app.getHttpServer() as http.Server)
        .get(`/estados/uf/${estadoCriadoUf}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const estado = res.body as Estado;
          expect(estado.uf).toEqual(estadoCriadoUf);
        });
    });

    it('deve retornar 404 para uma UF inexistente', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/estados/uf/XX')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
