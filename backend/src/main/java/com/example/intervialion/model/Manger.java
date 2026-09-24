package com.example.intervialion.model;


import jakarta.persistence.Entity;

import java.util.List;

@Entity
public class Manger extends User {
    public Manger() {
        super();
    }

    public Manger(Long id, String username, String password, String email, int phone, String city, String adress, String timeToContac, List<Product> products) {
        super(id, username, password, email, phone, city, adress, timeToContac,products);
    }
}
