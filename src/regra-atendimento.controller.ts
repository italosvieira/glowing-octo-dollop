import {Body, Controller, Delete, Get, Logger, Post} from '@nestjs/common';
import {RegraAtendimentoService} from './regra-atendimento.service';
import {RegraAtendimento} from './regra-atendimento.model';

@Controller('api/regra-atendimento')
export class RegraAtendimentoController {
  constructor(private readonly regraAtendimentoService: RegraAtendimentoService) {}

  private readonly logger = new Logger(RegraAtendimentoController.name);

  @Get()
  async findAll(@Body() regraAtendimento: RegraAtendimento) {
    this.logger.log('Recebendo requisição para consultar todas as regras de atendimentos.');
    return this.regraAtendimentoService.findAll();
  }

  @Post()
  async save(@Body() regraAtendimento: RegraAtendimento) {
    this.logger.log('Recebendo requisição para salvar nova regra de atendimento.');
    return this.regraAtendimentoService.save(regraAtendimento);
  }

  @Delete()
  async delete(@Body() atendimento: RegraAtendimento) {
    this.logger.log('Recebendo requisição para deletar uma regra de atendimento.');
    return this.regraAtendimentoService.delete(atendimento);
  }
}