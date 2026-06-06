import { Controller, Get, Post, Body, Put, Param, Delete, Request } from '@nestjs/common';
import { RevenuesService } from './revenues.service';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Revenues')
@ApiBearerAuth()
@Controller('revenues')
export class RevenuesController {
  constructor(private readonly revenuesService: RevenuesService) {}

  @Post()
  create(@Body() createRevenueDto: CreateRevenueDto, @Request() req) {
    return this.revenuesService.create(createRevenueDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.revenuesService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.revenuesService.findOne(id, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateRevenueDto: UpdateRevenueDto, @Request() req) {
    return this.revenuesService.update(id, updateRevenueDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.revenuesService.remove(id, req.user);
  }
}
