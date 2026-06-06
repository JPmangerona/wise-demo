import { Body, Controller, Delete, Get, Param, Post, Put, Request, InternalServerErrorException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
    constructor(
        private readonly clientsService: ClientsService,
    ) { }

    @Get()
    async findAll(@Request() req) {
        try {
            return await this.clientsService.findAll(req.user);
        } catch (error) {
            console.error('Error finding clients:', error);
            throw new InternalServerErrorException({
                message: 'Erro interno ao buscar contatos',
                error: error.message,
                stack: error.stack,
            });
        }
    }

    @Post()
    async create(@Body() createClientDto: CreateClientDto, @Request() req) {
        try {
            return await this.clientsService.create(createClientDto, req.user);
        } catch (error) {
            console.error('Error creating client:', error);
            throw new InternalServerErrorException({
                message: 'Erro interno ao criar contato',
                error: error.message,
                stack: error.stack,
            });
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @Request() req) {
        try {
            return await this.clientsService.update(id, updateClientDto, req.user);
        } catch (error) {
            console.error('Error updating client:', error);
            throw new InternalServerErrorException({
                message: 'Erro interno ao atualizar contato',
                error: error.message,
                stack: error.stack,
            });
        }
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        try {
            return await this.clientsService.remove(id, req.user);
        } catch (error) {
            console.error('Error removing client:', error);
            throw new InternalServerErrorException({
                message: 'Erro interno ao remover contato',
                error: error.message,
                stack: error.stack,
            });
        }
    }
}
