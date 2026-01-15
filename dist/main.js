"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/main.ts
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS untuk allow frontend hit API
    app.enableCors({
        origin: 'http://localhost:8080', // Frontend URL
        credentials: true,
    });
    await app.listen(3000);
    console.log('🚀 Backend running at http://localhost:3000');
}
bootstrap();
//# sourceMappingURL=main.js.map