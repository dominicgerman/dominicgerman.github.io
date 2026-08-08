---
title: Jellyfin
pubDate: 2026-02-01
tags:
  - homelab
draft: false
---
Jellyfin is my media server software of choice. It's free, open source, and growing rapidly in terms of adoption and development. It has two components -- a server application, and client applications.

## Server

Linuxserver.io has a [Docker image](https://docs.linuxserver.io/images/docker-jellyfin/) with instructions on how to set it up.

Create a folder for your jellyfin files (config, cache, etc) to live.

```sh
mkdir /home/dominic/jellyfin
chown -R 1000:1000 /home/dominic/jellyfin
```

Then create a `compose.yml` in the `jellyfin` folder.

```yaml
services:
  jellyfin:
    image: lscr.io/linuxserver/jellyfin:latest
    container_name: jellyfin
    devices: 
      - /dev/dri:/dev/dri
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/Chicago
      - JELLYFIN_PublishedServerUrl=http://<IP-ADDRESS>
    volumes:
      - /home/dominic/jellyfin:/config
      - /mnt/nas/media/tv:/data/tvshows
      - /mnt/nas/media/movies:/data/movies
      - /mnt/nas/media/kids:/data/kids
    ports:
      - 8096:8096
    restart: unless-stopped
```

Run `docker compose version` to make sure you have docker compose on your server.

Then from your `jellyfin` directory, start the container.
```sh
docker compose up -d
```

You should now be able to setup Jellyfin at the server's IP address on port `8096`.

If you have a permissions error, make sure you're in the `docker` group. Don't run the above command as root, it can cause problems with permissions such that Jellyfin can't write to the directories it needs to initialize the setup wizard. This happened to me once where it essentially just skipped right over the setup wizard to the login screen. Took a while to figure out what I had done wrong.

## Clients

While Jellyfin is primarily a server application, the project has a number of different client applications in constant development. Some of them are great, others aren't. There are several things to consider that will influence your decision to use one app over another.

I look at client applications as falling into two main buckets: home theater setups, and everything else. For me, I do most of my media consumption in my basement home theater. It's not that fancy but it does have 5.1 Surround and a 75" HDR display. It also has a fast internet connection since it's on my WiFi network. That means I want to be able to direct-play 4K HDR content with Dolby DTS/HD audio tracks. I also want subtitle tracks to just work regardless of format.

Since I use an Apple TV, I tried Jellyfin's Swiftfin application for tvOS but quickly switched to Infuse Pro which is very affordable third-party client application that has all the features mentioned above and thus solves all sorts of problems. Well worth it if you ask me.

However, it's worth mentioning that Infuse only direct plays files in your library -- it bypasses Jellyfin's transcoding pipeline completely. This means you need plenty of bandwidth to play files with a large bitrate (e.g. 4K HDR content). While this works great for local playback on my LAN, it's not great if I'm trying to stream remotely.

I have a few friends and family members who have access to my Jellyfin server and if they don't have a strong enough internet connection, they won't be able to stream certain files. For uncompressed 4K rips, they'll need about 100 Mbps. If that's not possible, they'll need an app that supports Jellyfin's transcoding pipeline.

I use Tailscale for accessing Jellyfin remotely so I recommend Amazon's Firestick as an Apple TV alternative for remote home theater setups. Firestick supports Tailscale and its Jellyfin client app is way better than Swiftfin. Roku and many "smart" TVs do not support Tailscale which is a deal-breaker for me.