import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as fs from 'fs';
import * as path from "path";

async function start() {
    const server = await NestFactory.create(AppModule);
    server.enableCors();
    fs.writeFileSync(path.resolve(__dirname, 'banco.json'), '[]');
    await server.listen(3000);
}

start();