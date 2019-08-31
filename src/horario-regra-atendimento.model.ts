import {Intervalo} from './intervalos-regra-atendimento';

export class Horario {
    dia: string;
    diasDisponiveis: number[];
    intervalos: Intervalo[];
}