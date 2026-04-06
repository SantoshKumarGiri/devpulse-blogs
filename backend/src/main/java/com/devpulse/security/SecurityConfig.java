package com.devpulse.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired private JwtAuthFilter jwtAuthFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(c -> c.configurationSource(corsSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // ── Public (no login needed) ─────────────────────
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/auth/me").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/articles").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/articles/search").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/articles/{id}").permitAll()
                .requestMatchers(HttpMethod.PATCH,"/api/articles/{id}/read").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/users/*/public").permitAll()
                .requestMatchers(HttpMethod.GET,  "/api/users/*/articles").permitAll()
                .requestMatchers(HttpMethod.GET,  "/").permitAll()

                // ── AUTHOR or ADMIN: write articles + upload images ─
                .requestMatchers(HttpMethod.POST,   "/api/articles").hasAnyRole("AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/articles/{id}").hasAnyRole("AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/articles/{id}").hasAnyRole("AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/articles/drafts").hasAnyRole("AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/articles/{id}/like").hasAnyRole("AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.PATCH,  "/api/articles/{id}/bookmark").hasAnyRole("AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/articles/{id}/comments").hasAnyRole("AUTHOR","ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/images/upload").hasAnyRole("AUTHOR","ADMIN")

                // ── ADMIN only ────────────────────────────────────
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
        cfg.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
