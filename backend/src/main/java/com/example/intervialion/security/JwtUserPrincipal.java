package com.example.intervialion.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

/**
 * The authenticated identity for a request, built directly from a verified
 * JWT's claims - no database lookup per request. Controllers read the real
 * user id from here via @AuthenticationPrincipal instead of trusting a
 * userId the client puts in the request.
 */
public class JwtUserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String role;

    public JwtUserPrincipal(Long id, String username, String role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return null; // never needed after the token is verified
    }

    @Override
    public List<GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
