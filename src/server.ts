import * as path from 'path';
import {writeFileSync} from 'fs-extra';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

async function start() {
    const server = await NestFactory.create(AppModule);
    server.enableCors();
    await writeFileSync(path.resolve(__dirname, 'banco.json'), '[]');
    await server.listen(3000);
}

start();