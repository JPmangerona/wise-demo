import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
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
  @Get('datajudi/:cnj')
  consultDataJudi(@Param('cnj') cnj: string) {
    return this.processesService.consultDataJudi(cnj);
  }

  @Public()
  @Get('infosimples/:cnj')
  consultInfosimples(@Param('cnj') cnj: string) {
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

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.processesService.findOne(id, req.user);
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
