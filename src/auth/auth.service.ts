import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    // geterate password hash
    const hash = await argon.hash(dto.password);

    // save the new user in db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      const { hash: _, ...userWithoutHash } = user;

      return userWithoutHash;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }
  async login(dto: AuthDto) {
    //finde the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    //if user does not exist throw exeptions
    if (!user) throw new ForbiddenException('Credentials incorrect');

    //comapre passwords
    if (!user.hash) {
      throw new ForbiddenException('Credentials incorrect');
    }
    const pwMatches = await argon.verify(user.hash, dto.password);

    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    const { hash: _, ...userWithoutHash } = user;
    return userWithoutHash;
  }
}
