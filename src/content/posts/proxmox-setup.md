---
title: Proxmox Setup Notes
pubDate: 2026-01-12
tags:
  - homelab
draft: false
---
Here are some of the notes I took when setting up my first Proxmox host. They are still quite useful to me so I'm leaving them here since I don't know where else to put them. They mostly come from the [excellent tutorial](https://perfectmediaserver.com/03-installation/manual-install-proxmox/) from Alex Kretzschmar for his "Perfect Media Server".

## Proxmox

[Download the Proxmox iso](https://www.proxmox.com/en/downloads) and verify the checksum:

```sh
shasum -a 256 /path/to/downloaded/iso
```

Flash it to a USB drive and then boot from it. During the setup process, you'll be asked to specify several things like the hostname, IP address, and an email address. The hostname is just something for proxmox to use internally but I usually use a FQDN that I own with a reverse proxy.

Run the Proxmox VE Helper Script to disable the subscription nag as well as enterprise features like HA and Ceph. I usually disable the "enterprise" and "test" repos, and then enable the "no-subscription" repo. If you leave the enterprise repo enabled, you may run into issues when updating packages.

```sh
bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/tools/pve/post-pve-install.sh)"
```

Now is a good time to install `sudo`, `vim`, and any other packages you want.

```sh
apt update
apt install sudo vim curl htop -y
```

Give yourself a username and password:

```sh
useradd -m -s /bin/bash dominic
```

```sh
passwd dominic
```

Put yourself in the sudo group and give yourself some special Proxmox permissions:

```sh
usermod -aG sudo dominic
pveum useradd dominic@pve -comment "New Admin User"
pveum aclmod / -user dominic@pve -role Administrator
```

> ### Optional: Transfer SSH key
>
> You likely already have an ssh key on your personal computer. If you're on a Mac, you can run the following commands from your Mac's terminal so that you can log into your server without a password:
>
> ```sh
>    # clear any existing ssh keys for your server's hostname or IP address
>    ssh-keygen -R <your-hostname-or-ip>
>```
>
>```sh
>  # copy public key from mac to server 
>    ssh-copy-id <your-user>@<your-hostname-or-ip>
>    ```

## Docker

I've been running my Docker containers directly on the Proxmox host for a while and have never had any issues. I know it would be better to run Docker inside an LXC container (lightweight, OS-level virtualization) but it's more complicated and most of the time I just don't give a fuck. It would be nice for backups though.

Install docker:

```sh
curl -fsSL https://get.docker.com | sh
```

Check your user's `uid` and `gid` as well as the groups they are in:

```sh
id dominic
```

```sh
groups dominic
```

Add your user to the docker group so that you can run docker commands without being root:

```sh
sudo usermod -aG docker dominic
```

