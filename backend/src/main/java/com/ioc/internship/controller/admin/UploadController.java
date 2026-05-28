package com.ioc.internship.controller.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    /**
     * POST /api/upload/image
     * Accept: multipart/form-data — field name: "file"
     * Returns: { success: true, url: "/uploads/xxx.jpg" }
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        Map<String, Object> resp = new HashMap<>();
        try {
            if (file.isEmpty()) {
                resp.put("success", false);
                resp.put("message", "File trống");
                return ResponseEntity.badRequest().body(resp);
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                resp.put("success", false);
                resp.put("message", "Chỉ chấp nhận file ảnh (jpg, png, webp...)");
                return ResponseEntity.badRequest().body(resp);
            }

            // Ensure upload directory exists
            Path dirPath = Paths.get(uploadDir, "images");
            Files.createDirectories(dirPath);

            // Generate unique filename
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
            String ext = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.'))
                : ".jpg";
            String fileName = UUID.randomUUID() + ext;

            Path filePath = dirPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            // Return accessible URL (served by Spring as static resource)
            String url = "http://localhost:8082/images/" + fileName;

            resp.put("success", true);
            resp.put("url", url);
            resp.put("message", "Upload thành công");
            return ResponseEntity.ok(resp);

        } catch (IOException e) {
            resp.put("success", false);
            resp.put("message", "Lỗi khi lưu file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(resp);
        }
    }
}
