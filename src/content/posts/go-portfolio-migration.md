---
title: Migrating my Blog and Deployment Pipeline
pubDate: 2025-07-11
tags: ['programming', 'go', 'linux']
---

I recently migrated my portfolio/blog site to be hosted on a different node on my LAN.

I installed Go on the node and copied both the db file and the portfolio binary that were on my raspberry pi over to the new node at `/home/github/hosts/dominicgerman.com`. I also created a systemd unit file at `/etc/systemd/system/portfolio.service` which was failing since the binary on my pi was built for arm. So I cloned down from dominicgerman.com into my user's home directory, built the app, copied the binary to `/usr/local/bin/portfolio` which is where systemd is expecting it, and now it's running on the specified port. I also got cloudflare pointed at the new node's tunnel.

### The next day...

I worked on getting a deployment pipeline working. I wrote a deploy_portfolio.sh:

```sh
#!/bin/bash

set -e

**LOGFILE**="/tmp/portfolio_deployment_$(date +'%Y%m%d_%H%M%S').log"

{
    echo "=== PORTFOLIO DEPLOYMENT STARTED: $(date) ==="
    cd /home/github/hosts/dominicgerman.com && git pull origin main
    GOOS=linux GOARCH=amd64 /usr/local/go/bin/go build -o portfolio ./cmd/web/
    mv portfolio /usr/local/bin/portfolio
    systemctl restart portfolio.service
    echo "=== PORTFOLIO DEPLOYMENT ENDED: $(date) ==="
} &> "$LOGFILE"

# cat "$LOGFILE" | mail -s "Portfolio Deployment Log for $(date '+%Y-%m-%d')" myemail@example.com
```

It pulls any changes to my portfolio's source code from origin main, builds my portfolio app, replaces the running binary with the newly built version, and restarts the systemd service that runs it.

Once I had that working, I set up a pipeline that would run `deploy_portfolio.sh` whenever there was a push to origin main. To accomplish this, I set up a webhook in my Github repo to fire on pushes to main.

I specified a url for the webhook's payload and a secret for Github to use to create a hash signature that it includes in the headers of each webhook it sends. I then listen for webhook deliveries on my server via a small webhook-server Go app that's running as a systemd service. When a request comes in to the endpoint, my code uses the secret token to calculate a hash and then compare it to the hash included in the headers of the webhook. Thus I can validate that the request came from Github and Github only. When the webhook-server successfully validates a webhook delivery, it runs deploy_portfolio.sh.

None of this would work without Cloudflare Tunnels since I'm self-hosting my app behind my LAN's firewall and Github needs a "public" endpoint it can use for webhook deliveries. The cloudfared service running on my server passes webhook requests to Caddy which is configured to proxy webhook requests to my webhook-server service which is listening on a port I won't specify here.
