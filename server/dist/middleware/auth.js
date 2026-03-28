import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.js';
export async function authMiddleware(request, reply) {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return reply.status(401).send({ error: '未提供认证令牌' });
        }
        const decoded = jwt.verify(token, JWT_CONFIG.secret);
        request.user = decoded;
    }
    catch (error) {
        return reply.status(401).send({ error: '认证令牌无效' });
    }
}
export async function optionalAuthMiddleware(request, _reply) {
    try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (token) {
            const decoded = jwt.verify(token, JWT_CONFIG.secret);
            request.user = decoded;
        }
    }
    catch {
        // token 无效时静默忽略，不阻断请求
    }
}
//# sourceMappingURL=auth.js.map