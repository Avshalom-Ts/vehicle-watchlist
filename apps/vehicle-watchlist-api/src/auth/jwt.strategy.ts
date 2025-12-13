import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '@vehicle-watchlist/utils';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private authService: AuthService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    // Extract JWT from cookie first, fallback to Authorization header for backward compatibility
                    return request?.cookies?.access_token || ExtractJwt.fromAuthHeaderAsBearerToken()(request);
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'my-jwt-super-secure-secret-key',
        });
    }

    /**
     * Validate the JWT payload and return the corresponding user
     * @param payload The JWT payload
     * @returns The validated user object
     * @throws UnauthorizedException if the user is not found or invalid
     */
    async validate(payload: JwtPayload) {
        const user = await this.authService.validateToken(payload);
        if (!user) {
            throw new UnauthorizedException();
        }
        return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
        };
    }
}
