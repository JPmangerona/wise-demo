import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ProcessesRepository } from './processes.repository';
import { ProcessStatus } from './entities/process.entity';
import { ClientEntity } from '../clients/entities/client.entity';

@Injectable()
export class ProcessesService {
  constructor(
    private readonly repository: ProcessesRepository,
    @InjectRepository(ClientEntity)
    private readonly clientRepository: Repository<ClientEntity>,
  ) {}

  create(createProcessDto: CreateProcessDto, user: any) {
    if (createProcessDto.status && createProcessDto.status !== ProcessStatus.ATIVO) {
      throw new BadRequestException('O status inicial de um processo deve ser ATIVO.');
    }
    return this.repository.create(createProcessDto, user.companyId, user.id);
  }

  findAll(user: any) {
    return this.repository.findAll({ companyId: user.companyId });
  }

  async findOne(id: string, user: any) {
    const process = await this.repository.findById(id);
    if (process.companyId !== user.companyId) {
      throw new ForbiddenException('Você não tem permissão para acessar este processo');
    }
    return process;
  }

  async update(id: string, updateProcessDto: UpdateProcessDto, user: any) {
    // Valida se o processo pertence à empresa
    const process = await this.findOne(id, user);

    if (updateProcessDto.status && updateProcessDto.status !== process.status) {
      const newStatus = updateProcessDto.status;
      const currentStatus = process.status;
      let isValidTransition = false;

      if (currentStatus === ProcessStatus.ATIVO) {
        isValidTransition = [
          ProcessStatus.SUSPENSO,
          ProcessStatus.ENCERRADO,
          ProcessStatus.ARQUIVADO,
        ].includes(newStatus);
      } else if (currentStatus === ProcessStatus.SUSPENSO) {
        isValidTransition = [
          ProcessStatus.ATIVO,
          ProcessStatus.ARQUIVADO,
        ].includes(newStatus);
      } else if (currentStatus === ProcessStatus.ENCERRADO) {
        isValidTransition = [
          ProcessStatus.ARQUIVADO,
        ].includes(newStatus);
      } else if (currentStatus === ProcessStatus.ARQUIVADO) {
        isValidTransition = false;
      }

      if (!isValidTransition) {
        throw new BadRequestException(
          `Transição de estado inválida de ${currentStatus} para ${newStatus}.`
        );
      }
    }

    return this.repository.update(id, updateProcessDto);
  }

  async remove(id: string, user: any) {
    // Valida se o processo pertence à empresa
    await this.findOne(id, user);
    return this.repository.remove(id);
  }

  async consultDataJudi(cnj: string) {
    const numeroLimpo = cnj.replace(/\D/g, '');

    if (numeroLimpo.length !== 20) {
      throw new BadRequestException('Número de processo inválido. O CNJ deve conter exatamente 20 dígitos.');
    }

    const j = parseInt(numeroLimpo.substring(13, 14), 10);
    const tr = parseInt(numeroLimpo.substring(14, 16), 10);

    const MAPA_TRIBUNAIS_ESTADUAIS: Record<number, string> = {
      1: 'tjac', 2: 'tjal', 3: 'tjap', 4: 'tjam', 5: 'tjba', 6: 'tjce',
      7: 'tjdft', 8: 'tjes', 9: 'tjgo', 10: 'tjma', 11: 'tjmt', 12: 'tjms',
      13: 'tjmg', 14: 'tjpa', 15: 'tjpb', 16: 'tjpr', 17: 'tjpe', 18: 'tjpi',
      19: 'tjrj', 20: 'tjrn', 21: 'tjrs', 22: 'tjro', 23: 'tjrr', 24: 'tjsc',
      25: 'tjse', 26: 'tjsp', 27: 'tjto'
    };

    let endpointTribunal: string | null = null;
    if (j === 8 && MAPA_TRIBUNAIS_ESTADUAIS[tr]) {
      endpointTribunal = `api_publica_${MAPA_TRIBUNAIS_ESTADUAIS[tr]}`;
    } else if (j === 5) {
      endpointTribunal = `api_publica_trt${tr}`;
    } else if (j === 4) {
      endpointTribunal = `api_publica_trf${tr}`;
    } else if (j === 3) {
      endpointTribunal = 'api_publica_stj';
    } else if (j === 1) {
      endpointTribunal = 'api_publica_stf';
    }

    if (!endpointTribunal) {
      throw new BadRequestException(`Tribunal correspondente ao segmento J=${j} e TR=${tr} não é suportado ou mapeado.`);
    }

    const url = `https://api-publica.datajud.cnj.jus.br/${endpointTribunal}/_search`;
    const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `APIKey ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            match: {
              numeroProcesso: numeroLimpo
            }
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new BadRequestException(`Erro na consulta ao Data Judi: ${errorText}`);
      }

      const data = await response.json();

      const hit = data.hits?.hits?.[0]?._source;
      if (!hit) {
        throw new BadRequestException('Processo não encontrado na base do Data Judi.');
      }

      const movimentacoes = (hit.movimentos || [])
        .map((m: any) => ({
          dataHora: m.dataHora,
          descricao: m.nome || 'Movimentação sem descrição',
          orgaoJulgador: m.orgaoJulgador?.nome || 'Não informado'
        }))
        .sort((a: any, b: any) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());

      return {
        numero: hit.numeroProcesso,
        tribunal: hit.tribunal,
        classe: hit.classe?.nome || 'Não informada',
        assuntos: (hit.assuntos || []).map((a: any) => a.nome),
        movimentacoes
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Falha ao se comunicar com a API do Data Judi: ${error.message}`);
    }
  }

  async consultInfosimples(cnj: string) {
    const token = process.env.INFOSIMPLES_TOKEN;
    if (!token) {
      throw new BadRequestException('Token da Infosimples não configurado no arquivo .env.');
    }

    const numeroLimpo = cnj.replace(/\D/g, '');

    if (numeroLimpo.length !== 20) {
      throw new BadRequestException('Número de processo inválido. O CNJ deve conter exatamente 20 dígitos.');
    }

    const j = parseInt(numeroLimpo.substring(13, 14), 10);
    const tr = parseInt(numeroLimpo.substring(14, 16), 10);

    if (j === 4 && tr === 4) {
      throw new BadRequestException('A Infosimples não suporta a consulta de processos do TRF4. Por favor, utilize o botão "Sincronizar via DataJud" para este processo.');
    }
    if (j === 5) {
      throw new BadRequestException('A Infosimples não suporta a consulta de processos da Justiça do Trabalho (TRT). Por favor, utilize o botão "Sincronizar via DataJud" para este processo.');
    }

    let tribunalSigla = 'tjpr/processo';
    
    if (j === 8) {
      const MAPA_TRIBUNAIS: Record<number, string> = {
        19: 'tjrj/processo',
        26: numeroLimpo.endsWith('0000') ? 'tjsp/segundo-grau' : 'tjsp/primeiro-grau',
        16: 'tjpr/processo',
        12: 'tjms/processo',
        13: 'tjmg/processo',
        21: 'tjrs/processo',
        24: 'tjsc/processo',
      };
      
      const sigla = MAPA_TRIBUNAIS[tr];
      if (sigla) {
        tribunalSigla = sigla;
      } else {
        tribunalSigla = `tj${String(tr).padStart(2, '0')}/processo`;
      }
    }

    isProjudi = tribunalSigla.includes('projudi');
    const isTjsp = tribunalSigla.startsWith('tjsp');
    
    const url = isTjsp || tribunalSigla.includes('/')
      ? `https://api.infosimples.com/api/v2/consultas/tribunal/${tribunalSigla}`
      : `https://api.infosimples.com/api/v2/consultas/tribunal/${tribunalSigla}/processo`;

    const bodyParams: Record<string, string> = {
      token: token,
      ignore_cache: 'true',
    };

    if (isTjsp) {
      bodyParams.processo = cnj;
    } else {
      bodyParams.numero_processo = cnj;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(bodyParams),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new BadRequestException(`Erro ao chamar Infosimples (${response.status}): ${errorText}`);
      }

      const body = await response.json();

      if (body.code !== 200) {
        throw new BadRequestException(`Infosimples retornou erro: ${body.code_message || 'Erro desconhecido'}`);
      }

      const processoData = body.data?.[0]?.processos?.[0];
      if (!processoData) {
        throw new BadRequestException('Nenhum processo encontrado para este número na Infosimples.');
      }

      const rawMovs = isTjsp
        ? (processoData.ultimas_movimentacoes || [])
        : (processoData.movimentacoes || []);

      const mappedMovs = rawMovs.map((m: any) => ({
        sequencial: m.seq || undefined,
        data: m.data,
        descricao: isTjsp ? m.movimento : m.evento,
        movimentador: m.movimentador || 'Não informado',
      }));

      return {
        numero: cnj,
        tribunal: tribunalSigla.toUpperCase(),
        comarca: body.data[0].nome_comarca || body.data[0].foro || '',
        juizo: body.data[0].nome_juizo || body.data[0].vara || '',
        classe: processoData.classe_processual || processoData.classe || '',
        assunto: processoData.assunto_principal || processoData.assunto || '',
        juiz: processoData.juiz || '',
        partes: processoData.partes || { autor: [], réu: [] },
        movimentacoes: mappedMovs,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Falha de comunicação com a Infosimples: ${error.message}`);
    }
  }

  async getProcessGroups(user: any) {
    const processes = await this.repository.findAll({ companyId: user.companyId });
    const processIds = processes.map(p => p.id);
    const movements = await this.repository.findMovementsByProcessIds(processIds);

    // Buscar clientes para mapear nomes
    const clients = await this.clientRepository.find({ where: { companyId: user.companyId } });
    const clientMap = new Map(clients.map(c => [c.id, c.name]));

    const movementsMap: Record<string, any[]> = {};
    for (const m of movements) {
      if (!movementsMap[m.processId]) {
        movementsMap[m.processId] = [];
      }
      movementsMap[m.processId].push({
        id: m.id,
        processId: m.processId,
        date: m.date,
        origin: m.origin,
        description: m.description,
        status: m.status,
      });
    }

    return processes.map(p => ({
      id: p.id,
      processName: p.title || p.cnj || 'Sem Título',
      clientName: p.clientId ? (clientMap.get(p.clientId) || '-') : '-',
      adverseParty: p.adverseParty || '-',
      courtCity: `${p.tribunal || '-'} - ${p.vara || '-'}`,
      movements: movementsMap[p.id] || [],
    }));
  }

  async addMovement(processId: string, dto: any, user: any) {
    return this.repository.createMovement({
      processId,
      date: dto.date,
      origin: dto.origin,
      description: dto.description,
      status: dto.status || 'PENDING',
    }, user.companyId);
  }

  async validateMovement(id: string, user: any) {
    return this.repository.validateMovement(id);
  }

  async validateMovements(dto: { ids: string[] }, user: any) {
    await this.repository.validateMovements(dto.ids);
    return { success: true };
  }

  async removeMovement(id: string, user: any) {
    await this.repository.removeMovement(id);
    return { success: true };
  }
}
