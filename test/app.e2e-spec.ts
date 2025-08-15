import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto, AuthSignupDto } from 'src/auth/dto';

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
            }),
        );
        await app.init();
        await app.listen(3333);

        prisma = app.get(PrismaService);

        await prisma.cleanDb();
        pactum.request.setBaseUrl('http://localhost:3333');
    });

    afterAll(() => {
        app.close();
    });

    describe('Auth', () => {
        const dto: AuthDto = {
            email: 'harry@pippins.com',
            password: '123',
        };
        const signupDto: AuthSignupDto = {
            email: dto.email,
            password: dto.password,
            firstName: 'Harry',
            lastName: 'Lama',
        };
        describe('Signup', () => {
            it('Should throw error if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({ password: dto.password })
                    .expectStatus(400);
            });
            it('Should throw error if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({ email: dto.email })
                    .expectStatus(400);
            });
            it('Should throw error if empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({})
                    .expectStatus(400);
            });
            it('Should signup', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody(signupDto)
                    .expectStatus(201);
            });
        });
        describe('Login', () => {
            it('Should throw error if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/login')
                    .withBody({ password: dto.password })
                    .expectStatus(400);
            });
            it('Should throw error if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/login')
                    .withBody({ email: dto.email })
                    .expectStatus(400);
            });
            it('Should throw error if empty', () => {
                return pactum
                    .spec()
                    .post('/auth/login')
                    .withBody({})
                    .expectStatus(400);
            });
            it('Should login', () => {
                return pactum
                    .spec()
                    .post('/auth/login')
                    .withBody(dto)
                    .expectStatus(200);
            });
        });
    });
    describe('User', () => {
        describe('Get me', () => {});
        describe('Edit user', () => {});
    });
    describe('Bookmarks', () => {
        describe('Get bookmark', () => {});
        describe('Create bookmark', () => {});
        describe('Get bookmark by id', () => {});
        describe('Edit bookmark', () => {});
        describe('Delete bookmark', () => {});
    });
});
