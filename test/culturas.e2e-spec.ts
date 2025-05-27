import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cultura } from './../src/culturas/entities/cultura.entity';
import { Repository } from 'typeorm';
import { CreateCulturaDto } from './../src/culturas/dto/create-cultura.dto';
import { v4 as uuidv4 } from 'uuid';
import * as http from 'http';

describe('CulturasController (E2E)', () => {
  let app: INestApplication;
  let culturaRepository: Repository<Cultura>;
  let culturaTesteCriada: Cultura;

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

    culturaRepository = moduleFixture.get<Repository<Cultura>>(getRepositoryToken(Cultura));
  });

  beforeAll(async () => {
    await culturaRepository.query('DELETE FROM "culturas";');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/culturas (POST)', () => {
    it('deve criar uma cultura com sucesso', async () => {
      const dto: CreateCulturaDto = { nome: 'Milho Teste' };
      const response = await request(app.getHttpServer() as http.Server)
        .post('/culturas')
        .send(dto)
        .expect(HttpStatus.CREATED);

      const culturaCriada = response.body as Cultura;
      expect(culturaCriada.id).toBeDefined();
      expect(culturaCriada.nome).toEqual(dto.nome);
      culturaTesteCriada = response.body as Cultura; // Usar para outros testes
    });

    it('não deve criar uma cultura com nome duplicado', async () => {
      const dto: CreateCulturaDto = { nome: culturaTesteCriada.nome };

      await request(app.getHttpServer() as http.Server)
        .post('/culturas')
        .send(dto)
        .expect(HttpStatus.CONFLICT);
    });

    it('não deve criar uma cultura com nome vazio', () => {
      const dto: CreateCulturaDto = { nome: '' };
      return request(app.getHttpServer() as http.Server)
        .post('/culturas')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('não deve criar uma cultura com nome muito curto (ex: < 2 caracteres)', () => {
      const dto: CreateCulturaDto = { nome: 'A' };
      return request(app.getHttpServer() as http.Server)
        .post('/culturas')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/culturas (GET)', () => {
    it('deve retornar uma lista de culturas', async () => {
      const response = await request(app.getHttpServer() as http.Server)
        .get('/culturas')
        .expect(HttpStatus.OK);

      const culturas = response.body as Array<Cultura>;
      expect(culturas).toBeInstanceOf(Array);
      expect(culturas.length).toBeGreaterThan(0);
    });
  });

  describe('/culturas/:id (GET)', () => {
    it('deve retornar uma cultura específica pelo ID', () => {
      return request(app.getHttpServer() as http.Server)
        .get(`/culturas/${culturaTesteCriada.id}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const cultura = res.body as Cultura;
          expect(cultura.id).toEqual(culturaTesteCriada.id);
          expect(cultura.nome).toEqual(culturaTesteCriada.nome);
        });
    });

    it('deve retornar 404 para um ID inexistente', () => {
      const idInexistente = uuidv4();
      return request(app.getHttpServer() as http.Server)
        .get(`/culturas/${idInexistente}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('deve retornar 400 para um ID inválido (não UUID)', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/culturas/id-invalido')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/culturas/nome/:nome (GET)', () => {
    it('deve retornar uma cultura específica pelo nome', () => {
      return request(app.getHttpServer() as http.Server)
        .get(`/culturas/nome/${encodeURIComponent(culturaTesteCriada.nome)}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const cultura = res.body as Cultura;
          expect(cultura.nome).toEqual(culturaTesteCriada.nome);
        });
    });

    it('deve retornar 404 para um nome inexistente', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/culturas/nome/CulturaInexistente')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
