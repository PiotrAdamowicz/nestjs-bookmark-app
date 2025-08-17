import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto, AuthSignupDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

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
                    .expectStatus(201)
                    .stores('userAt', 'access_token');
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
        describe('Get me', () => {
            it('Should get current user', () => {
                return pactum
                    .spec()
                    .get('/users/me')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .expectStatus(200);
            });
        });
        describe('Edit user', () => {
            it('Should edit user', () => {
                const dto: EditUserDto = {
                    email: 'draco@pipins.com',
                    firstName: 'Draco',
                };
                return pactum
                    .spec()
                    .patch('/users')
                    .withBody(dto)
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .expectStatus(200)
                    .expectBodyContains(dto.firstName)
                    .expectBodyContains(dto.email);
            });
        });
    });
    describe('Bookmarks', () => {
        describe('Get empty bookmark', () => {
            it('Should get bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .expectStatus(200)
                    .expectBody([]);
            });
        });
        describe('Create bookmark', () => {
            const dto: CreateBookmarkDto = {
                title: 'First bootkcamp',
                description: 'Something',
                link: 'www.google.com',
            };
            it('Should create bookmarks', () => {
                return pactum
                    .spec()
                    .post('/bookmarks')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .withBody(dto)
                    .expectStatus(201)
                    .stores('bookmarkId', 'id');
            });
        });
        describe('Get bookmark', () => {
            it('Should get bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .expectStatus(200)
                    .expectJsonLength(1);
            });
        });
        describe('Get bookmark by id', () => {
            it('Should get bookmark by id', () => {
                return pactum
                    .spec()
                    .get('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .expectStatus(200)
                    .expectBodyContains('$S{bookmarkId}');
            });
        });
        describe('Edit bookmark by id', () => {
            const dto: EditBookmarkDto = {
                title: 'New title',
                description: 'New description',
            };
            it('Should edit bookmark by id', () => {
                return pactum
                    .spec()
                    .patch('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(dto.title)
                    .expectBodyContains(dto.description);
            });
        });
        describe('Delete bookmark by id', () => {
            it('Should edit bookmark by id', () => {
                return pactum
                    .spec()
                    .delete('/bookmarks/{id}')
                    .withPathParams('id', '$S{bookmarkId}')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .expectStatus(204);
            });
            it('Shoudl get empty bookmarks', () => {
                return pactum
                    .spec()
                    .get('/bookmarks')
                    .withHeaders({ Authorization: 'Bearer $S{userAt}' })
                    .expectStatus(200)
                    .expectJsonLength(0);
            });
        });
    });
});
