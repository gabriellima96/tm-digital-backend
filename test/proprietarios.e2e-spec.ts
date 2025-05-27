import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Proprietario } from './../src/proprietarios/entities/proprietario.entity';
import { Repository } from 'typeorm';
import { CreateProprietarioDto } from './../src/proprietarios/dto/create-proprietario.dto';
import { UpdateProprietarioDto } from './../src/proprietarios/dto/update-proprietario.dto';
import { v4 as uuidv4 } from 'uuid';
import * as http from 'http';

// Função auxiliar para gerar CPF formatado aleatório para testes
const gerarCpfTeste = (): string => {
  const n = () => Math.floor(Math.random() * 9);
  return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
};

describe('ProprietariosController (E2E)', () => {
  let app: INestApplication;
  let proprietarioRepository: Repository<Proprietario>;

  const proprietarioExemplo: CreateProprietarioDto = {
    nome: 'João da Silva Teste',
    cpf: gerarCpfTeste(),
    pontuacaoCredito: 75,
  };

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

    proprietarioRepository = moduleFixture.get<Repository<Proprietario>>(
      getRepositoryToken(Proprietario),
    );
  });

  beforeEach(async () => {
    // Limpa a tabela antes de cada teste
    await proprietarioRepository.query('DELETE FROM "proprietarios";');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/proprietarios (POST)', () => {
    it('deve criar um proprietário com sucesso', async () => {
      const cpfUnico = gerarCpfTeste();
      const dto: CreateProprietarioDto = { ...proprietarioExemplo, cpf: cpfUnico };
      const response = await request(app.getHttpServer() as http.Server)
        .post('/proprietarios')
        .send(dto)
        .expect(HttpStatus.CREATED);

      const proprietario = response.body as Proprietario;
      expect(proprietario.id).toBeDefined();
      expect(proprietario.nome).toEqual(dto.nome);
      expect(proprietario.cpf).toEqual(dto.cpf);
      expect(proprietario.pontuacaoCredito).toEqual(dto.pontuacaoCredito);
    });

    it('não deve criar um proprietário com CPF duplicado', async () => {
      const cpfUnico = gerarCpfTeste();
      const dto: CreateProprietarioDto = { ...proprietarioExemplo, cpf: cpfUnico };
      await request(app.getHttpServer() as http.Server) // Cria o primeiro
        .post('/proprietarios')
        .send(dto)
        .expect(HttpStatus.CREATED);

      await request(app.getHttpServer() as http.Server) // Tenta criar o segundo com mesmo CPF
        .post('/proprietarios')
        .send({ ...dto, nome: 'Outro Nome Teste' })
        .expect(HttpStatus.CONFLICT);
    });

    it('não deve criar um proprietário com CPF inválido', () => {
      const dto: CreateProprietarioDto = { ...proprietarioExemplo, cpf: '123' };
      return request(app.getHttpServer() as http.Server)
        .post('/proprietarios')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('não deve criar um proprietário com pontuacaoCredito fora do range', () => {
      const dto: CreateProprietarioDto = { ...proprietarioExemplo, pontuacaoCredito: 101 };
      return request(app.getHttpServer() as http.Server)
        .post('/proprietarios')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/proprietarios (GET)', () => {
    it('deve retornar uma lista de proprietários', async () => {
      // Cria um proprietário primeiro
      const cpfUnico = gerarCpfTeste();
      await proprietarioRepository.save(
        proprietarioRepository.create({ ...proprietarioExemplo, cpf: cpfUnico }),
      );

      const response = await request(app.getHttpServer() as http.Server)
        .get('/proprietarios')
        .expect(HttpStatus.OK);

      const proprietarios = response.body as Array<Proprietario>;
      expect(proprietarios).toBeInstanceOf(Array);
      expect(proprietarios.length).toBeGreaterThan(0);
      expect(proprietarios[0].cpf).toEqual(cpfUnico);
    });

    it('deve retornar uma lista vazia se não houver proprietários', async () => {
      const response = await request(app.getHttpServer() as http.Server)
        .get('/proprietarios')
        .expect(HttpStatus.OK);

      const proprietarios = response.body as Array<Proprietario>;
      expect(proprietarios).toBeInstanceOf(Array);
      expect(proprietarios.length).toEqual(0);
    });
  });

  describe('/proprietarios/:id (GET)', () => {
    let idValido: string;

    beforeEach(async () => {
      // Cria um proprietário específico para estes testes
      const novoProprietario = await proprietarioRepository.save(
        proprietarioRepository.create({ ...proprietarioExemplo, cpf: gerarCpfTeste() }),
      );
      idValido = novoProprietario.id;
    });

    it('deve retornar um proprietário específico pelo ID', () => {
      return request(app.getHttpServer() as http.Server)
        .get(`/proprietarios/${idValido}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const proprietario = res.body as Proprietario;
          expect(proprietario.id).toEqual(idValido);
          expect(proprietario.nome).toEqual(proprietarioExemplo.nome);
        });
    });

    it('deve retornar 404 para um ID inexistente', () => {
      const idInexistente = uuidv4();
      return request(app.getHttpServer() as http.Server)
        .get(`/proprietarios/${idInexistente}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('deve retornar 400 para um ID inválido (não UUID)', () => {
      return request(app.getHttpServer() as http.Server)
        .get('/proprietarios/id-invalido')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('/proprietarios/cpf/:cpf (GET)', () => {
    let cpfValido: string;

    beforeEach(async () => {
      cpfValido = gerarCpfTeste();
      await proprietarioRepository.save(
        proprietarioRepository.create({ ...proprietarioExemplo, cpf: cpfValido }),
      );
    });

    it('deve retornar um proprietário específico pelo CPF', () => {
      return request(app.getHttpServer() as http.Server)
        .get(`/proprietarios/cpf/${cpfValido}`)
        .expect(HttpStatus.OK)
        .expect((res) => {
          const proprietario = res.body as Proprietario;
          expect(proprietario.cpf).toEqual(cpfValido);
        });
    });

    it('deve retornar 404 para um CPF inexistente', () => {
      const cpfInexistente = gerarCpfTeste();
      return request(app.getHttpServer() as http.Server)
        .get(`/proprietarios/cpf/${cpfInexistente}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/proprietarios/:id (PATCH)', () => {
    it('deve atualizar o nome de um proprietário', async () => {
      const responseProprietarioCriado = await request(app.getHttpServer() as http.Server)
        .post('/proprietarios')
        .send({ ...proprietarioExemplo, cpf: gerarCpfTeste() })
        .expect(HttpStatus.CREATED);

      const dtoAtualizacao: UpdateProprietarioDto = { nome: 'Nome Atualizado Teste' };
      const response = await request(app.getHttpServer() as http.Server)
        .patch(`/proprietarios/${(responseProprietarioCriado.body as Proprietario).id}`)
        .send(dtoAtualizacao)
        .expect(HttpStatus.OK);
      const proprietarioAtualizado = response.body as Proprietario;
      expect(proprietarioAtualizado.nome).toEqual(dtoAtualizacao.nome);
    });

    it('não deve atualizar para um CPF que já existe em outro proprietário', async () => {
      const cpfExistente = gerarCpfTeste();
      const response = await request(app.getHttpServer() as http.Server)
        .post('/proprietarios')
        .send({ ...proprietarioExemplo, cpf: cpfExistente })
        .expect(HttpStatus.CREATED);

      const cpfExistenteDois = gerarCpfTeste();
      await request(app.getHttpServer() as http.Server)
        .post('/proprietarios')
        .send({ ...proprietarioExemplo, cpf: cpfExistenteDois })
        .expect(HttpStatus.CREATED);

      const dtoAtualizacao: UpdateProprietarioDto = { cpf: cpfExistenteDois };
      await request(app.getHttpServer() as http.Server)
        .patch(`/proprietarios/${(response.body as Proprietario).id}`)
        .send(dtoAtualizacao)
        .expect(HttpStatus.CONFLICT);
    });

    it('deve retornar 404 ao tentar atualizar um proprietário inexistente', () => {
      const idInexistente = uuidv4();
      const dtoAtualizacao: UpdateProprietarioDto = { nome: 'Nome Fantasma' };
      return request(app.getHttpServer() as http.Server)
        .patch(`/proprietarios/${idInexistente}`)
        .send(dtoAtualizacao)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/proprietarios/:id (DELETE)', () => {
    let idParaDeletar: string;

    beforeEach(async () => {
      const proprietario = await proprietarioRepository.save(
        proprietarioRepository.create({ ...proprietarioExemplo, cpf: gerarCpfTeste() }),
      );
      idParaDeletar = proprietario.id;
    });

    it('deve deletar um proprietário com sucesso', async () => {
      await request(app.getHttpServer() as http.Server)
        .delete(`/proprietarios/${idParaDeletar}`)
        .expect(HttpStatus.NO_CONTENT);
    });

    it('deve retornar 404 ao tentar deletar um proprietário inexistente', () => {
      const idInexistente = uuidv4();
      return request(app.getHttpServer() as http.Server)
        .delete(`/proprietarios/${idInexistente}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('deve retornar 400 ao tentar deletar com ID inválido', () => {
      return request(app.getHttpServer() as http.Server)
        .delete('/proprietarios/id-invalido')
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
