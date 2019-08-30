export class RegraAtendimento {
    id: number;
    nomeDaRegra: string;
    tipoAtendimento: TipoAtendimento;
    intervalos: Horario[];
}

class Horario {
    dia: string;
    intervalos: string[];
}

enum TipoAtendimento {
    U = 'Dia Específico',
    D = 'Diariamente',
    S = 'Semanalmente',
}