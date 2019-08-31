import {Horario} from './horario-regra-atendimento.model';

export class RegraAtendimento {
    id: number;
    nomeDaRegra: string;
    tipoRegraAtendimento: string;
    horario: Horario;
}