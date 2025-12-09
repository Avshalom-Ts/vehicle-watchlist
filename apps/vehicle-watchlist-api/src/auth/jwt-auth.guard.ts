import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    /**
     * Determine if the request can be activated
     * @param context The execution context
     * @returns A boolean or a Promise resolving to a boolean indicating if activation is allowed
     * @throws UnauthorizedException if the token is invalid or expired
     */
    override canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        return super.canActivate(context);
    }

    /**
     * Handle the request after authentication
     * @param err An error object if authentication failed
     * @param user The authenticated user object
     */
    override handleRequest<TUser = Express.User>(err: Error | null, user: TUser | false): TUser {
        if (err || !user) {
            throw err || new UnauthorizedException('Invalid or expired token');
        }
        return user;
    }
}
