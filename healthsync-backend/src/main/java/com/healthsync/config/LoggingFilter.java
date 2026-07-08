package com.healthsync.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * Filter mapping and logging incoming REST requests, execution durations, and status codes.
 * (Disabled to prevent duplicate request logging; com.healthsync.common.logging.RequestLoggingFilter is used instead)
 */
@Slf4j
public class LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        String uri = request.getRequestURI();
        String method = request.getMethod();
        String clientIp = request.getRemoteAddr();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            log.info("Incoming request: ClientIP={} HTTP {} {} - Outgoing response: Status={} - Duration={}ms", 
                    clientIp, method, uri, response.getStatus(), duration);
        }
    }
}
