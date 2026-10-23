import { Controller, Get, Post, Body, Put, Param, Delete, Request, Query } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { CreateFinancialDto } from './dto/create-financial.dto';
import { UpdateFinancialDto } from './dto/update-financial.dto';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinancialType } from './entities/financial.entity';

@ApiTags('Financial')
@ApiBearerAuth()
@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Post()
  create(@Body() createFinancialDto: CreateFinancialDto, @Request() req) {
    return this.financialService.create(createFinancialDto, req.user);
  }

  @Get()
  @ApiQuery({ name: 'type', enum: FinancialType, required: false })
  findAll(@Request() req, @Query('type') type?: FinancialType) {
    return this.financialService.findAll(req.user, type);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.financialService.findOne(id, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFinancialDto: UpdateFinancialDto, @Request() req) {
    return this.financialService.update(id, updateFinancialDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.financialService.remove(id, req.user);
  }
}
