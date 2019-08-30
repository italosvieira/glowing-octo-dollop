import {Injectable, Logger} from '@nestjs/common';
import {RegraAtendimento} from './regra-atendimento.model';
import {appendFile, readFile, truncate} from 'fs-extra';
import {check, lock, unlock} from 'proper-lockfile';
import * as path from 'path';

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

    async save(regraAtendimento: RegraAtendimento) {
        return lock(this.caminhoArquivoBanco).then(async () => {
            let msg;

            if (!regraAtendimento.nomeDaRegra) {
                msg = 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem o nome da regra.';
            }

            if (!regraAtendimento.tipoAtendimento) {
                msg = 'Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem o tipo de atendimento.';
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