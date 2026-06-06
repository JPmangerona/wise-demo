import { Body, Controller, Delete, Get, Param, Post, Put, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get()
    async findAll(@Request() req) {
        return this.usersService.findAll(req.user);
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto, @Request() req) {
        return this.usersService.create(createUserDto, req.user);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
        return this.usersService.update(id, updateUserDto, req.user);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Request() req) {
        return this.usersService.remove(id, req.user);
    }
}
