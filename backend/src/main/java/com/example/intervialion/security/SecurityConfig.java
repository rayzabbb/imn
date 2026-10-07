package com.example.intervialion.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Stateless, JWT-based security. Replaces the old model where every
 * protected action trusted a userId the client sent - the JwtAuthentication-
 * Filter is what actually decides who's making the request, from a verified
 * token, before any controller runs.
 * <p>
 * Public: browsing (categories/subcategories/products), uploaded images,
 * register/login, and the H2 console (a local dev tool, unrelated to the
 * app's own auth). Creating categories/subcategories or changing their
 * images is MANAGER-only. Everything else requires a valid Bearer token.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {}) // picks up the existing @CrossOrigin config on each controller
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)) // H2 console renders in a frame
                .exceptionHandling(exceptions -> exceptions
                        // Plain-text bodies, matching GlobalExceptionHandler's existing style.
                        .authenticationEntryPoint((request, response, ex) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("text/plain;charset=UTF-8");
                            response.getWriter().write("Authentication required");
                        })
                        .accessDeniedHandler((request, response, ex) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("text/plain;charset=UTF-8");
                            response.getWriter().write("Access denied");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // CORS preflight
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/user/RegisterUser", "/api/user/Login").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/category/**",
                                "/api/subcategory/**",
                                "/api/manger/**",
                                "/api/product/GetProducts",
                                "/api/product/GetProductsBySubCategory/**",
                                "/api/product/GetProductById/**",
                                "/api/images/**"
                        ).permitAll()
                        // Any non-GET on categories/subcategories is a catalog change.
                        .requestMatchers("/api/category/**", "/api/subcategory/**").hasRole("MANAGER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
