package com.example.intervialion.security;

import com.example.intervialion.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.Map;

/**
 * Issues and verifies the JWTs that replace the old "trust the userId the
 * client sends" model. The token's subject is the username; id and role are
 * carried as claims so JwtAuthenticationFilter can build a JwtUserPrincipal
 * without hitting the database on every request.
 */
@Component
public class JwtService {

    private final Key signingKey;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                       @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(user.getUsername())
                .addClaims(Map.of(
                        "id", user.getId(),
                        "role", user.getRole()
                ))
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    /** Parses and verifies the token, or returns null if it's missing/invalid/expired. */
    public JwtUserPrincipal parse(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // claims.get(key, Class) throws on a type mismatch rather than
            // returning null, and JJWT/Jackson may deserialize a numeric
            // claim as Integer or Long depending on its value - read it as a
            // raw Number instead of guessing the exact boxed type.
            Object rawId = claims.get("id");
            Long id = rawId instanceof Number ? ((Number) rawId).longValue() : null;
            String role = claims.get("role", String.class);

            return new JwtUserPrincipal(id, claims.getSubject(), role);
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
