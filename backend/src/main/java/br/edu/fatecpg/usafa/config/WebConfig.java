package br.edu.fatecpg.usafa.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Libera o acesso à pasta uploads na URL http://localhost:8080/uploads/...
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
