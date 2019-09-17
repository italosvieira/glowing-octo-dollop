import * as path from 'path';
import * as moment from 'moment';
import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {RegraAtendimento} from './regra-atendimento.model';
import {appendFile, readFile, truncate} from 'fs-extra';
import {check, lock, unlock} from 'proper-lockfile';
import {Intervalo} from './intervalos-regra-atendimento';
import {Horario} from './horario-regra-atendimento.model';

@Injectable()
export class RegraAtendimentoService {
    private readonly logger = new Logger(RegraAtendimentoService.name);
    readonly caminhoArquivoBanco = path.resolve(__dirname, 'banco.json');

    async findAll() {
        return check(this.caminhoArquivoBanco).then((isLocked) => {
            if (!isLocked) {
                return this.lerBanco();
            } else {
                return new Array<RegraAtendimento>();
            }
        });
    }

    async findByIntervalo(intervalo: Intervalo) {
        const dataInicio = moment(intervalo.inicio, 'DD-MM-YYYY');
        const dataFim = moment(intervalo.fim, 'DD-MM-YYYY');

        if (!dataInicio.isValid() || !dataFim.isValid()) {
            this.logger.error('Erro ao consultar horários por intervalo. Data de início ou Data de fim inválidos.');
            throw new HttpException('Erro ao consultar horários por intervalo. Data de início ou Data de fim inválidos.', HttpStatus.BAD_REQUEST);
        }

        if (dataFim.isBefore(dataInicio)) {
            this.logger.error('Erro ao consultar horários por intervalo. Data de fim não pode vir antes da data de início.');
            throw new HttpException('Erro ao consultar horários por intervalo. Data de fim não pode vir antes da data de início.', HttpStatus.BAD_REQUEST);
        }

        return check(this.caminhoArquivoBanco).then(async (isLocked) => {
            if (!isLocked) {
                const listaAtendimentos = await this.lerBanco();
                const listaRetorno = new Array<Horario>();

                if (listaAtendimentos) {
                    for (const regraAtendimento of listaAtendimentos) {
                        if (regraAtendimento.tipoRegraAtendimento === 'D') {
                            delete regraAtendimento.horario.diasDisponiveis;
                            delete regraAtendimento.horario.dia;
                            listaRetorno.push(regraAtendimento.horario);
                        } else if (regraAtendimento.tipoRegraAtendimento === 'S') {
                            const diaDaSemanaInicio = moment(intervalo.inicio, 'DD-MM-YYYY');
                            const diaDaSemanaFim = moment(intervalo.fim, 'DD-MM-YYYY');

                            while (diaDaSemanaInicio.isSameOrBefore(diaDaSemanaFim)) {
                                if (regraAtendimento.horario.diasDisponiveis.includes(diaDaSemanaInicio.isoWeekday())) {
                                    delete regraAtendimento.horario.diasDisponiveis;
                                    delete regraAtendimento.horario.dia;
                                    listaRetorno.push(regraAtendimento.horario);
                                    break;
                                }

                                diaDaSemanaInicio.add(1, 'day');
                            }
                        } else if (regraAtendimento.tipoRegraAtendimento === 'U') {
                            if (moment(regraAtendimento.horario.dia, 'DD-MM-YYYY').isBetween(moment(intervalo.inicio, 'DD-MM-YYYY'),
                                moment(intervalo.fim, 'DD-MM-YYYY'), 'days', '[]')) {
                                delete regraAtendimento.horario.diasDisponiveis;
                                delete regraAtendimento.horario.dia;
                                listaRetorno.push(regraAtendimento.horario);
                            }
                        }
                    }
                }

                return listaRetorno;
            } else {
                return new Array<RegraAtendimento>();
            }
        });
    }

    async save(regraAtendimento: RegraAtendimento) {
        return lock(this.caminhoArquivoBanco).then(async () => {
            if (!regraAtendimento.nomeDaRegra) {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem o nome da regra.', HttpStatus.BAD_REQUEST);
            }

            if (!regraAtendimento.tipoRegraAtendimento) {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem o tipo de atendimento.', HttpStatus.BAD_REQUEST);
            }

            if (regraAtendimento.tipoRegraAtendimento !== 'U' && regraAtendimento.tipoRegraAtendimento !== 'D' &&
                regraAtendimento.tipoRegraAtendimento !== 'S') {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o tipo de atendimento inválido.', HttpStatus.BAD_REQUEST);
            }

            if (!regraAtendimento.horario) {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem horário.', HttpStatus.BAD_REQUEST);
            }

            if (regraAtendimento.tipoRegraAtendimento === 'U' && !regraAtendimento.horario.dia) {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento para um dia específico sem o dia.', HttpStatus.BAD_REQUEST);
            }

            if (regraAtendimento.tipoRegraAtendimento === 'U' && !moment(regraAtendimento.horario.dia, 'DD-MM-YYYY').isValid()) {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com a data do dia inválida.', HttpStatus.BAD_REQUEST);
            }

            if (regraAtendimento.tipoRegraAtendimento === 'S' && (!regraAtendimento.horario.diasDisponiveis || regraAtendimento.horario.diasDisponiveis.length < 1)) {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento semanal sem os dias da semana.', HttpStatus.BAD_REQUEST);
            }

            if (regraAtendimento.tipoRegraAtendimento === 'S') {
                for (const diaDisponivel of regraAtendimento.horario.diasDisponiveis) {
                    if (!Number.isInteger(diaDisponivel) || diaDisponivel < 1 || diaDisponivel > 7) {
                        throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento dia da semana disponivel inválido.', HttpStatus.BAD_REQUEST);
                    }
                }
            }

            if (!regraAtendimento.horario.intervalos || regraAtendimento.horario.intervalos.length < 1) {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem intervalos.', HttpStatus.BAD_REQUEST);
            } else {
                for (const intervalo of regraAtendimento.horario.intervalos) {
                    if (!intervalo.inicio || !intervalo.fim) {
                        throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com intervalo sem horário de início ou fim.', HttpStatus.BAD_REQUEST);
                    }

                    const horaInicio = moment(intervalo.inicio, 'HH:mm');
                    const horaFim = moment(intervalo.fim, 'HH:mm');

                    if (!horaInicio.isValid() || !horaFim.isValid()) {
                        throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o horário de inicio ou fim inválidos.', HttpStatus.BAD_REQUEST);
                    }

                    if (horaFim.isBefore(horaInicio)) {
                        throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o horário de inicio maior que o horário do fim.', HttpStatus.BAD_REQUEST);
                    }

                    if (horaInicio.isSame(horaFim)) {
                        throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o horário de inicio igual ao horário do fim.', HttpStatus.BAD_REQUEST);
                    }
                }
            }

            if (regraAtendimento.tipoRegraAtendimento === 'D') {
                regraAtendimento.horario.disponibilidade = 'Disponivel Todos os Dias.';
            } else if (regraAtendimento.tipoRegraAtendimento === 'U') {
                regraAtendimento.horario.disponibilidade = 'Disponivel Dia: ' + regraAtendimento.horario.dia;
            } else {
                let disponibilidade = 'Disponivel todas as semanas nos dias:';

                for (const dia of regraAtendimento.horario.diasDisponiveis) {
                    if (dia === 1) {
                        disponibilidade = disponibilidade + ' Segunda-feira';
                    } else if (dia === 2) {
                        disponibilidade = disponibilidade + ' Terça-feira';
                    } else if (dia === 3) {
                        disponibilidade = disponibilidade + ' Quarta-feira';
                    } else if (dia === 4) {
                        disponibilidade = disponibilidade + ' Quinta-feira';
                    } else if (dia === 5) {
                        disponibilidade = disponibilidade + ' Sexta-feira';
                    } else if (dia === 6) {
                        disponibilidade = disponibilidade + ' Sabado';
                    } else if (dia === 7) {
                        disponibilidade = disponibilidade + ' Domingo';
                    }
                }

                regraAtendimento.horario.disponibilidade = disponibilidade;
            }

            const listaAtendimentos = await this.lerBanco();

            const listaRegraNomeDuplicado = listaAtendimentos.filter(regraAtd => regraAtd.nomeDaRegra === regraAtendimento.nomeDaRegra);

            if (listaRegraNomeDuplicado.length > 0) {
                throw new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento pois esse nome de regra já existe.', HttpStatus.BAD_REQUEST);
            }

            this.adicionaIdNovaRegraAtendimento(regraAtendimento, listaAtendimentos);

            listaAtendimentos.push(regraAtendimento);

            this.escreveNoBanco(listaAtendimentos);

            await unlock(this.caminhoArquivoBanco);

            this.logger.log('Regra de atendimento salva com sucesso. Atendimento: ' + JSON.stringify(regraAtendimento));

            return 'Regra de atendimento salva com sucesso. Atendimento: ' + JSON.stringify(regraAtendimento);
        }).catch(async e => {
            await unlock(this.caminhoArquivoBanco);
            this.logger.error((e as Error).message);
            throw e;
        });
    }

    async delete(regraDeAtendimento: RegraAtendimento) {
        return lock(this.caminhoArquivoBanco).then(async () => {
            if (regraDeAtendimento.id) {
                let listaAtendimentos = await this.lerBanco();
                const regraDeAtendimentoParaExcluir = listaAtendimentos.find(atd => atd.id === regraDeAtendimento.id);

                if (regraDeAtendimentoParaExcluir) {
                    listaAtendimentos = listaAtendimentos.filter(atd => atd.id !== regraDeAtendimento.id);
                    await this.escreveNoBanco(listaAtendimentos);
                    await unlock(this.caminhoArquivoBanco);
                    this.logger.log('Regra de atendimento removida pelo id com sucesso. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento));
                    return 'Regra de atendimento removida pelo id com sucesso. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento);
                }

                await unlock(this.caminhoArquivoBanco);
                this.logger.error('Não foi possivel remover regra de atendimento por id. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento));
                return 'Não foi possivel remover regra de atendimento por id. Essa regra não existe. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento);
            } else if (regraDeAtendimento.nomeDaRegra) {
                let listaAtendimentos = await this.lerBanco();
                const regraDeAtendimentoParaExcluir = listaAtendimentos.find(atd => atd.nomeDaRegra === regraDeAtendimento.nomeDaRegra);

                if (regraDeAtendimentoParaExcluir) {
                    listaAtendimentos = listaAtendimentos.filter(atd => atd.nomeDaRegra !== regraDeAtendimento.nomeDaRegra);
                    await this.escreveNoBanco(listaAtendimentos);
                    await unlock(this.caminhoArquivoBanco);
                    this.logger.log('Regra de atendimento removida pelo nome da regra com sucesso. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento));
                    return 'Regra de atendimento removida pelo nome da regra com sucesso. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento);
                }

                await unlock(this.caminhoArquivoBanco);
                this.logger.error('Não foi possivel remover regra de atendimento pelo nome da regra. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento));
                return 'Não foi possivel remover regra de atendimento por pelo nome da regra. Essa regra não existe. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento);
            } else {
                throw new HttpException('Não foi possível remover a regra de atendimento passada. Tem certeza que o id ou o nome da regra estão corretos? Regra de atendimento: ' + JSON.stringify(regraDeAtendimento), HttpStatus.BAD_REQUEST);
            }
        }).catch(async e => {
            await unlock(this.caminhoArquivoBanco);
            this.logger.error((e as Error).message);
            throw e;
        });
    }

    private adicionaIdNovaRegraAtendimento(regraAtendimento: RegraAtendimento, listaAtendimentos: RegraAtendimento[]) {
        if (listaAtendimentos.length < 1) {
            regraAtendimento.id = 1;
        } else {
            const currentMaxId = listaAtendimentos.reduce((prev, current) => (prev.id > current.id) ? prev : current);
            regraAtendimento.id = currentMaxId.id + 1;
        }
    }

    private async lerBanco() {
        return JSON.parse(await readFile(this.caminhoArquivoBanco, 'UTF-8')) as RegraAtendimento[];
    }

    private async escreveNoBanco(listaAtendimentos: RegraAtendimento[]) {
        await truncate(this.caminhoArquivoBanco, 0);
        await appendFile(this.caminhoArquivoBanco, JSON.stringify(listaAtendimentos));
    }
}