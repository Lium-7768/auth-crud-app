import { Module, Global } from '@nestjs/common';
import { AclService } from './acl.service';

@Global()
@Module({
  providers: [AclService],
  exports: [AclService],
})
export class AclModule {}
