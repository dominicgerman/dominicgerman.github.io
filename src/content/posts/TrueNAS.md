---
title: TrueNAS
pubDate: 2026-09-07
tags:
  - homelab
  - linux
draft: false
---
I thought I would stick with Proxmox for my storage server but alas, I'm back on TrueNAS. I'm likely the only reader of my blog and therefore, I'll recount to you, future Dom, what led you to this decision.

TLDR, it's because you love tinkering. Left to your own devices, you'd tinker with your Proxmox NAS until the end of time -- learning more about ZFS tuning, playing around with different hardware configurations, etc. But _you_ want to do other stuff in your homelab besides storage servers. And that means that ultimately, you need an appliance.  

You seriously considered saving up for a Unifi UNAS Pro. After all, there's basically no way to tinker with it. It has a few really cool features like sharing public links for files on your NAS a la Dropbox, support for AD/Entra and other identity providers, and it has seven drive bays which would be (probably) the perfect number for your 14TB drives. 70TB (I think) of usable space with 2 for parity? Honesly, I feel like I'm talking myself into it right now.

But it doesn't have ZFS, it doesn't have NVME storage, and you already have a 12-bay rackmount NAS build that works great for your needs.

So here you are back on TrueNAS. You learned a lesson from your last TrueNAS adventure though:

> Don't use TrueNAS for anything other than storage.

Don't run containers or VMs. Don't get too fancy with networking. Just let it be a storage backend that you barely touch. Screwing around with those Incus containers is almost certainly what fucked up your 10G link. I don't even want to know why that was happening at this point. Anyway, hope things are going well for you right now.