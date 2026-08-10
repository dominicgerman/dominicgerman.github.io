---
title: Virtiofs
pubDate: 2026-06-24
tags:
  - proxmox
  - homelab
---

After using TrueNAS for a while, I got tired of it and went back to just using Proxmox as my NAS. It's already got ZFS and it's trivially easy to install something like Cockpit File Sharing if you want a GUI for managing SMB shares. I installed Cockpit on an LXC and passed all my zfs datasets into the container as mount points and it works like a dream.

I have always wished I could do the same kind of thing with VMs -- just pass through some zfs datasets that live on the host. Turns out you kind of can with Virtiofs. It's a special file system designed specifically to let guest virtual machines access a host's local directory tree with almost no overhead. It uses `virtio` and shared memory instead of network protocols like SMB or NFS to allow host-level ZFS datasets to be mounted directly inside a VM as if they were local drives.

Today I'm using it because it supposedly supports `inotify` which will come in handy for the "consume" directory for paperless-ngx. Paperless-ngx is a docker container I'm running for digitizing paper documents like taxes, receipts... basically anything you might keep in a file cabinet. 

On Proxmox host:

```bash
mkdir -p /appdata/paperless/consume

```

Tell Proxmox that this specific host directory is allowed to be shared with virtual machines:

**Datacenter** > **Directory Mappings** > **Add**:
* **ID:** `paperless_consume` (This acts as the "tag" the VM will look for).
* **Path:** `/appdata/paperless/consume` (The absolute path on your Proxmox host).

**docker-vm** > **Hardware** > **Add** > **Virtiofs**:
* **Directory ID:** Select `paperless_consume` from the dropdown.
* **XATTR Support:** Checked (Recommended for Linux permissions).
* **Direct IO:** Optional (Leave unchecked unless you run into caching issues with heavy concurrent writes).

Reboot the VM. Debian 13 handles the rest automatically without needing to install external tools because the `virtiofs` kernel driver is baked in.

Inside docker-vm:

```bash
mkdir -p /mnt/paperless/consume

```

In your `/etc/fstab`:

```txt
paperless_consume /mnt/paperless/consume virtiofs defaults,nofail 0 0

```

At this point, you can map your Paperless-NGX Docker container's consume volume directly to `/mnt/paperless/consume`. Because it uses Virtiofs, iNotify will instantly trigger processing the moment a file drops in!