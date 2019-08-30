import {Module} from '@nestjs/common';
import {RegraAtendimentoController} from "./regra-atendimento.controller";
import {RegraAtendimentoService} from "./regra-atendimento.service";

@Module({
    controllers: [RegraAtendimentoController],
    providers: [RegraAtendimentoService],
})
export class AppModule {}