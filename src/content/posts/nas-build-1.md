---
title: Building a NAS with Mergerfs and SnapRAID
# description: For my Linux ISOs.
pubDate: 2025-01-24
tags:
  - linux
  - homelab
  - hardware
draft: false
---
Today I put together a NAS that I hope to use for a while. For now, it will be my main storage target but hopefully soon, it will become my backup. I have two cases but only one CPU/motherboard. I want to reserve the bigger, better case for a better system so for now, this mostly free, slightly janky system will do. It's a tight fit with the motherboard, power supply and drives so I'm avoiding HDDs altogether in this build. I don't have a lot of data (yet) so I'm only installing two drives for data — a 2TB Crucial BX500 SSD and a 1TB Crucial P3 SSD that I'll use for Time Machine backups.

The nice thing about this setup is that I can add more SSDs as my needs grow since I'll be using [mergerfs](https://github.com/trapexit/mergerfs) which allows me to make multiple mismatched sized drives appear as one single volume. It's a union filesystem that supports addition and removal of drives with no rebuild times. It doesn't come with parity so I'll also be using SnapRAID for parity once I have more drives.

My apologies if the rest of this post is a little dull — it's largely going to be documentation for what I did so that I can refer back to it if needed. It's largely based on Alex Kretzschmar's [awesome guide](https://perfectmediaserver.com/03-installation/manual-install-proxmox/) to setting up a media server with Proxmox as the host.


## Proxmox
---
I installed Proxmox on a 128GB NVMe drive. After rebooting, I ran the Proxmox VE Post Install script from the awesome [Proxmox helper scripts repo](https://community-scripts.github.io/ProxmoxVE/scripts). It provides options for managing Proxmox VE repositories, including disabling the Enterprise Repo, adding or correcting PVE sources, enabling the No-Subscription Repo, adding the test Repo, disabling the subscription nag, updating Proxmox VE, and rebooting the system.

```bash
bash -c "$(wget -qLO - https://github.com/community-scripts/ProxmoxVE/raw/main/misc/post-pve-install.sh)"
```

The version of mergerfs from the Debian upstream repos significantly lags behind the most recent release available on Github so I opted to use the command below which will query the Github API for the latest release, query my local OS for which release I'm running and then download the correct `.deb` package before installing it with `dpkg`.

```bash
curl -s https://api.github.com/repos/trapexit/mergerfs/releases/latest | grep "browser_download_url.*$(grep VERSION_CODENAME /etc/os-release | cut -d= -f2)_$(dpkg --print-architecture).deb\"" | cut -d '"' -f 4 | wget -qi - && sudo dpkg -i mergerfs_*$(grep VERSION_CODENAME /etc/os-release | cut -d= -f2)_$(dpkg --print-architecture).deb && rm mergerfs_*.deb
```

After it ran successfully, I set it up to run on a cron job every few months. Otherwise the package will never update since I'm not using the repo version.


## Storage
---
Then it was time to get my main data drive set up. I ran `inxi -xD` to make sure it was showing up. Then I used `gdisk` to create one large partition spanning the whole drive and `mkfs.ext4 /dev/sda1` to create an ext4 filesystem. Then I created a mountpoint for my data disk as well as a mountpoint for my mergerfs pool:

```bash
mkdir /mtn/disk1
mkdir /mnt/storage
```

Lastly, I added entires to my `/etc/fstab` file for my data disk and mergerfs pool:

```
# <file system> <mount point> <type> <options> <dump> <pass>
/dev/disk/by-id/ata-CT2000BX500SSD1_2427E8BA6593-part1 /mnt/disk1 ext4 defaults 0 0
/mnt/disk* /mnt/storage fuse.mergerfs defaults,nonempty,allow_other,use_ino,cache.files=off,moveonenospc=true,dropcacheonclose=true,minfreespace=200G,fsname=mergerfs 0 0
```

The options in that mergerfs `fstab` entry just set some sane defaults. I ran `mount -a` to reload the `fstab` entries and `df -h` to verify the mountpoints:

```plaintext
root@rackchoice:~# df -h
Filesystem            Size  Used Avail Use% Mounted on
/dev/sda1             1.8T   28K  1.7T   1% /mnt/disk1
mergerfs              1.8T   28K  1.7T   1% /mnt/storage
```


## Docker, Samba, and NFS
---
I installed Docker by running `curl -fsSL https://get.docker.com | sh` and Samba by running `apt install samba`. I then created a file at `/etc/samba/smb.conf` that looked like this:
```
[global]
    workgroup = DCG
    server string = rackchoice_samba
    security = user
    guest ok = yes
    map to guest = Bad Password
    log file = /var/log/samba/%m.log
    max log size = 50
    printcap name = /dev/null
    load printers = no

# Samba Shares
[storage]
    comment = Primary Storage
    path = /mnt/storage
    browseable = yes
    read only = no
    guest ok = yes

[TimeMachine] 
	comment = TimeMachine backups
	path = /mnt/timemachine 
	valid users = timemachine 
	writeable = yes 
	vfs objects = catia fruit streams_xattr 
	fruit:time machine = yes 
	browseable = yes
```

At this point, I realized two things:
1. I hadn't mounted my second NVMe drive in my system that I was using for Timemachine backups
2. I had been doing everything as root and I needed to create a `dominic` user and a `timemachine` user.

So I ran the following commands:
```bash
sudo mkdir -p /mnt/timemachine
sudo chmod -R 777 /mnt/timemachine
adduser timemachine
smbpasswd -a timemachine
smbpasswd -e timemachine
mount /dev/nvme1n1p1 /mnt/timemachine/
adduser dominic
smbpasswd -a dominic
smbpasswd -e dominic
systemctl restart smbd
```

I also added the timemachine mountpoint to my `/etc/fstab`.

## Conclusion
---
And that's it! The NAS is up and running. I connected to the SMB share with my Mac as well as a Raspberry Pi on my network. The next step is to get my media files transferred over and then [deploy Jellyfin on my k3s cluster (with FluxCD)](/posts/14) and point it at the Samba share.