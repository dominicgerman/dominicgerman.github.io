---
title: Deploying Jellyfin on k3s (Part 1)
# description: Kubernetes is my love language.
pubDate: 2025-01-29
tags:
  - homelab
  - kubernetes
draft: false
---
In this post, I'm going to try a different format. Rather than go step-by-step through the process I took to set up k3s, I'm going to explain what I tried, where I got stuck, how I solved it, and some [key lessons learned](https://youtu.be/LciJqD74Mc4?si=FYcLrNZxq2Puhc9O&t=844). I'd rather use these posts as high-level documentation of my learning. I figure I don't need to write the code twice -- [it's already in Github](https://github.com/dominicgerman/k3s-homelab), no need to put it all here too.


## What I tried
---
## The Goal
---
In my last post, I [built a NAS with Mergerfs and SnapRAID](/posts/13). Rather than running containers directly on the NAS, I wanted to challenge myself to run my services in a Kubernetes cluster. I also wanted to learn the GitOps tool FluxCD and use Ansible as much as possible. Turns out that's a lot to try to learn at once. 

I got the FluxCD controller setup on my cluster and tested it using Flux's QuickStart guide which was great by the way. Then I used ChatGPT to generate some Kubernetes manifests for Jellyfin {deployment,service,pvc,pv}.yaml files and pushed them to the repo flux was watching. 

Of course, the manfiests weren't perfect on the first try so debugging was needed. But I had way too many types of things that either broke or could have been the problem that I just couldn't make progress. There were so many problems I don't even know where to begin. It's better to work from the key lessons learned backwards:
1. K3S doesn't ship with an NFS storageClass so you have to create your own. There are various ways to do this including helm charts but all I needed was a `storageclass.yaml`
2. NFS utilities need to be installed at the Ubuntu level on all three nodes. I hadn't manually tested if my nodes could mount the NFS share on my NAS.
3. I can expose containers via a load balancer service rather than an ingress or node port. And that's what MetalLB is 🤯
4. You don't need to create PVs for dynamically provisioned storage like `local-path` which comes with k3s. You do need to write your own PVs for manually defined storage like my NFS share.
5. You need to restart pods after you apply changed yaml files.
6. There are a few awesome gpu testing tools I used to get some visibility into whether hardware transcoding was taking place or not on my node.
7. ChatGPT is like reading a bespoke tutorial for whatever you're trying to do but it's full of mistakes. But when you know it's full of mistakes you can just ask it questions to help you figure out if you're on the right track or not. You don't have to rely on it's code. In fact it's code will only ever be useful to you if you can tell GPT _exactly what you want_ and it's something that has been done a lot on the internet like example config files. But you'll inevitably need to change the code it gives you so if it's too specific a need for GPT to get first try, you're better off just learning how to write the code yourself. 

I wanted to power through but then I decided it would be smarter to to just remove Flux and try to get Jellyfin up and running manually first. Then I'd be able to codify it in Flux once I was happy with the result. This turned out to be a great solution because I was able to focus on debugging each problem one at a time and it only took an afternoon to get Jellyfin running on my cluster. I'm going to share that process in the rest of this post. In the next post, I'll hopefully explain how I set up FluxCD to manage my deployments.


### NFS

In my last post, I [built a NAS with Mergerfs and SnapRAID](/posts/13). Rather than running containers directly on the NAS, I wanted to challenge myself to run my services in a Kubernetes cluster. I also wanted to learn the GitOps tool [FluxCD](https://fluxcd.io/flux/) and use Ansible as much as possible. 

First, I provisioned a k3s cluster using [this awesome Ansible playbook](https://github.com/dominicgerman/k3s-ansible). I just followed the quick start guide and it worked like a dream. Then I got the FluxCD controller setup on my cluster and tested it using Flux's [Getting Started guide](https://fluxcd.io/flux/get-started/) which was great by the way. Then I used ChatGPT to generate some Kubernetes manifests for Jellyfin {deployment,service,pvc,pv}.yaml files and pushed them to the repo flux was watching. 


## Where I got stuck
---
Of course, the manifests weren't perfect on the first try so debugging was needed. But I had way too many types of things that either broke or could have been the problem that I just couldn't make progress. The main issue I ran into was that I couldn't get my nodes to use my NAS as an NFS-backed persistent volume. On top of that, I knew I was doing things wrong with Flux but I didn't know what they were so I couldn't eliminate it as a source of errors.


## How I solved it
---
I wanted to power through but then I decided it would be smarter to to just remove Flux and try to get Jellyfin up and running manually first. Then I'd be able to codify it in Flux once I was happy with the result. This turned out to be a great solution because I was able to focus on debugging each problem one at a time and it only took an afternoon to get Jellyfin running on my cluster. I haven't incorporated Flux yet so I'm going to do that in the very near future.


## Key lessons learned
---
1. K3S doesn't ship with an NFS StorageClass out of the box so you have to create your own. There are various ways to do this including helm charts but all I needed was a `storageclass.yaml`
2. NFS utilities need to be installed at the Ubuntu level on all three nodes. I hadn't manually tested if my nodes could mount the NFS share on my NAS. That would have saved me a lot of time.
3. I can expose containers via a load balancer service rather than an ingress or node port. And that's what MetalLB is 🤯
4. You don't need to create PVs for dynamically provisioned storage like `local-path` which comes with k3s. You *do* need to write your own PVs for manually defined storage like my NFS share.
5. You need to restart pods after you apply changed yaml files.
6. I used an awesome tool to get some visibility into whether hardware transcoding was taking place or not on the node running my Jellyfin container. I ran `apt install intel-gpu-tools` and monitored GPU usage with `sudo intel_gpu_top`.
