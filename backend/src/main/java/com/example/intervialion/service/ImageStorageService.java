package com.example.intervialion.service;

import com.example.intervialion.exception.InvalidRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Stores uploaded images on local disk (app.upload.dir) and hands back the
 * public URL path they're served from (ImageController). Entities keep only
 * that URL string in an imageUrl column - the bytes never go into H2.
 * <p>
 * Files get a fresh random name, so a client-supplied filename never touches
 * the filesystem, and the type is checked against the file's actual leading
 * bytes rather than trusting the Content-Type header alone.
 */
@Service
public class ImageStorageService {

    public static final String URL_PREFIX = "/api/images/";
    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Pattern SAFE_NAME = Pattern.compile("^[a-f0-9-]{36}\\.(jpg|png|webp|gif)$");

    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif"
    );

    private final Path uploadDir;

    public ImageStorageService(@Value("${app.upload.dir:uploads}") String uploadDir) throws IOException {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadDir);
    }

    /** Saves the image and returns its public URL path, e.g. "/api/images/{uuid}.jpg". */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("Image file is empty");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new InvalidRequestException("Image is too large (max 5MB)");
        }

        String extension;
        try (InputStream in = file.getInputStream()) {
            extension = detectExtension(in.readNBytes(12));
        } catch (IOException e) {
            throw new InvalidRequestException("Could not read the uploaded image");
        }
        if (extension == null) {
            throw new InvalidRequestException("Only JPG, PNG, WEBP or GIF images are allowed");
        }

        String filename = UUID.randomUUID() + "." + extension;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, uploadDir.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store image", e);
        }
        return URL_PREFIX + filename;
    }

    /** Best-effort removal of a previously stored image; ignores URLs this service didn't issue. */
    public void delete(String imageUrl) {
        Path path = resolveFromUrl(imageUrl);
        if (path == null) {
            return;
        }
        try {
            Files.deleteIfExists(path);
        } catch (IOException ignored) {
            // An orphaned file is harmless; never fail the surrounding operation over it.
        }
    }

    /** Loads a stored image by filename for serving, or null if it doesn't exist / isn't one of ours. */
    public Resource load(String filename) {
        if (filename == null || !SAFE_NAME.matcher(filename).matches()) {
            return null;
        }
        try {
            Resource resource = new UrlResource(uploadDir.resolve(filename).toUri());
            return resource.exists() ? resource : null;
        } catch (MalformedURLException e) {
            return null;
        }
    }

    public static String contentTypeFor(String filename) {
        return EXTENSIONS.entrySet().stream()
                .filter(e -> filename.endsWith("." + e.getValue()))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse("application/octet-stream");
    }

    private Path resolveFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(URL_PREFIX)) {
            return null;
        }
        String filename = imageUrl.substring(URL_PREFIX.length());
        return SAFE_NAME.matcher(filename).matches() ? uploadDir.resolve(filename) : null;
    }

    /** Identifies the image type from its magic bytes. */
    private static String detectExtension(byte[] h) {
        if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (h.length >= 8 && (h[0] & 0xFF) == 0x89 && h[1] == 'P' && h[2] == 'N' && h[3] == 'G') {
            return "png";
        }
        if (h.length >= 6 && h[0] == 'G' && h[1] == 'I' && h[2] == 'F' && h[3] == '8') {
            return "gif";
        }
        if (h.length >= 12 && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F'
                && h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P') {
            return "webp";
        }
        return null;
    }
}
