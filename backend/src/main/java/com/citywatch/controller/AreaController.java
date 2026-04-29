package com.citywatch.controller;

import com.citywatch.entity.Area;
import com.citywatch.service.AreaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
public class AreaController {

    private final AreaService areaService;

    @GetMapping
    public List<Area> getAll() {
        return areaService.getAll();
    }

    @GetMapping("/{id}")
    public Area getById(@PathVariable Long id) {
        return areaService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Area create(@RequestBody Area area) {
        return areaService.create(area);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Area update(@PathVariable Long id, @RequestBody Area area) {
        return areaService.update(id, area);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        areaService.delete(id);
    }
}
