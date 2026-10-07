package com.ipl;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;
@Configuration
public class CorsConfig implements WebMvcConfigurer {
  public void addCorsMappings(CorsRegistry r){ r.addMapping("/api/**").allowedOrigins("*").allowedMethods("GET","POST","PUT","DELETE"); }
}
