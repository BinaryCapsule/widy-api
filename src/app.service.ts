import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getVersion(): string {
    return 'v0.1.1';
  }
}
