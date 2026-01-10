---
title: Building a Deployment Pipeline for my Blog
# description: The old fashioned way.
pubDate: 2025-02-12
tags:
  - programming
  - automation
  - golang
draft: false

---
This is a follow-up to my previous post on [building a blog with Go](/posts/4). In it, I'll go over how I host my blog on a Raspberry Pi in my basement. In order to explain in it in a linear way, I'll walk through the deployment pipeline I have set up. But before I do that, I'll talk about some issues I had with SQLite and compiling my code to run on my pi.

[Here's the code](https://github.com/dominicgerman/dominicgerman.com) for my blog.

## Sqlite

---
Back when I was first trying to get the blog to run on my Raspberry Pi, I didn't quite understand this command:

`CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o web`

 I was encountering errors like `undefined: sqlite3.Error` and `undefined: sqlite3.ErrConstraint` However, when I checked the file where there error is coming from, those two variables were defined and the code compiled just fine in my development environment. It turned out that there were two issues:
 
 1. `CGO_ENABLED=0` disables CGo, but my code depended on the `sqlite3` package which relies on CGo to interface with SQLite's C library, and when `CGO_ENABLED=0` was set, it was preventing any C code from being compiled.
 2. `GOARCH=amd64` was the wrong architecture for my Raspberry Pi. I knew this but somehow my eyes kept reading it as `GOARCH=arm64`.

I really lost the script for a while on this one. I tried a bunch of things before I realized my mistakes. I also needed to install the `gcc` and `libsqlite3-dev` packages on my Raspberry Pi. 

So in the end, it's not a perfectly portable blog app. But I learned a lot and it's still pretty cool to have the database and UI embedded in the binary.


## Deployment pipeline
---
I just recently redid my deployment pipeline to simplify things a little. It's probably not going to be a permanent solution as I plan on deploying my blog to my Kubernetes cluster in the not-too-distant future. Here's an overview of how the new pipeline works:

- Code is pushed to `main` branch on Github
- Github shoots a webhook to a URL I specified. Cloudflare handles DNS for that URL and it passes the request on to my Raspberry Pi via a Cloudflare tunnel.
- The `cloudflared` service on my pi passes this onto Caddy which acts as a reverse proxy for the services running on my pi. 
- If it's the webhook path, Caddy forwards the request to a Node.js program running as a systemd service. All other paths are handled by the blog application which is my Go app running in a separate systemd service.
- The Node.js program validates the webhook against a secret stored in an environment variable on the pi. If it validates successfully, the program executes the `deployprod.sh` script in my Go application's `scripts` directory.
- The `deployprod.sh` script does the following:
	- Pulls down changes from `main`
	- Runs the `buildprod.sh` script that builds my blog for arm64
	- Restarts the systemd service that is running my blog
	- Purges the cloudflare cache for my domain via an API call to Cloudflare. This is because Cloudflare caches files like `main.css` and if I don't bust the cache, my website may be left in an undesirable visual state.


## Key lessons learned
---
There were several bumps in the road to getting the pipeline up and running. Here are a few of them and what I learned in the process:

 - I had to edit sudoers file for my `deployprod.sh` to run without requiring a password
 - After updating and rebooting my pi, I had an old version of my blog that started via systemd on the same port I use for my current blog. This prevented my current blog app from starting since the port was already in use. This made my *old* blog appear at my domain which freaked me out a little. But when I realized what was going on, I just disabled that service and restarted my current blog service and everything worked again.
 - Setting up the first iteration of the webook was straightforward enough. I went with a Node.js server to handle the webhook rather than coupling that functionality to the blog app itself.
 - Adding the ability to validate github's webhook via a secret was a little trickier to get working. But Github provides a long code snippet in JS for validating the secret so I just pasted that into my webhook.js program. I generated a secret using `openssl rand -base64 32`.
 - My webhook wasn't running the deploy script correctly and it took a while for me to realize that it was due to an incorrect working directory value in my systemd webhook.service config. I also needed to add environment variables for the `cloudflare_zone_id`, and `cloudflare_token` to get the cache purge working.

Overall, not a bad solution! The next step would be to codify the server environment and dependencies in an Ansible playbook so that if I want to move this site off of my pi and onto another machine, I can just run the playbook on the new machine, clone the blog repo (and webhook repo) and I'll be off to the races. I have been thinking of turning my Raspberry Pi into a PiKVM so that I can have remote management of my two main storage servers. So maybe this Ansible playbook will happen sooner rather than later.