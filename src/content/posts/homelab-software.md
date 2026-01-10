---
title: "Starting a Homelab: Software"
# description: Gotta do something with all this hardware.
pubDate: 2025-01-20
tags:
  - homelab
  - linux
  - kubernetes
draft: false
---
## Background
---
As I mentioned in my [first post on starting a homelab](/posts/10), I want to create an environment for hands-on learning where I can build things without breaking the bank and break things without bringing down production. But the reality is that I have been playing around with homelab stuff for over a year. This post is less about starting from scratch and more of an outline of my plans going forward.

## Goals
---
My primary goal on the software side is to learn cloud/DevOps technologies and best practices. I'll focus on the following topics:

- Linux 
- Kubernetes
- Infrastructure as Code/GitOps
- Networking
- Virtualization

I'll never learn these things without practice and there’s no better way to practice than maintaining a “production” environment. To that end, I’ll be self-hosting the following applications/services:

- NAS
- Media server
- Web servers
- Databases
- CI/CD pipelines 

I may also set up some cameras and an NVR as well as some home automation with Home Assistant at some point down the road. I’d also love to self-host some AI chat bots but these are longer-term goals.

### Linux

I'll obviously be running my entire homelab on Linux. Up to this point, my default server distro has been Ubuntu Server and I plan on continuing to use it. However, I plan on defaulting to Proxmox wherever I could potentially run VMs. I find it's a super flexible base-OS since it's really just Debian under the hood. I want to experiment with other distros and VMs make that trivially easy. Definitely easier than [installing Arch Linux on an old ThinkPad](/posts/12).

### Kubernetes

I want to use Kubernetes for as many applications as possible. Since I have three low-power mini PCs, I’m going to set them up in a bare-metal [k3s](https://github.com/k3s-io/k3s/blob/master/README.md) cluster. Since they have integrated Intel UHD graphics, my first goal is to get Jellyfin running. Then I would have a highly available, load balanced Jellyfin server that sips power. I would love to see how many simultaneous streams it could handle, both 1080p and 4k. 

I also want to learn more about running databases on Kubernetes. I’m building an API with Go and Postgres so after that's done, I'll definitely try to get it to work on my cluster.

### Infrastructure as Code & GitOps

I'm going to use Ansible playbooks to [setup each node with Ubuntu Server](https://github.com/dominicgerman/homeserver-ansible) and [bootstrap a k3s cluster](https://github.com/dominicgerman/k3s-ansible) with etcd and MetalLB. I'll likely want to run another cluster of VMs on my Proxmox server, in which case provisioning them with Ansible will be well worth the effort upfront. After that, I'd like to use ArgoCD for all of my deployments on Kubernetes itself. I'm not yet sure if I'll use Helm or plain YAML. 

### Networking

My main goal with networking is to learn about network security. I plan on setting up VLANS for network segmentation. I'm already exposing this self-hosted website to the public internet (via reverse proxies and a Cloudflare Tunnel) and I'd like to share other services (like Jellyfin) with friends and family. I have Wireguard set up on my router but I really want to experiment with a mesh VPN service like Tailscale. That would enable me to share Jellyfin without poking holes in my firewall. I could even add my AWS VPC to my Tailnet in theory.

### Virtualization

I already mentioned Proxmox and that's essentially all I care about right now with virtualization. It's a powerful tool and just want to be able to use it effectively. I plan on virtualizing TrueNAS Scale in the near future -- I just need to acquire a few more pieces of hardware first.

## Optimizing for Done
---
My Achilles' heel is over-architecting and under-implementing. I tend to set lofty goals, start working on them, and then abandon them for some other exciting project. This year, I'm trying to optimize for completion. When I feel myself getting bogged down in the details, striving for perfection, I'll ask myself "how quickly can I ***finish*** this task/section/project?" Because "done" is better than "perfect". If I later decide that "done" wasn't good enough, I can iterate -- that's fine. The worst possible outcome (for me) is not completing the project due to distractions. 

And that's it. I'll be posting about each step along the way in this journey so stay tuned.