import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { UserService } from 'src/application/services/user/user.service'; 
import { CreateUserDto } from 'src/application/common/dto/user/create-user.dto';
import UserRole from 'src/core/common/user-role.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userService = app.get(UserService);

    const username = 'admin';
    const existingAdmin = await userService.findByUsername(username);

    if (existingAdmin) {
      console.log(`Usuario '${username}' ya existe. No se creó nuevo usuario.`);
    } else {
      const adminUser: CreateUserDto = {
        username: 'admin',
        password: 'admin', 
        role: UserRole.ADMIN, 
        email: 'admin@tlcu.com',
      };

      await userService.create(adminUser);
      console.log(`Usuario '${username}' creado exitosamente.`);
    }
  } catch (error) {
    console.error('Error creando usuario admin:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
