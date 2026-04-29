package com.citywatch.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class ApplicationRequest {
 
    @NotBlank(message = "Name is required")
    private String name;
 
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
 
    @NotBlank(message = "Phone is required")
    private String phone;
 
    @NotBlank(message = "Address is required")
    private String address;
 
    @NotBlank(message = "Experience is required")
    private String experience;
 
    private String message;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
