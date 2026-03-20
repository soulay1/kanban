package com.kanban.kanbanbackend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.stream.Collectors;

@Configuration
@ConditionalOnProperty(name = "DATABASE_URL")
public class DataSourceConfig {

    // Params not supported by the PostgreSQL JDBC driver
    private static final java.util.Set<String> UNSUPPORTED_PARAMS = java.util.Set.of("channel_binding");

    @Value("${DATABASE_URL}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() throws URISyntaxException {
        // Neon gives: postgresql://user:pass@host/dbname?sslmode=require&channel_binding=require
        // JDBC needs:  jdbc:postgresql://host/dbname?sslmode=require   + separate user/pass
        URI uri = new URI(databaseUrl
                .replace("postgresql://", "http://")
                .replace("postgres://", "http://"));

        String host = uri.getHost();
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String dbPath = uri.getPath(); // /neondb
        String userInfo = uri.getUserInfo(); // user:pass

        String user = "";
        String password = "";
        if (userInfo != null) {
            int sep = userInfo.indexOf(':');
            user = sep >= 0 ? userInfo.substring(0, sep) : userInfo;
            password = sep >= 0 ? userInfo.substring(sep + 1) : "";
        }

        // Filter out unsupported query params
        String query = uri.getQuery();
        if (query != null) {
            query = Arrays.stream(query.split("&"))
                    .filter(p -> !UNSUPPORTED_PARAMS.contains(p.split("=")[0]))
                    .collect(Collectors.joining("&"));
        }

        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + dbPath
                + (query != null && !query.isEmpty() ? "?" + query : "");

        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(jdbcUrl);
        ds.setUsername(user);
        ds.setPassword(password);
        return ds;
    }
}
