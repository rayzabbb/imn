package com.example.intervialion.controller;

import com.example.intervialion.model.Manger;
import com.example.intervialion.service.MangerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/manger")
@CrossOrigin
public class MangerController {

    private final MangerService mangerService;

    public MangerController(MangerService mangerService) {
        this.mangerService = mangerService;
    }

    @GetMapping("/GetMangers")
    public ResponseEntity<List<Manger>> getMangers() {
        List<Manger> mangers = mangerService.getAllMangers();
        if (mangers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(mangers, HttpStatus.OK);
    }
}
