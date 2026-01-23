import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/api/controllers/user/user.controller';
import { UserService } from 'src/application/services/user/user.service';
import { User } from 'src/core/entities/user.entity';

@Module({

    imports:[TypeOrmModule.forFeature([User]),],
    providers:[UserService],
    controllers:[UserController],
    exports: [UserService],
})
export class UserModule {}
