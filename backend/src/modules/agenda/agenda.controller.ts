import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
import { AgendaService } from './agenda.service';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Agenda')
@ApiBearerAuth()
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Post()
  create(@Body() createAgendaDto: CreateAgendaDto, @Request() req) {
    return this.agendaService.create(createAgendaDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.agendaService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.agendaService.findOne(id, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAgendaDto: UpdateAgendaDto, @Request() req) {
    return this.agendaService.update(id, updateAgendaDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.agendaService.remove(id, req.user);
  }
}
