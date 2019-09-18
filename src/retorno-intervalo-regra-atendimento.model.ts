import {Intervalo} from './intervalos-regra-atendimento';

export class RetornoIntervaloRegraAtendimentoModel {
    dia: string;
    intervalos: Intervalo[];

    constructor (dia: string, intervalos: Intervalo[]) {
        this.dia = dia;
        this.intervalos = intervalos
    }
}