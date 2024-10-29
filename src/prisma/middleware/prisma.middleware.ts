import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExcludePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((item) => this.excludePassword(item));
        }
        return this.excludePassword(data);
      }),
    );
  }

  private excludePassword(user: any) {
    if (user && user.password) {
      const { password, ...result } = user;
      return result;
    }
    return user;
  }
}
