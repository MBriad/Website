import { FastifyRequest, FastifyReply } from 'fastify';
export interface JwtPayload {
    userId?: string;
    username: string;
    role: 'user' | 'admin';
}
export declare function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function optionalAuthMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void>;
//# sourceMappingURL=auth.d.ts.map