import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Estado } from './../src/estados/entities/estado.entity';
import { Municipio } from './../src/municipios/entities/municipio.entity';
import { Proprietario } from './../src/proprietarios/entities/proprietario.entity';
import { Cultura } from './../src/culturas/entities/cultura.entity';
import { PropriedadeRural } from './../src/propriedades-rurais/entities/propriedade-rural.entity';

import { CreatePropriedadeRuralDto } from './../src/propriedades-rurais/dto/create-propriedade-rural.dto';
import { UpdatePropriedadeRuralDto } from './../src/propriedades-rurais/dto/update-propriedade-rural.dto';

import * as http from 'http';

// Função auxiliar para gerar CPF formatado aleatório para testes
const gerarCpfTeste = (): string => {
  const n = () => Math.floor(Math.random() * 9);
  return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
};

describe('PropriedadesRuraisController (E2E)', () => {
  let app: INestApplication;
  let estadoRepository: Repository<Estado>;
  let municipioRepository: Repository<Municipio>;
  let proprietarioRepository: Repository<Proprietario>;
  let culturaRepository: Repository<Cultura>;
  let propriedadeRuralRepository: Repository<PropriedadeRural>;

  let estadoTeste: Estado;
  let municipioTeste: Municipio;
  let proprietarioTeste1: Proprietario;
  let proprietarioTeste2: Proprietario;
  let culturaTeste1: Cultura;
  let culturaTeste2: Cultura;

  const exemploPoligono = {
    type: 'Polygon',
    coordinates: [
      [
        [-43.18, -22.9],
        [-43.17, -22.9],
        [-43.17, -22.89],
        [-43.18, -22.89],
        [-43.18, -22.9],
      ],
    ],
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
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    estadoRepository = moduleFixture.get<Repository<Estado>>(getRepositoryToken(Estado));
    municipioRepository = moduleFixture.get<Repository<Municipio>>(getRepositoryToken(Municipio));
    proprietarioRepository = moduleFixture.get<Repository<Proprietario>>(
      getRepositoryToken(Proprietario),
    );
    culturaRepository = moduleFixture.get<Repository<Cultura>>(getRepositoryToken(Cultura));
    propriedadeRuralRepository = moduleFixture.get<Repository<PropriedadeRural>>(
      getRepositoryToken(PropriedadeRural),
    );
  });

  beforeEach(async () => {
    await propriedadeRuralRepository.query('DELETE FROM "propriedade_cultura";');
    await propriedadeRuralRepository.query('DELETE FROM "propriedade_proprietario";');
    await propriedadeRuralRepository.query('DELETE FROM "propriedades_rurais";');
    await proprietarioRepository.query('DELETE FROM "proprietarios";');
    await culturaRepository.query('DELETE FROM "culturas";');
    await municipioRepository.query('DELETE FROM "municipios";');
    await estadoRepository.query('DELETE FROM "estados";');

    // Criar base para testes
    estadoTeste = await estadoRepository.save(
      estadoRepository.create({ nome: 'Estado Teste PR', uf: 'XT' }),
    );
    municipioTeste = await municipioRepository.save(
      municipioRepository.create({ nome: 'Municipio Teste PR', estado: estadoTeste }),
    );
    proprietarioTeste1 = await proprietarioRepository.save(
      proprietarioRepository.create({
        nome: 'Proprietario Teste 1',
        cpf: gerarCpfTeste(),
        pontuacaoCredito: 80,
      }),
    );
    proprietarioTeste2 = await proprietarioRepository.save(
      proprietarioRepository.create({
        nome: 'Proprietario Teste 2',
        cpf: gerarCpfTeste(),
        pontuacaoCredito: 90,
      }),
    );
    culturaTeste1 = await culturaRepository.save(
      culturaRepository.create({ nome: 'Cultura Teste A' }),
    );
    culturaTeste2 = await culturaRepository.save(
      culturaRepository.create({ nome: 'Cultura Teste B' }),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /propriedades-rurais', () => {
    it('deve criar uma propriedade rural com sucesso e associações', async () => {
      const dto: CreatePropriedadeRuralDto = {
        nomeFazenda: 'Fazenda Nova Esperança',
        poligono: exemploPoligono,
        areaEmHectares: 250.5,
        idMunicipio: municipioTeste.id,
        indiceProdutividade: 92.3,
        idsProprietarios: [proprietarioTeste1.id, proprietarioTeste2.id],
        idsCulturas: [culturaTeste1.id],
      };

      const response = await request(app.getHttpServer() as http.Server)
        .post('/propriedades-rurais')
        .send(dto)
        .expect(HttpStatus.CREATED);

      const propriedadeRural = response.body as PropriedadeRural;
      expect(propriedadeRural.id).toBeDefined();
      expect(propriedadeRural.nomeFazenda).toEqual(dto.nomeFazenda);
      expect(propriedadeRural.areaEmHectares).toEqual(dto.areaEmHectares);

      // Buscar a propriedade para comparar relações
      const propriedadeSalva = await propriedadeRuralRepository.findOne({
        where: { id: propriedadeRural.id },
        relations: ['municipio', 'proprietarios', 'culturas'],
      });
      expect(propriedadeSalva?.municipio.id).toEqual(municipioTeste.id);
      expect(propriedadeSalva?.proprietarios.length).toEqual(2);
      expect(propriedadeSalva?.proprietarios.map((p) => p.id).sort()).toEqual(
        [proprietarioTeste1.id, proprietarioTeste2.id].sort(),
      );
      expect(propriedadeSalva?.culturas.length).toEqual(1);
      expect(propriedadeSalva?.culturas[0].id).toEqual(culturaTeste1.id);
    });

    it('não deve criar com idMunicipio inexistente', async () => {
      const dto: CreatePropriedadeRuralDto = {
        areaEmHectares: 100,
        idMunicipio: uuidv4(), // ID inexistente de municipio
        idsProprietarios: [proprietarioTeste1.id],
      };
      await request(app.getHttpServer() as http.Server)
        .post('/propriedades-rurais')
        .send(dto)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('não deve criar com um idProprietario inexistente', async () => {
      const dto: CreatePropriedadeRuralDto = {
        areaEmHectares: 100,
        idMunicipio: municipioTeste.id,
        idsProprietarios: [uuidv4()], // ID inexistente de proprietarios
      };
      await request(app.getHttpServer() as http.Server)
        .post('/propriedades-rurais')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /propriedades-rurais', () => {
    it('deve retornar uma lista de propriedades rurais', async () => {
      await propriedadeRuralRepository.save(
        propriedadeRuralRepository.create({
          nomeFazenda: 'Fazenda Teste Get',
          areaEmHectares: 120,
          municipio: municipioTeste,
          proprietarios: [proprietarioTeste1],
          culturas: [culturaTeste1],
          poligono: exemploPoligono,
        }),
      );

      const response = await request(app.getHttpServer() as http.Server)
        .get('/propriedades-rurais')
        .expect(HttpStatus.OK);

      const propriedadesRurais = response.body as Array<PropriedadeRural>;
      expect(propriedadesRurais).toBeInstanceOf(Array);
      expect(propriedadesRurais.length).toBeGreaterThanOrEqual(1);
      expect(propriedadesRurais[0].nomeFazenda).toEqual('Fazenda Teste Get');
      expect(propriedadesRurais[0].proprietarios.length).toEqual(1);
      expect(propriedadesRurais[0].culturas.length).toEqual(1);
    });
  });

  describe('GET /propriedades-rurais/:id', () => {
    let propriedadeExistente: PropriedadeRural;

    beforeEach(async () => {
      propriedadeExistente = await propriedadeRuralRepository.save(
        propriedadeRuralRepository.create({
          nomeFazenda: 'Fazenda Detalhe',
          areaEmHectares: 150,
          municipio: municipioTeste,
          proprietarios: [proprietarioTeste1],
          culturas: [culturaTeste1, culturaTeste2],
          poligono: exemploPoligono,
          indiceProdutividade: 77,
        }),
      );
    });

    it('deve retornar uma propriedade rural específica pelo ID', async () => {
      const response = await request(app.getHttpServer() as http.Server)
        .get(`/propriedades-rurais/${propriedadeExistente.id}`)
        .expect(HttpStatus.OK);

      const propriedadeRural = response.body as PropriedadeRural;
      expect(propriedadeRural.id).toEqual(propriedadeExistente.id);
      expect(propriedadeRural.nomeFazenda).toEqual('Fazenda Detalhe');
      expect(propriedadeRural.proprietarios.length).toEqual(1);
      expect(propriedadeRural.culturas.length).toEqual(2);
      expect(propriedadeRural.municipio.id).toEqual(municipioTeste.id);
    });

    it('deve retornar 404 para um ID inexistente', () => {
      return request(app.getHttpServer() as http.Server)
        .get(`/propriedades-rurais/${uuidv4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /propriedades-rurais/:id', () => {
    let propriedadeParaAtualizar: PropriedadeRural;

    beforeEach(async () => {
      propriedadeParaAtualizar = await propriedadeRuralRepository.save(
        propriedadeRuralRepository.create({
          nomeFazenda: 'Fazenda Antiga',
          areaEmHectares: 200,
          municipio: municipioTeste,
          proprietarios: [proprietarioTeste1],
          culturas: [culturaTeste1],
        }),
      );
    });

    it('deve atualizar o nomeFazenda de uma propriedade rural', async () => {
      const dto: UpdatePropriedadeRuralDto = { nomeFazenda: 'Fazenda Renovada' };
      const response = await request(app.getHttpServer() as http.Server)
        .patch(`/propriedades-rurais/${propriedadeParaAtualizar.id}`)
        .send(dto)
        .expect(HttpStatus.OK);

      const propriedadeRuralUpdate = response.body as PropriedadeRural;
      expect(propriedadeRuralUpdate.nomeFazenda).toEqual('Fazenda Renovada');
    });

    it('deve atualizar os proprietários de uma propriedade rural (substituição completa)', async () => {
      const dto: UpdatePropriedadeRuralDto = { idsProprietarios: [proprietarioTeste2.id] };
      await request(app.getHttpServer() as http.Server)
        .patch(`/propriedades-rurais/${propriedadeParaAtualizar.id}`)
        .send(dto)
        .expect(HttpStatus.OK);

      // Verifica se a relação foi atualizada no banco
      const propriedadeAtualizada = await propriedadeRuralRepository.findOneOrFail({
        where: { id: propriedadeParaAtualizar.id },
        relations: ['proprietarios'],
      });
      expect(propriedadeAtualizada.proprietarios.length).toEqual(1);
      expect(propriedadeAtualizada.proprietarios[0].id).toEqual(proprietarioTeste2.id);
    });
  });

  describe('DELETE /propriedades-rurais/:id', () => {
    let idParaDeletar: string;

    beforeEach(async () => {
      const propriedade = await propriedadeRuralRepository.save(
        propriedadeRuralRepository.create({
          nomeFazenda: 'Fazenda a Deletar',
          areaEmHectares: 50,
          municipio: municipioTeste,
        }),
      );
      idParaDeletar = propriedade.id;
    });

    it('deve deletar uma propriedade rural com sucesso', async () => {
      await request(app.getHttpServer() as http.Server)
        .delete(`/propriedades-rurais/${idParaDeletar}`)
        .expect(HttpStatus.NO_CONTENT);

      const resultado = await propriedadeRuralRepository.findOneBy({ id: idParaDeletar });
      expect(resultado).toBeNull();
    });

    it('deve retornar 404 ao tentar deletar uma propriedade rural inexistente', () => {
      return request(app.getHttpServer() as http.Server)
        .delete(`/propriedades-rurais/${uuidv4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
