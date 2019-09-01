import {Intervalo} from './intervalos-regra-atendimento';

export class Horario {
    dia: string;
    disponibilidade: string;
    diasDisponiveis: number[];
    intervalos: Intervalo[];
}