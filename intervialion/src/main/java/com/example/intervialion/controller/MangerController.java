package com.example.intervialion.controller;

import com.example.intervialion.model.Manger;
import com.example.intervialion.service.MangerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/manger")
@CrossOrigin
public class MangerController {
    @Autowired
    private MangerRepository mangerRepository;

    public MangerController(MangerRepository mangerRepository) {
        this.mangerRepository = mangerRepository;
    }

    @GetMapping("/GetMangers")
    public ResponseEntity<List<Manger>> getMangers() {
        List<Manger> mangers = mangerRepository.findAll();
        if (mangers.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return new ResponseEntity<>(mangers, HttpStatus.OK);
    }
}
