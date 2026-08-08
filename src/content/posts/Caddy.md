---
title: Caddy
pubDate: 2026-01-21
tags:
  - homelab
draft: false
---

# Caddy

I just installed the apt version first so I wouldn't have to fuss with systemd
```sh
sudo apt install caddy
```

Then I [downloaded a caddy binary](https://caddyserver.com/download?package=github.com%2Fcaddy-dns%2Fcloudflare) with cloudflare-dns module already installed and copied it to `/tmp/caddy` on `beelink`. 

Replaced original caddy binary with the newly downloaded one:
```sh
sudo systemctl stop caddy
sudo mv /tmp/caddy /usr/bin/caddy
sudo chmod +x /usr/bin/caddy
sudo systemctl start caddy
```

Made sure the module was there:
```sh
caddy list-modules | grep "cloudflare"
```

I already had a cloudflare api token that could edit DNS. Added it to the caddy systemd environment

```sh
sudo systemctl edit caddy
```

```ini
[Service]
Environment=CLOUDFLARE_API_TOKEN=your_token_here
```

```sh
sudo systemctl daemon-reexec
```

Then configured Caddyfile at `/etc/caddy/Caddyfile`:
```txt
mydomain.example.com {
    reverse_proxy localhost:8080

    tls {
        dns cloudflare {env.CLOUDFLARE_API_TOKEN}
    }
}
```

Restarted systemd service:
```sh
sudo systemctl restart caddy
```

And pointed my Cloudflare DNS record at the Tailscale IP for the node running Caddy.