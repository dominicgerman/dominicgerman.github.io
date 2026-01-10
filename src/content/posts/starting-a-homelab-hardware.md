---
title: "Starting a Homelab: Hardware"
# description: The fun stuff.
pubDate: 2025-01-16
tags:
  - homelab
  - hardware
draft: false
---

## Background

---
Over the past year, I fell down the homelabbing rabbit hole. A few things happened that got me interested:

1. I was building my own applications and wanted a cost-effective way to host them. 
2. I had just started learning about CI/CD pipelines and Kubernetes clusters and I wanted to practice building my own.
3. I got a job in IT that exposed me to networking and virtualization software and I wanted to learn more about how those things worked.

 In short, I wanted an environment for hands-on learning where I could build things without breaking the bank and break things without bringing down production. Also, let's be real, I wanted to buy a bunch of toys. I figured I could justify the expense if I built a home server/NAS that could replace a few subscriptions like Dropbox.

Before I even knew what a homelab was, I stumbled across [Jeff Geerling's Kubernetes cluster of Raspberry Pis](https://www.pidramble.com/) configured with Ansible. I barely knew what any of those words meant at the time but I loved building things and tinkering so I bought three Pis and a network switch and dove right in. I didn't know anything about computer hardware, networking or Infrastructure as Code but I managed to get the thing working after several days. I kept that cluster running for a few months before breaking it down to try building some [other fun projects](/posts/2). 

After my first experiment with pis, I decided I would start investing in some more capable hardware. I did a lot of research and slowly acquired the items below over the course of about nine months. 

## Hardware
---
Pis are awesome but they're pretty limited especially when it comes to storage. I still liked the idea of bare-metal Kubernetes clusters so I bought three Beelink EQ12 mini PCs for $200 each. 

![[eq12.jpeg]]

Each node has an Intel N100 processor, dual 2.5 gig ethernet ports, 16GB of DDR5 memory, and an m.2 slot with a 500GB NVMe drive. There's also room for one 2.5" SATA SSD. I wanted to run Jellyfin on my cluster and the N100 is a perfect chip for a media server since it comes with Intel’s newest UHD graphics and Intel QuickSync. It also sips power which is great since these nodes will spend most of their time sitting idle. 

### Storage
---
However, I still wanted a NAS and mini PCs aren’t well suited for this. My brother had a retired gaming PC that he was kind enough to ship to me. In the box was an Intel Core-i5 9600K processor and a micro-ATX B360M motherboard with 6 SATA ports. There was also an ATX power supply (non-modular) and an 8GB stick of DDR4 memory. I decided I would install Proxmox after researching the CPU and realizing it was more than capable of running a few VMs. So I bought a couple 4TB hard drives ($100 each), a 1TB NVMe drive ($100), a 256GB boot drive ($20), a 2.5G network card ($30), 64GB of DDR4 (about $100), and a used 2u server chassis on Facebook Marketplace for $80. It was definitely a tight fit. 

![[rackchoice.jpeg]]

The case is really designed for a mini-ITX motherboard and modular SFX power supply. But those aren't free! 

## Networking and a rack
---
I had no networking gear before I bought the PoE switch that was part of the Raspberry Pi cluster build. I also had nowhere to put my 2u server chassis. So I decided to build my own rack out of plywood and [these rack rails](https://a.co/d/c93lF60). I may make a separate post about that as it was a really fun project. Since I had 2.5 gigabit NICs on my servers, I decided to upgrade my router to a [Unifi Cloud Gateway Max](https://store.ui.com/us/en/category/cloud-gateways-compact/collections/cloud-gateway-max) from Ubiquiti. I also picked up a [Flex Mini 2.5G](https://store.ui.com/us/en/category/all-switching/products/usw-flex-2-5g-5). After installing a patch panel and some server shelves, my homelab was starting to look pretty cool:

![[rack.jpeg]]

## Looking ahead
---
The keen-eyed reader may have noticed two other items in the above picture that I didn't mention: a Dell Optiplex 7090 and a 4u Rosewill LSV-4500U server chassis. I found the Rosewill case a few weeks ago on Facebook Marketplace for only $100. The Optiplex I got for free from work since the display port is not working. 

My same brother who sent me the retired gaming PC has a box of old hard drives that he's donating to me. Since the Rosewill case has space for 15 drives, I'm going to create a giant pool of mismatched drives using mergerfs and SnapRAID. I'll use that pool for storing anything that isn't mission critical. I'm also interested in installing an older Xeon CPU, probably something from the LGA 2011 platform. They offer tons of PCIe lanes with bifurcation, tons of cores, and quad-channel ECC memory -- all of which are missing from my Core-i5 system -- for very little money. Stay tuned for that.

I also picked up a brand new Jonsbo N2 case for $25. I'm going to use that to build a NAS with my other brother. He'll be glad to have a NAS and I'll be glad to have an offsite backup. As for the Optiplex, it has a 10th gen Core-i7 so I may just install Linux on it and use it as a workstation if I can get at least one of the display ports to work.
