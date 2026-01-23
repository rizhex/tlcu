import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/core/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    const passwordValid = await bcrypt.compare(pass, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Contraseña inválida');
    }
    const { password, ...result } = user;
    return result;
  }

  async login(user: User) {
    if(user.isActive){
      const roles = user.role ? [user.role] : [];
      const payload = { username: user.username, sub: user.id, roles };
      
      return {
        access_token: this.jwtService.sign(payload),
      };  
    }
    
  }
}
