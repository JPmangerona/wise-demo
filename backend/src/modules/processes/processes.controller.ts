import { Controller, Get, Post, Body, Put, Param, Delete, Request, Query, BadRequestException } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Processes')
@ApiBearerAuth()
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @Public()
  @Get('datajudi')
  consultDataJudi(@Query('cnj') cnj: string) {
    if (!cnj) throw new BadRequestException('O parâmetro "cnj" é obrigatório.');
    return this.processesService.consultDataJudi(cnj);
  }

  @Public()
  @Get('infosimples')
  consultInfosimples(@Query('cnj') cnj: string) {
    if (!cnj) throw new BadRequestException('O parâmetro "cnj" é obrigatório.');
    return this.processesService.consultInfosimples(cnj);
  }

  @Post()
  create(@Body() createProcessDto: CreateProcessDto, @Request() req) {
    return this.processesService.create(createProcessDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.processesService.findAll(req.user);
  }

  @Get('groups')
  getProcessGroups(@Request() req) {
    return this.processesService.getProcessGroups(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.processesService.findOne(id, req.user);
  }

  @Post('movements/validate-multiple')
  validateMovements(@Body() dto: { ids: string[] }, @Request() req) {
    return this.processesService.validateMovements(dto, req.user);
  }

  @Post('movements/:id/validate')
  validateMovement(@Param('id') id: string, @Request() req) {
    return this.processesService.validateMovement(id, req.user);
  }

  @Delete('movements/:id')
  removeMovement(@Param('id') id: string, @Request() req) {
    return this.processesService.removeMovement(id, req.user);
  }

  @Post(':id/movements')
  addMovement(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.processesService.addMovement(id, dto, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateProcessDto: UpdateProcessDto, @Request() req) {
    return this.processesService.update(id, updateProcessDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.processesService.remove(id, req.user);
  }
}
