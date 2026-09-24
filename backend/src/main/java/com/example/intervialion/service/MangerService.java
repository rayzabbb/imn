package com.example.intervialion.service;

import com.example.intervialion.model.Manger;
import com.example.intervialion.repository.MangerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MangerService {

    private final MangerRepository mangerRepository;

    public MangerService(MangerRepository mangerRepository) {
        this.mangerRepository = mangerRepository;
    }

    public List<Manger> getAllMangers() {
        return mangerRepository.findAll();
    }
}
