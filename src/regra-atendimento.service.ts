import * as path from 'path';
import  * as moment from 'moment';
import {Injectable, Logger} from '@nestjs/common';
import {RegraAtendimento} from './regra-atendimento.model';
import {appendFile, readFile, truncate} from 'fs-extra';
import {check, lock, unlock} from 'proper-lockfile';
import {Intervalo} from './intervalos-regra-atendimento';
import {Horario} from './horario-regra-atendimento.model';

@Injectable()
export class RegraAtendimentoService {
    private readonly logger = new Logger(RegraAtendimentoService.name);
    private readonly caminhoArquivoBanco = path.resolve(__dirname, 'banco.json');

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
        return check(this.caminhoArquivoBanco).then(async (isLocked) => {
            if (!isLocked) {
                const listaAtendimentos = await this.lerBanco();
                const listaRetorno = new Array<Horario>();

                if (listaAtendimentos) {
                    for (let regraAtendimento of listaAtendimentos) {
                        if (regraAtendimento.tipoRegraAtendimento === 'D') {
                            delete regraAtendimento.horario.diasDisponiveis;
                            listaRetorno.push(regraAtendimento.horario);
                        } else if (regraAtendimento.tipoRegraAtendimento === 'S') {
                            const diaDaSemanaInicio = moment(intervalo.inicio, 'DD-MM-YYYY').isoWeekday();
                            const diaDaSemanaFim = moment(intervalo.fim, 'DD-MM-YYYY').isoWeekday();

                            for (let diaDaSemana of regraAtendimento.horario.diasDisponiveis) {
                                if (diaDaSemana >= diaDaSemanaInicio && diaDaSemana <= diaDaSemanaFim) {
                                    delete regraAtendimento.horario.diasDisponiveis;
                                    listaRetorno.push(regraAtendimento.horario);
                                    break;
                                }
                            }
                        } else if (regraAtendimento.tipoRegraAtendimento === 'U') {
                            if (moment(regraAtendimento.horario.dia, 'DD-MM-YYYY').isBetween(moment(intervalo.inicio, 'DD-MM-YYYY'),
                                moment(intervalo.fim, 'DD-MM-YYYY'), 'days', '[]')) {
                                delete regraAtendimento.horario.diasDisponiveis;
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
            let msg = '';

            if (!regraAtendimento.nomeDaRegra) {
                msg = msg + ' Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem o nome da regra.';
            }

            if (!regraAtendimento.tipoRegraAtendimento) {
                msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem o tipo de atendimento.';
            }

            if (regraAtendimento.tipoRegraAtendimento !== 'U' && regraAtendimento.tipoRegraAtendimento !== 'D' &&
                regraAtendimento.tipoRegraAtendimento !== 'S') {
                msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o tipo de atendimento inválido.';
            }

            if (!regraAtendimento.horario) {
                msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem horário.';
            }

            if (regraAtendimento.tipoRegraAtendimento === 'U' && !regraAtendimento.horario.dia) {
                msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento para um dia específico sem o dia.';
            }

            if (regraAtendimento.tipoRegraAtendimento === 'U' && !moment(regraAtendimento.horario.dia, 'DD-MM-YYYY').isValid()) {
                msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com a data do dia inválida.';
            }

            if (regraAtendimento.tipoRegraAtendimento === 'S' && regraAtendimento.horario.diasDisponiveis.length < 1) {
                msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento semanal sem os dias da semana.';
            }

            if (regraAtendimento.tipoRegraAtendimento === 'S' && regraAtendimento.horario.diasDisponiveis.length > 1) {
                for (let diaDisponivel of regraAtendimento.horario.diasDisponiveis) {
                    if (!Number.isInteger(diaDisponivel) || diaDisponivel < 1 || diaDisponivel > 7) {
                        msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento dia da semana disponivel inválido.';
                    }
                }
            }

            if (regraAtendimento.horario.intervalos.length < 1) {
                msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem intervalos.';
            } else {
                for (let intervalo of regraAtendimento.horario.intervalos) {
                    if (!intervalo.inicio || !intervalo.fim) {
                        msg = msg + 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com intervalo sem horário de início ou fim.';
                        break;
                    }
                }
            }

            if (!msg) {
                const listaAtendimentos = await this.lerBanco();

                this.adicionaIdNovaRegraAtendimento(regraAtendimento, listaAtendimentos);

                listaAtendimentos.push(regraAtendimento);

                this.escreveNoBanco(listaAtendimentos);
                msg = 'Regra de atendimento salva com sucesso. Atendimento: ' + JSON.stringify(regraAtendimento);
            }

            await unlock(this.caminhoArquivoBanco);
            return msg;
        });
    }

    async delete(atendimento: RegraAtendimento) {
        return lock(this.caminhoArquivoBanco).then(async () => {
            let msg;
            let listaAtendimentos = await this.lerBanco();

            if (atendimento.id) {
                listaAtendimentos = listaAtendimentos.filter(atd => atd.id !== atendimento.id);
                msg = 'Atendimento removido por id com sucesso. Atendimento: ' + JSON.stringify(atendimento);
            } else if (atendimento.nomeDaRegra) {
                listaAtendimentos = listaAtendimentos.filter(atd => atd.nomeDaRegra !== atendimento.nomeDaRegra);
                msg = 'Atendimento removido por nomdeDaRegra com sucesso. Atendimento: ' + JSON.stringify(atendimento);
            } else {
                msg = 'Não foi possível remover o atendimento passado. Tem certeza que o id ou o nome da regra estão corretos? Atendimento: ' + JSON.stringify(atendimento);
            }

            await this.escreveNoBanco(listaAtendimentos);
            await unlock(this.caminhoArquivoBanco);

            return msg;
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