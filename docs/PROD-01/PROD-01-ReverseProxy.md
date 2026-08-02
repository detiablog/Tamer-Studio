# PROD-01: Nginx Reverse Proxy Configuration

**Document ID:** PROD-01-ReverseProxy  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the Nginx reverse proxy configuration for Tamer Studio, including SSL termination, security headers, compression, caching, WebSocket support, and rate limiting.

---

## Architecture

```
Client (HTTPS:443) --> Nginx --> App (HTTP:3000)
                  |--> Nginx --> Static Assets (/_next/static/)
                  |--> Nginx --> Health Checks (/api/health)
```

---

## Configuration

### Main Configuration (`config/nginx/nginx.conf`)

```nginx
worker_processes auto;
pid /tmp/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml text/javascript image/svg+xml;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;" always;

        # Static assets with long cache
        location /_next/static/ {
            proxy_pass http://app:3000;
            expires 365d;
            add_header Cache-Control "public, immutable";
        }

        # Health checks
        location /api/health {
            proxy_pass http://app:3000;
            proxy_set_header Host $host;
            access_log off;
        }

        # Main application
        location / {
            proxy_pass http://app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 90s;
            proxy_send_timeout 90s;
        }
    }
}
```

---

## SSL Configuration

### Certificate Setup

```bash
# Create SSL directory
mkdir -p config/nginx/ssl

# Generate self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout config/nginx/ssl/key.pem \
  -out config/nginx/ssl/cert.pem

# For production, use Let's Encrypt
certbot certonly --webroot -w /var/www/html -d yourdomain.com
```

### SSL Parameters

| Parameter | Value |
|-----------|-------|
| Protocols | TLSv1.2, TLSv1.3 |
| Certificate | `/etc/nginx/ssl/cert.pem` |
| Private Key | `/etc/nginx/ssl/key.pem` |
| HTTP/2 | Enabled |

---

## Security Headers

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS protection |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer control |
| `Content-Security-Policy` | `default-src 'self'; ...` | Content security |

---

## Compression

| Setting | Value |
|---------|-------|
| Enabled | `on` |
| Level | 6 |
| Proxied | `any` |
| Types | text/plain, text/css, application/json, application/javascript, text/xml, application/xml, text/javascript, image/svg+xml |

---

## Caching

### Static Assets

```nginx
location /_next/static/ {
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### Health Checks

```nginx
location /api/health {
    access_log off;
}
```

### Proxy Cache

```bash
# Create cache directory
docker volume create nginx-cache

# Cache configuration (add to http block)
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=100m;
```

---

## WebSocket Support

```nginx
location / {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_cache_bypass $http_upgrade;
}
```

WebSocket connections are supported for:
- Socket.IO real-time updates
- Live collaboration features
- Server-sent events

---

## Rate Limiting

### Add to nginx.conf

```nginx
http {
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app:3000;
        }

        # Login rate limiting
        location /api/auth {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://app:3000;
        }
    }
}
```

### Rate Limit Values

| Endpoint | Rate | Burst | Purpose |
|----------|------|-------|---------|
| `/api/*` | 10r/s | 20 | General API |
| `/api/auth` | 5r/m | 3 | Authentication |
| `/*` | 30r/s | 50 | General traffic |

---

## Commands

### Validate Configuration

```bash
docker compose exec nginx nginx -t
```

### Reload Configuration

```bash
docker compose exec nginx nginx -s reload
```

### View Nginx Logs

```bash
docker compose logs -f nginx
docker compose exec nginx cat /var/log/nginx/access.log
docker compose exec nginx cat /var/log/nginx/error.log
```

### Test SSL

```bash
curl -I https://yourdomain.com
openssl s_client -connect yourdomain.com:443 -tls1_2
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| HTTP redirect | `curl -I http://localhost` | 301 to HTTPS |
| HTTPS response | `curl -I https://localhost` | HTTP 200 |
| SSL certificate | `openssl s_client -connect localhost:443` | Valid certificate |
| Security headers | `curl -I https://localhost` | All security headers present |
| Compression | `curl -I -H "Accept-Encoding: gzip" https://localhost` | Content-Encoding: gzip |
| WebSocket | `curl -I -H "Upgrade: websocket" https://localhost` | Connection upgrade |
| Static cache | `curl -I https://localhost/_next/static/*` | Cache-Control: public, immutable |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| 502 Bad Gateway | `docker compose logs nginx` | Verify app container is running on port 3000 |
| SSL errors | `docker compose exec nginx nginx -t` | Verify certificate files exist and are valid |
| WebSocket fails | Check `Upgrade` header | Verify proxy_set_header directives |
| Slow responses | `docker compose exec nginx cat /var/log/nginx/access.log` | Check proxy_read_timeout, upstream health |
| Rate limit 429 | Check rate limit zones | Adjust rate/burst values |
| Large file upload fails | Check `client_max_body_size` | Increase from default 1M to 100M |
