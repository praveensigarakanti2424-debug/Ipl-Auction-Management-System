package com.ipl;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
public class ApiException extends RuntimeException {
  public final HttpStatus status;
  public ApiException(HttpStatus s,String m){ super(m); status=s; }
}
@RestControllerAdvice
class ApiExceptionHandler {
  @ExceptionHandler(ApiException.class) ResponseEntity<Map<String,String>> api(ApiException e){ return ResponseEntity.status(e.status).body(Map.of("message",e.getMessage())); }
  @ExceptionHandler(Exception.class) ResponseEntity<Map<String,String>> other(Exception e){ return ResponseEntity.status(500).body(Map.of("message",String.valueOf(e.getMessage()))); }
}
