/**
 * Enhanced JWT Security Manager
 * Production-ready JWT implementation with advanced security features
 */

import { SignJWT, jwtVerify } from 'jose';

export class SecureJWTManager {
    constructor(env) {
        this.env = env;
        this.algorithm = 'HS256';
        this.issuer = 'doglc-wallet';
        this.audience = 'doglc-users';
    }

    async generateSecureToken(payload, options = {}) {
        const {
            expiresIn = '1h',
            subject,
            notBefore = new Date(),
            includeRefreshToken = true
        } = options;

        try {
            const secret = new TextEncoder().encode(this.env.JWT_SECRET);
            
            // Add security claims
            const enhancedPayload = {
                ...payload,
                jti: crypto.randomUUID(), // JWT ID for revocation
                iat: Math.floor(Date.now() / 1000),
                iss: this.issuer,
                aud: this.audience,
                tokenType: 'access'
            };

            const jwt = await new SignJWT(enhancedPayload)
                .setProtectedHeader({ alg: this.algorithm })
                .setSubject(subject)
                .setExpirationTime(expiresIn)
                .setNotBefore(notBefore)
                .sign(secret);

            // Generate refresh token if requested
            let refreshToken = null;
            if (includeRefreshToken) {
                refreshToken = await this.generateRefreshToken(subject);
            }

            // Store token metadata for security tracking
            await this.storeTokenMetadata(enhancedPayload.jti, {
                subject,
                issuedAt: enhancedPayload.iat,
                expiresAt: Math.floor(Date.now() / 1000) + this.parseExpiresIn(expiresIn),
                userAgent: payload.userAgent || 'unknown',
                ipAddress: payload.ipAddress || 'unknown'
            });

            return {
                accessToken: jwt,
                refreshToken,
                expiresIn: this.parseExpiresIn(expiresIn),
                tokenType: 'Bearer'
            };

        } catch (error) {
            console.error('JWT generation failed:', error);
            throw new Error('Token generation failed');
        }
    }

    async verifySecureToken(token, options = {}) {
        const { checkRevocation = true, requireFreshToken = false } = options;

        try {
            const secret = new TextEncoder().encode(this.env.JWT_SECRET);
            
            const { payload } = await jwtVerify(token, secret, {
                issuer: this.issuer,
                audience: this.audience,
                algorithms: [this.algorithm]
            });

            // Check token revocation
            if (checkRevocation && await this.isTokenRevoked(payload.jti)) {
                throw new Error('Token has been revoked');
            }

            // Check if token is fresh enough for sensitive operations
            if (requireFreshToken) {
                const tokenAge = Date.now() / 1000 - payload.iat;
                if (tokenAge > 300) { // 5 minutes
                    throw new Error('Token too old for sensitive operation');
                }
            }

            // Update last used timestamp
            await this.updateTokenUsage(payload.jti);

            return payload;

        } catch (error) {
            // Log security event
            await this.logSecurityEvent('TOKEN_VERIFICATION_FAILED', {
                error: error.message,
                token: token.substring(0, 20) + '...',
                timestamp: new Date().toISOString()
            });
            
            throw error;
        }
    }

    async generateRefreshToken(subject) {
        const secret = new TextEncoder().encode(this.env.JWT_REFRESH_SECRET || this.env.JWT_SECRET);
        
        const refreshPayload = {
            sub: subject,
            jti: crypto.randomUUID(),
            tokenType: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        };

        return await new SignJWT(refreshPayload)
            .setProtectedHeader({ alg: this.algorithm })
            .setExpirationTime('7d') // Refresh tokens last 7 days
            .setIssuer(this.issuer)
            .setAudience(this.audience)
            .sign(secret);
    }

    async revokeToken(jti, reason = 'user_logout') {
        if (this.env.REVOKED_TOKENS_KV) {
            await this.env.REVOKED_TOKENS_KV.put(
                `revoked_${jti}`,
                JSON.stringify({
                    revokedAt: new Date().toISOString(),
                    reason
                }),
                { expirationTtl: 86400 * 7 } // Keep revocation record for 7 days
            );
        }

        await this.logSecurityEvent('TOKEN_REVOKED', { jti, reason });
    }

    async isTokenRevoked(jti) {
        if (this.env.REVOKED_TOKENS_KV) {
            const revoked = await this.env.REVOKED_TOKENS_KV.get(`revoked_${jti}`);
            return !!revoked;
        }
        return false;
    }

    async storeTokenMetadata(jti, metadata) {
        if (this.env.TOKEN_METADATA_KV) {
            await this.env.TOKEN_METADATA_KV.put(
                `meta_${jti}`,
                JSON.stringify(metadata),
                { expirationTtl: 86400 * 7 }
            );
        }
    }

    async updateTokenUsage(jti) {
        if (this.env.TOKEN_METADATA_KV) {
            const existing = await this.env.TOKEN_METADATA_KV.get(`meta_${jti}`);
            if (existing) {
                const metadata = JSON.parse(existing);
                metadata.lastUsed = new Date().toISOString();
                metadata.usageCount = (metadata.usageCount || 0) + 1;
                
                await this.env.TOKEN_METADATA_KV.put(
                    `meta_${jti}`,
                    JSON.stringify(metadata),
                    { expirationTtl: 86400 * 7 }
                );
            }
        }
    }

    parseExpiresIn(expiresIn) {
        // Parse expiration time to seconds
        if (typeof expiresIn === 'number') return expiresIn;
        
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) return 3600; // Default 1 hour
        
        const [, amount, unit] = match;
        const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
        
        return parseInt(amount) * multipliers[unit];
    }

    async logSecurityEvent(event, data) {
        if (this.env.SECURITY_LOG_KV) {
            await this.env.SECURITY_LOG_KV.put(
                `${event}_${Date.now()}`,
                JSON.stringify({
                    event,
                    ...data,
                    timestamp: new Date().toISOString()
                }),
                { expirationTtl: 86400 * 30 } // Keep security logs for 30 days
            );
        }
    }
}