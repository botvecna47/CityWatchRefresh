package com.citywatch.service;

import com.citywatch.entity.Area;
import com.citywatch.repository.AreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AreaService {

    private final AreaRepository areaRepository;

    public List<Area> getAll() {
        return areaRepository.findAll();
    }

    public Area getById(Long id) {
        return areaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Area not found"));
    }

    public Area findByName(String name) {
        if (name == null || name.isBlank()) return null;
        return areaRepository.findByName(name).orElse(null);
    }

    public Area findNearestArea(Double lat, Double lng) {
        return areaRepository.findAll().stream()
                .min((a, b) -> {
                    double da = Math.abs(a.getCenterLat() - lat) + Math.abs(a.getCenterLng() - lng);
                    double db = Math.abs(b.getCenterLat() - lat) + Math.abs(b.getCenterLng() - lng);
                    return Double.compare(da, db);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No areas configured"));
    }

    @Transactional
    public Area create(Area area) {
        if (areaRepository.findByName(area.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Area with this name already exists");
        }
        return areaRepository.save(area);
    }

    @Transactional
    public Area update(Long id, Area details) {
        Area area = getById(id);
        area.setName(details.getName());
        area.setCity(details.getCity());
        area.setCenterLat(details.getCenterLat());
        area.setCenterLng(details.getCenterLng());
        area.setBoundaryLatMin(details.getBoundaryLatMin());
        area.setBoundaryLatMax(details.getBoundaryLatMax());
        area.setBoundaryLngMin(details.getBoundaryLngMin());
        area.setBoundaryLngMax(details.getBoundaryLngMax());
        return areaRepository.save(area);
    }

    @Transactional
    public void delete(Long id) {
        Area area = getById(id);
        area.setDeleted(true);
        areaRepository.save(area);
    }
}
