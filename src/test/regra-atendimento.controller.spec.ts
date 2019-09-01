import {RegraAtendimentoController} from '../regra-atendimento.controller';
import {RegraAtendimentoService} from '../regra-atendimento.service';
import {RegraAtendimento} from '../regra-atendimento.model';
import {HttpException, HttpStatus} from '@nestjs/common';
import {Horario} from '../horario-regra-atendimento.model';
import {Intervalo} from '../intervalos-regra-atendimento';
import {appendFile, truncate} from 'fs-extra';

describe('RegraAtendimentoController', () => {
    let regraAtendimentoController: RegraAtendimentoController;
    let regraAtendimentoService: RegraAtendimentoService;

    beforeAll(async () => {
        regraAtendimentoService = new RegraAtendimentoService();
        regraAtendimentoController = new RegraAtendimentoController(regraAtendimentoService);
        await truncate(regraAtendimentoService.caminhoArquivoBanco, 0);
        await appendFile(regraAtendimentoService.caminhoArquivoBanco, JSON.stringify([]));
    });

    afterAll(async () => {
        await truncate(regraAtendimentoService.caminhoArquivoBanco, 0);
        await appendFile(regraAtendimentoService.caminhoArquivoBanco, JSON.stringify([]));
    });

    describe('save', () => {
        it('Lança exceção pois não tem nome de regra o objeto.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem o nome da regra.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento sem o tipo de atendimento.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem o tipo de atendimento.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com um tipo de atendimento inválido.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'Teste';

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o tipo de atendimento inválido.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento sem horário.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'U';

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem horário.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento para um dia específico sem o dia.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'U';
            regraDeAtendimento.horario = new Horario();

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento para um dia específico sem o dia.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com a data do dia inválida.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'U';
            regraDeAtendimento.horario = new Horario();
            regraDeAtendimento.horario.dia = 'Teste';

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com a data do dia inválida.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento semanal sem os dias da semana.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'S';
            regraDeAtendimento.horario = new Horario();

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento semanal sem os dias da semana.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento semanal com os dias da semana inválidos. Dia da semana maior que 7.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'S';
            regraDeAtendimento.horario = new Horario();
            regraDeAtendimento.horario.diasDisponiveis = [8];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento dia da semana disponivel inválido.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento semanal com os dias da semana inválidos. Dia da semana menor que 1.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'S';
            regraDeAtendimento.horario = new Horario();
            regraDeAtendimento.horario.diasDisponiveis = [0];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento dia da semana disponivel inválido.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com os intervalos null ou undefined.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem intervalos.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento sem intervalos.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();
            regraDeAtendimento.horario.intervalos = [];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento sem intervalos.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com intervalos sem data de início.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();
            const intervalo = new Intervalo();
            intervalo.fim = '15:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com intervalo sem horário de início ou fim.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com intervalos sem data de fim.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com intervalo sem horário de início ou fim.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com a data de inicio do intervalo inválida.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();
            const intervalo = new Intervalo();
            intervalo.inicio = '4124124';
            intervalo.fim = '15:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o horário de inicio ou fim inválidos.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com a data de fim do intervalo inválida.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '4124';
            regraDeAtendimento.horario.intervalos = [intervalo];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o horário de inicio ou fim inválidos.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com o horário de fim antes do horário de inicio.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '14:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o horário de inicio maior que o horário do fim.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com o horário de fim igual ao horário de início.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '15:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento com o horário de inicio igual ao horário do fim.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('save', () => {
        it('Salva regra de atendimento do tipo diáriamente com sucesso.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 01';
            regraDeAtendimento.tipoRegraAtendimento = 'D';
            regraDeAtendimento.horario = new Horario();
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '16:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            expect(await regraAtendimentoController.save(regraDeAtendimento)).toBe('Regra de atendimento salva com sucesso. Atendimento: ' + JSON.stringify(regraDeAtendimento));
        });
    });

    describe('save', () => {
        it('Salva regra de atendimento do tipo um dia especifico com sucesso.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 02';
            regraDeAtendimento.tipoRegraAtendimento = 'U';
            regraDeAtendimento.horario = new Horario();
            regraDeAtendimento.horario.dia = '30-08-2019';
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '16:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            expect(await regraAtendimentoController.save(regraDeAtendimento)).toBe('Regra de atendimento salva com sucesso. Atendimento: ' + JSON.stringify(regraDeAtendimento));
        });
    });

    describe('save', () => {
        it('Salva regra de atendimento do tipo semanalmente com sucesso.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 03';
            regraDeAtendimento.tipoRegraAtendimento = 'S';
            regraDeAtendimento.horario = new Horario();
            regraDeAtendimento.horario.diasDisponiveis = [1, 2, 3, 4, 5, 6, 7];
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '16:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            expect(await regraAtendimentoController.save(regraDeAtendimento)).toBe('Regra de atendimento salva com sucesso. Atendimento: ' + JSON.stringify(regraDeAtendimento));
        });
    });

    describe('findAll', () => {
        it('Retorna uma três regras de atendimento previamente salvas.', async () => {
            const listaRegrasAtendimento = new Array<RegraAtendimento>();

            const regraDeAtendimento1 = new RegraAtendimento();
            regraDeAtendimento1.id = 1;
            regraDeAtendimento1.nomeDaRegra = 'Regra 01';
            regraDeAtendimento1.tipoRegraAtendimento = 'D';
            regraDeAtendimento1.horario = new Horario();
            regraDeAtendimento1.horario.disponibilidade = 'Disponivel Todos os Dias.';
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '16:00';
            regraDeAtendimento1.horario.intervalos = [intervalo];

            const regraDeAtendimento2 = new RegraAtendimento();
            regraDeAtendimento2.id = 2;
            regraDeAtendimento2.nomeDaRegra = 'Regra 02';
            regraDeAtendimento2.tipoRegraAtendimento = 'U';
            regraDeAtendimento2.horario = new Horario();
            regraDeAtendimento2.horario.disponibilidade = 'Disponivel Dia: 30-08-2019';
            regraDeAtendimento2.horario.dia = '30-08-2019';
            const intervalo2 = new Intervalo();
            intervalo2.inicio = '15:00';
            intervalo2.fim = '16:00';
            regraDeAtendimento2.horario.intervalos = [intervalo2];

            const regraDeAtendimento3 = new RegraAtendimento();
            regraDeAtendimento3.id = 3;
            regraDeAtendimento3.nomeDaRegra = 'Regra 03';
            regraDeAtendimento3.tipoRegraAtendimento = 'S';
            regraDeAtendimento3.horario = new Horario();
            regraDeAtendimento3.horario.disponibilidade = 'Disponivel todas as semanas nos dias: Segunda-feira Terça-feira Quarta-feira Quinta-feira Sexta-feira Sabado Domingo';
            regraDeAtendimento3.horario.diasDisponiveis = [1, 2, 3, 4, 5, 6, 7];
            const intervalo3 = new Intervalo();
            intervalo3.inicio = '15:00';
            intervalo3.fim = '16:00';
            regraDeAtendimento3.horario.intervalos = [intervalo3];

            listaRegrasAtendimento.push(regraDeAtendimento1, regraDeAtendimento2, regraDeAtendimento3);

            expect(await regraAtendimentoController.findAll()).toEqual(listaRegrasAtendimento);
        });
    });

    describe('findByIntervalo', () => {
        it('Retorna uma lista vazia pois não tem regras de atendimentos salvas ainda.', async () => {
            const listaHorarios = new Array<Horario>();

            const intervaloPesquisa = new Intervalo();
            intervaloPesquisa.inicio = '29-08-2019';
            intervaloPesquisa.fim = '31-08-2019';

            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '16:00';

            const horario = new Horario();
            horario.disponibilidade = 'Disponivel Todos os Dias.';
            horario.intervalos = [intervalo];

            const horario2 = new Horario();
            horario2.disponibilidade = 'Disponivel Dia: 30-08-2019';
            horario2.intervalos = [intervalo];

            const horario3 = new Horario();
            horario3.disponibilidade = 'Disponivel todas as semanas nos dias: Segunda-feira Terça-feira Quarta-feira Quinta-feira Sexta-feira Sabado Domingo';
            horario3.intervalos = [intervalo];

            delete horario.diasDisponiveis;
            delete horario.dia;

            delete horario2.diasDisponiveis;
            delete horario2.dia;

            delete horario3.diasDisponiveis;
            delete horario3.dia;

            listaHorarios.push(horario, horario2, horario3);

            expect(await regraAtendimentoController.findByIntervalo(intervaloPesquisa)).toEqual(listaHorarios);
        });
    });

    describe('save', () => {
        it('Lança exceção pois não é possivel salvar regra de atendimento com o nome de regra duplicado.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 03';
            regraDeAtendimento.tipoRegraAtendimento = 'S';
            regraDeAtendimento.horario = new Horario();
            regraDeAtendimento.horario.diasDisponiveis = [1, 2, 3, 4, 5, 6, 7];
            const intervalo = new Intervalo();
            intervalo.inicio = '15:00';
            intervalo.fim = '16:00';
            regraDeAtendimento.horario.intervalos = [intervalo];

            const error = new HttpException('Erro ao salvar regra de atendimento. Não é possível salvar uma regra de atendimento pois esse nome de regra já existe.', HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.save(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });

    describe('delete', () => {
        it('Deleta pelo id da regra de atendimento.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.id = 1;
            expect(await regraAtendimentoController.delete(regraDeAtendimento)).toBe('Regra de atendimento removida pelo id com sucesso. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento));
        });
    });

    describe('delete', () => {
        it('Deleta pelo nome da regra de atendimento.', async () => {
            const regraDeAtendimento = new RegraAtendimento();
            regraDeAtendimento.nomeDaRegra = 'Regra 02';
            expect(await regraAtendimentoController.delete(regraDeAtendimento)).toBe('Regra de atendimento removida pelo nome da regra com sucesso. Regra de Atendimento: ' + JSON.stringify(regraDeAtendimento));
        });
    });

    describe('delete', () => {
        it('Lança exceção pois não é possivel deletar regra de atendimento sem id ou nome da regra.', async () => {
            const regraDeAtendimento = new RegraAtendimento();

            const error = new HttpException('Não foi possível remover a regra de atendimento passada. Tem certeza que o id ou o nome da regra estão corretos? Regra de atendimento: ' + JSON.stringify(regraDeAtendimento), HttpStatus.BAD_REQUEST);

            try {
                await regraAtendimentoController.delete(regraDeAtendimento);
                expect(true).toBe(false);
            } catch (e) {
                expect(e.message).toBe(error.message);
                expect((e as HttpException).getStatus()).toBe(error.getStatus());
            }
        });
    });
});