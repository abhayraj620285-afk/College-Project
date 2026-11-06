package com.churn.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/** Builds the HTTP client used to talk to the Python (FastAPI) model service. */
@Configuration
public class MlClientConfig {

    @Bean
    public RestClient mlRestClient(
            @Value("${ml.service.base-url}") String baseUrl,
            @Value("${ml.service.connect-timeout-ms}") int connectTimeoutMs,
            @Value("${ml.service.read-timeout-ms}") int readTimeoutMs) {

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(connectTimeoutMs);
        factory.setReadTimeout(readTimeoutMs);

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
