import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: process.env.FRONTENT_DOMAIN,
        credentials: true,
    });

    const config = new DocumentBuilder()
        .setTitle('Bookmarks API')
        .setDescription('Description')
        .setVersion('1.0')
        .addTag('bookmarks')
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        }),
    );
    await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
