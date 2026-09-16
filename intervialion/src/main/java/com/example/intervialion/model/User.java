package com.example.intervialion.model;
import jakarta.persistence.*;

import java.util.List;

@Entity @Table(name ="useri")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE) // טבלה אחת לכל המחלקות
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // שדות ו getters/setters


    private String username;
    private String password;
    private String email;
    private int phone;
    private String city;
    private String adress;
    private String timeToContac;


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products; // שונה מ-product ל-products


    public User() {
    }

    public User(Long id, String username, String password, String email, int phone, String city, String adress, String timeToContac, List<Product> products) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.adress = adress;
        this.timeToContac = timeToContac;
        this.products = products;
    }





    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getPhone() {
        return phone;
    }

    public void setPhone(int phone) {
        this.phone = phone;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAdress() {
        return adress;
    }

    public void setAdress(String adress) {
        this.adress = adress;
    }

    public String getTimeToContac() {
        return timeToContac;
    }

    public void setTimeToContac(String timeToContac) {
        this.timeToContac = timeToContac;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}